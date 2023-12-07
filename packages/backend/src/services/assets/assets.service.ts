import fs from 'fs';
import path from 'path';
import multer, { FileFilterCallback } from 'multer';
import type { Request } from 'express';
import express from '@feathersjs/express';
import { Application } from '../../declarations';
import { Assets as AssetsNeDB } from './assets-nedb.class';
import { Assets as AssetsMongoDB } from './assets-mongodb.class';
import createModel from '../../models/assets-nedb.model';
import hooks from './assets.hooks';
import genId from '../../utils/objectid';
import { ServiceAddons } from '@feathersjs/feathers';
import { GridFile, GridFsStorage } from 'multer-gridfs-storage';
import { GridFSBucket, ObjectId } from 'mongodb';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    assets: AssetsMongoDB & ServiceAddons<any>;
  }
}

function setupDiskStorage(app: Application) {
  if (!fs.existsSync(app.get('uploads'))) {
    fs.mkdirSync(app.get('uploads'), { recursive: true });
  }
  if (!fs.existsSync(path.join(app.get('uploads'), 'assets'))) {
    fs.mkdirSync(path.join(app.get('uploads'), 'assets'), { recursive: true });
  }
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(app.get('uploads'), 'assets'));
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

export default function (app: Application): void {
  if (app.get('database') === 'nedb') {
    const options = {
      Model: createModel(app),
      paginate: app.get('paginate'),
      multi: true,
      whitelist: ['$not', '$and'],
    };

    // Initialize our service with any options it requires
    app.declareService('assets', new AssetsNeDB(options, app));
  } else if (app.get('database') === 'mongodb') {
    const options = {
      paginate: app.get('paginate'),
      multi: true,
      whitelist: ['$not', '$and'],
    };

    // Initialize our service with any options it requires
    app.declareService('assets', new AssetsMongoDB(options, app));
  } else {
    throw new Error('Invalid database type: only "nedb" or "mongodb" are currently supported');
  }

  const allowedExtensions = app.get('whitelist').assets || ['jpg', 'jpeg', 'png', 'wav'];
  function fileFilter(req: Express.Request, file: Express.Multer.File, cb: FileFilterCallback) {
    const accept =
      allowedExtensions === '*' ||
      (!!file.fieldname.split('.').pop() &&
        allowedExtensions.includes(file.fieldname.split('.').pop() as string));

    cb(null, accept);
  }

  // Get our initialized service so that we can register hooks
  const useGridfs = app.get('database') === 'mongodb' && app.get('gridfs');
  const service = app.getService('assets');

  const h = hooks(app.get('authentication').enabled);
  service.hooks(h);

  const storage = useGridfs ? setupGridFsStorage(app) : setupDiskStorage(app);
  const upload = multer({ storage, fileFilter });
  const assetUpload = upload.any();

  const diskPostPrepare = (req: Request & { id?: string }, res: any, next: any) => {
    req.id = genId();
    fs.mkdirSync(path.join(app.get('uploads'), 'assets', req.id), { recursive: true });
    next();
  };

  const diskPostResponse = function (req: Express.Request & { id?: string }, res: any) {
    const response: Record<string, string> = {};
    if (Array.isArray(req.files)) {
      if (req.files.length > 0) {
        req.files.forEach(({ originalname, filename }) => {
          response[originalname] = filename;
        });
      } else {
        res.status(400);
        response.error = `The request does not contain any valid file (accepted extensions: ${allowedExtensions})`;
      }
    } else {
      Object.entries(req.files || []).forEach(([name, x]) => {
        response[name] = x[0].filename;
      });
    }
    res.json(response);
  };

  const gridfsPostResponse = function (req: Express.Request, res: any) {
    const response: Record<string, string> = {};
    if (Array.isArray(req.files)) {
      const reqFiles = req.files as (Express.Multer.File & GridFile)[];
      reqFiles.forEach(({ originalname, id, fieldname }) => {
        response[originalname] = `${id}/${fieldname}`;
      });
    } else {
      const reqFiles = req.files as
        | {
            [fieldname: string]: (Express.Multer.File & GridFile)[];
          }
        | undefined;
      Object.entries(reqFiles || []).forEach(([name, x]) => {
        response[name] = `${x[0].id}/${x[0].fieldname}`;
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
  postMiddlewares.push(assetUpload);
  postMiddlewares.push(useGridfs ? gridfsPostResponse : diskPostResponse);

  const uploadPath = app.get('apiPrefix').replace(/\/$/, '') + '/assets/upload';
  app.post(uploadPath, ...postMiddlewares);

  const getAssetFileFromDisk = async (req: any, res: any) => {
    try {
      const filePath = path.join(app.get('uploads'), 'assets', req.params.id, req.params.filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          code: 404,
          err: 'file does not exist',
        });
      }
      return res.sendFile(filePath);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('asset download error', error);
      return res.status(500).json({
        code: 500,
        err: 'Internal Server Error',
      });
    }
  };

  // eslint-disable-next-line consistent-return
  const getAssetFileFromGridfs = async (req: any, res: any) => {
    try {
      const bucket = app.get('mongoBucket') as GridFSBucket;
      bucket.find({ _id: new ObjectId(req.params.id) }).toArray((err, files) => {
        if (err || !files || files.length === 0) {
          return res.status(404).json({
            err: 'file does not exist',
          });
        }
        return bucket.openDownloadStream(files[0]._id).pipe(res);
      });
    } catch (error) {
      return res.status(404).json({
        err: 'file does not exist',
      });
    }
  };

  const getMiddlewares = [];
  // if (app.get('authentication').enabled) {
  //   getMiddlewares.push(express.authenticate('jwt'));
  // }
  getMiddlewares.push(useGridfs ? getAssetFileFromGridfs : getAssetFileFromDisk);

  const downloadPath = app.get('apiPrefix').replace(/\/$/, '') + '/assets/:id/:filename';
  app.get(downloadPath, ...getMiddlewares);
}
