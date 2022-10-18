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

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    assets: AssetsMongoDB & ServiceAddons<any>;
  }
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
  const service = app.getService('assets');

  const h = hooks(app.get('authentication').enabled);
  service.hooks(h);

  // Setup Model File upload
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

  const postMiddlewares = [];
  if (app.get('authentication').enabled) {
    postMiddlewares.push(express.authenticate('jwt'));
  }
  postMiddlewares.push(diskPostPrepare);
  postMiddlewares.push(assetUpload);
  postMiddlewares.push(diskPostResponse);

  const uploadPath = app.get('apiPrefix').replace(/\/$/, '') + '/assets/upload';
  app.post(uploadPath, ...postMiddlewares);

  const getAssetFileFromDisk = async (req: any, res: any) => {
    try {
      const filePath = path.join(app.get('uploads'), 'assets', req.params.id, req.params.filename);
      if (!fs.existsSync(filePath)) {
        return res.end();
      }
      res.sendFile(filePath);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('asset download error', error);
      return res.status(404).json({
        err: 'file does not exist',
      });
    }
    return res.status(500).json({
      err: 'Internal Server Error',
    });
  };

  const getMiddlewares = [];
  if (app.get('authentication').enabled) {
    getMiddlewares.push(express.authenticate('jwt'));
  }
  getMiddlewares.push(getAssetFileFromDisk);

  const downloadPath = app.get('apiPrefix').replace(/\/$/, '') + '/assets/:id/:filename';
  app.get(downloadPath, ...getMiddlewares);
}
