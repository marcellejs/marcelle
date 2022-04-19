import type { Request } from 'express';
import type { ServiceAddons } from '@feathersjs/feathers';
import type { Application } from '../../declarations';
import fs from 'fs';
import path from 'path';
import multer, { FileFilterCallback } from 'multer';
import { GridFile, GridFsStorage } from 'multer-gridfs-storage';
import { GridFSBucket, ObjectId } from 'mongodb';
import express from '@feathersjs/express';
import { Models as ModelsNeDB } from './models-nedb.class';
import { Models as ModelsMongoDB } from './models-mongodb.class';
import createModel from '../../models/models-nedb.model';
import hooks from './models.hooks';
import genId from '../../utils/objectid';

type ModelType = 'tfjs' | 'onnx';

function fileFilterTFJS(req: Express.Request, file: Express.Multer.File, cb: FileFilterCallback) {
  const accept =
    ['model.json', 'model.weights.bin'].includes(file.fieldname) ||
    (file.fieldname.includes('shard') && file.fieldname.split('.').pop() === 'bin');

  cb(null, accept);
}

function fileFilterONNX(req: Express.Request, file: Express.Multer.File, cb: FileFilterCallback) {
  const accept = file.fieldname.split('.').pop() === 'onnx';

  cb(null, accept);
}

function setupModelService(app: Application, modelType: ModelType, useGridfs: boolean) {
  if (app.get('database') === 'nedb') {
    const options = {
      Model: createModel(app, modelType),
      paginate: app.get('paginate'),
      multi: true,
      whitelist: ['$not', '$and'],
    };

    // Initialize our service with any options it requires
    app.use(`/${modelType}-models`, new ModelsNeDB(options, app));
  } else if (app.get('database') === 'mongodb') {
    const options = {
      paginate: app.get('paginate'),
      multi: true,
      whitelist: ['$not', '$and'],
    };

    // Initialize our service with any options it requires
    app.use(`/${modelType}-models`, new ModelsMongoDB(options, app, modelType));
  } else {
    throw new Error('Invalid database type: only "nedb" or "mongodb" are currently supported');
  }

  // Get our initialized service so that we can register hooks
  const service = app.service(`${modelType}-models`) as ModelsNeDB & ServiceAddons<any>;

  const h = hooks(app.get('authentication').enabled, modelType, useGridfs);
  service.hooks(h);

  return service;
}

function setupDiskStorage(app: Application, modelType: ModelType) {
  // Setup Model File upload
  if (!fs.existsSync(app.get('uploads'))) {
    fs.mkdirSync(app.get('uploads'), { recursive: true });
  }
  if (!fs.existsSync(path.join(app.get('uploads'), modelType))) {
    fs.mkdirSync(path.join(app.get('uploads'), modelType), { recursive: true });
  }
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(app.get('uploads'), modelType));
    },
    filename: function (req: Request & { id?: string }, file, cb) {
      cb(null, `${req.id}/${file.fieldname}`);
    },
  });
  return storage;
}

function setupGridFsStorage(app: Application) {
  const storage = new GridFsStorage({ db: app.get('mongoClient') });
  return storage;
}

export default (modelType: ModelType): ((app: Application) => void) => {
  const fileFilter = modelType === 'tfjs' ? fileFilterTFJS : fileFilterONNX;

  return function (app: Application): void {
    const useGridfs = app.get('database') === 'mongodb' && app.get('gridfs');
    const service = setupModelService(app, modelType, useGridfs);

    let storage;
    if (useGridfs) {
      storage = setupGridFsStorage(app);
    } else {
      storage = setupDiskStorage(app, modelType);
    }

    const upload = multer({ storage, fileFilter });
    const modelUpload = upload.any();

    const diskPostPrepare = (req: Request & { id?: string }, res: any, next: any) => {
      req.id = genId();
      fs.mkdirSync(path.join(app.get('uploads'), modelType, req.id));
      next();
    };

    const diskPostResponse = function (req: Express.Request & { id?: string }, res: any) {
      const response: Array<[string, string]> = [];
      if (Array.isArray(req.files)) {
        req.files.forEach(({ originalname, filename }) => {
          response.push([originalname, filename]);
        });
      } else {
        Object.entries(req.files || []).forEach(([name, x]) => {
          response.push([name, x[0].filename]);
        });
      }
      res.json(response);
    };

    const gridfsPostResponse = function (req: Express.Request, res: any) {
      const response: Array<[string, string]> = [];
      if (Array.isArray(req.files)) {
        const reqFiles = req.files as (Express.Multer.File & GridFile)[];
        reqFiles.forEach(({ originalname, id }) => {
          response.push([originalname, id]);
        });
      } else {
        const reqFiles = (req.files || []) as Record<string, (Express.Multer.File & GridFile)[]>;
        Object.entries(reqFiles).forEach(([name, x]) => {
          response.push([name, x[0].id]);
        });
      }
      res.json(response);
    };

    const postMiddlewares = [];
    if (app.get('authentication').enabled) {
      postMiddlewares.push(express.authenticate('jwt'));
    }
    if (!useGridfs) {
      postMiddlewares.push(diskPostPrepare);
    }
    postMiddlewares.push(modelUpload);
    postMiddlewares.push(useGridfs ? gridfsPostResponse : diskPostResponse);

    app.post(`/${modelType}-models/upload`, ...postMiddlewares);

    const getModelFileFromDisk = async (req: any, res: any) => {
      try {
        const model = await service.get(req.params.id, req.feathers);

        const foundFile = model.files.filter(([fname]: [string]) => fname === req.params.filename);
        if (foundFile.length === 1) {
          const fileName = foundFile[0][1];
          const filePath = path.join(app.get('uploads'), modelType, fileName);
          if (!fs.existsSync(filePath)) {
            return res.status(404).json({
              err: 'file does not exist',
            });
          }
          return res.sendFile(filePath);
        } else {
          return res.status(404).json({
            err: 'file does not exist',
          });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('model download error', error);
        return res.status(404).json({
          err: 'file does not exist',
        });
      }
    };

    // eslint-disable-next-line consistent-return
    const getModelFileFromGridfs = async (req: any, res: any) => {
      try {
        const bucket = app.get('mongoBucket') as GridFSBucket;
        const model = await service.get(req.params.id, req.feathers);
        const foundFile = model.files.filter(([fname]: [string]) => fname === req.params.filename);
        if (foundFile.length === 1) {
          const fileId = foundFile[0][1];
          bucket.find({ _id: new ObjectId(fileId) }).toArray((err, files) => {
            if (err || !files || files.length === 0) {
              return res.status(404).json({
                err: 'file does not exist',
              });
            }
            return bucket.openDownloadStream(files[0]._id).pipe(res);
          });
        } else {
          return res.status(404).json({
            err: 'file does not exist',
          });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('model download error', error);
        return res.status(404).json({
          err: 'file does not exist',
        });
      }
    };

    const getMiddlewares = [];
    if (app.get('authentication').enabled) {
      getMiddlewares.push(express.authenticate('jwt'));
      // Actually check if the parent model is public or user!
    }
    getMiddlewares.push(useGridfs ? getModelFileFromGridfs : getModelFileFromDisk);

    app.get(
      `/${modelType}-models/:id/:filename`,
      // TODO: add authorization
      ...getMiddlewares,
    );
  };
};
