// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import type { Application } from '../../declarations';
import { MlModelsService, getOptions } from './ml-models.class';
import { bodyParser } from '@feathersjs/koa';
import { Params } from '@feathersjs/feathers';
import { MLModelUploadsService } from './ml-models.upload.class';
import { ObjectId, type GridFSBucket } from 'mongodb';
import { NotFound } from '@feathersjs/errors';
import mlModelsHooks from './ml-models.hooks';

export type ModelType = 'tfjs' | 'onnx';
export type ModelPath = `${ModelType}-models`;
export const mlModelsMethods = ['find', 'get', 'create', 'update', 'patch', 'remove'] as const;

export * from './ml-models.class';
export * from './ml-models.schema';

// A configure function that registers the service and its hooks via `app.configure`
export const mlModels = (modelType: ModelType) => (app: Application) => {
  const requireAuth = app.get('authentication').enabled;
  // Register our service on the Feathers application
  const mlModelsPath: ModelPath = `${modelType}-models`;

  app.use(mlModelsPath, new MlModelsService(getOptions(app, modelType)), {
    // A list of all methods this service exposes externally
    methods: mlModelsMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  });
  // Initialize hooks
  const mlModelsService = app.service(mlModelsPath);
  mlModelsService.hooks(mlModelsHooks(requireAuth));

  app.use(
    `${mlModelsPath}/:id/:filename` as `${ModelPath}/:id/:filename`,
    {
      async find(params: Params): Promise<string> {
        try {
          const model = await mlModelsService.get(params.route?.id, params);
          const foundFiles = model.files.filter(([name]) => name === params.route?.filename);
          return foundFiles[0][1];
        } catch (error) {
          throw new NotFound(
            `File ${mlModelsPath}/${params.route?.id}/${params.route?.filename} not found`,
          );
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
              const bucket = app.get('mongodbBucket') as GridFSBucket;
              const files = await bucket.find({ _id: new ObjectId(fileId as string) }).toArray();
              ctx.body = bucket.openDownloadStream(files[0]._id);
              await next();
            }
          },
        ],
      },
    },
  );

  const mlModelsUploadPath: `${ModelType}-models/upload` = `${modelType}-models/upload`;
  app.use(
    mlModelsUploadPath,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    new MLModelUploadsService(),
    {
      // A list of all methods this service exposes externally
      methods: ['create'],
      // You can add additional custom events to be sent to clients here
      events: [],
      koa: {
        before: [
          bodyParser({
            multipart: true,
            formLimit: 15,
            formidable: {
              // uploadDir: 'uploads',
              fileWriteStreamHandler: (file: any) => {
                const bucket = app.get('mongodbBucket');
                return bucket.openUploadStream(file?.newFilename, {
                  // chunkSizeBytes: 1048576,
                  // metadata: { field: 'myField', value: 'myValue' },
                });
              },
            },
          }),
          async (ctx, next) => {
            if (ctx.method === 'POST') {
              const response: Array<[string, string]> = [];
              if (Array.isArray(ctx.request.files)) {
                ctx.request.files.forEach(({ originalname, id }) => {
                  response.push([originalname, id]);
                });
              } else if (ctx.request.files) {
                Object.entries(ctx.request.files).forEach(([name, x]) => {
                  response.push([name, (x as any)._writeStream.id]);
                });
              }
              ctx.request.body.files = response;
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
    'tfjs-models': MlModelsService;
    'tfjs-models/upload': MLModelUploadsService;
    'tfjs-models/:id/:filename': { find(params: Params): Promise<string> };
    'onnx-models': MlModelsService;
    'onnx-models/upload': MLModelUploadsService;
    'onnx-models/:id/:filename': { find(params: Params): Promise<string> };
  }
}
