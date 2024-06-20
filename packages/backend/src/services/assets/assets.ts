// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
// import { GridFsStorage } from 'multer-gridfs-storage';
// import multer from '@koa/multer';
import type { Application } from '../../declarations';
import { AssetsService, getOptions } from './assets.class';
import { bodyParser } from '@feathersjs/koa';
import { ObjectId } from 'mongodb';

import { Params } from '@feathersjs/feathers';
import { NotFound } from '@feathersjs/errors';
import assetsHooks from './assets.hooks';

export const assetsPath = 'assets';
export const assetsMethods = ['get', 'create', 'remove'] as const;

export * from './assets.class';

// A configure function that registers the service and its hooks via `app.configure`
export const assets = (app: Application) => {
  // TODO: Handle Disk Upload (gridfs = false)

  // Register our service on the Feathers application
  app.use(assetsPath, new AssetsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: assetsMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    koa: {
      before: [
        bodyParser({
          multipart: true,
          formLimit: 15,
          formidable: {
            // uploadDir: 'assets',
            fileWriteStreamHandler: (file: any) => {
              const bucket = app.get('mongodbBucket');
              return bucket.openUploadStream(file?.newFilename, {
                // chunkSizeBytes: 1048576,
                metadata: { mimetype: file.mimetype },
              });
            },
          },
        }),
        async (ctx, next) => {
          // console.log('ctx.method', ctx.method, 'ctx.url', ctx.url);
          if (ctx.method === 'POST') {
            const response: Record<string, ObjectId> = {};
            if (Array.isArray(ctx.request.files)) {
              ctx.request.files.forEach(({ originalname, id }) => {
                response[originalname] = id;
              });
            } else if (ctx.request.files) {
              Object.entries(ctx.request.files).forEach(([name, x]) => {
                response[name] = (x as any)._writeStream.id;
              });
            }
            ctx.request.body.files = response;
            await next();
          }
        },
      ],
    },
  });

  // Initialize hooks
  const assetsService = app.service(assetsPath);
  assetsService.hooks(assetsHooks(app, app.get('authentication').enabled));

  app.use(
    `${assetsPath}/:id/:filename`,
    {
      async find(params: Params): Promise<ObjectId> {
        try {
          const { files } = await assetsService.get(params.route?.id, {
            ...params,
            provider: 'internal',
          });
          const foundFiles = Object.entries(files as Record<string, ObjectId>).filter(
            ([name]) => name === params.route?.filename,
          );

          return foundFiles[0][1];
        } catch (error) {
          throw new NotFound(`File assets/${params.route?.id}/${params.route?.filename} not found`);
        }
      },
    },
    {
      // A list of all methods this service exposes externally
      methods: ['find'],
      // You can add additional custom events to be sent to clients here
      events: [],
      koa: {
        after: [
          async (ctx, next) => {
            const { status, body: fileId } = ctx.response;
            if (ctx.method === 'GET' && status === 200) {
              const bucket = app.get('mongodbBucket');
              const files = await bucket.find({ _id: fileId as ObjectId }).toArray();
              ctx.type = files[0].metadata?.mimetype;
              ctx.body = bucket.openDownloadStream(fileId as ObjectId);
              await next();
            }
          },
        ],
      },
    },
  );
};

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [assetsPath]: AssetsService;
    'assets/:id/:filename': { find(params: Params): Promise<ObjectId> };
  }
}
