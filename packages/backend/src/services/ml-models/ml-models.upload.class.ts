/* eslint-disable @typescript-eslint/no-unused-vars */
// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Id, NullableId, Params, ServiceInterface } from '@feathersjs/feathers';

import type { Application } from '../../declarations';

type MLModelUploads = Array<[string, string]>;
type MLModelUploadsData = { files: MLModelUploads };
type MLModelUploadsPatch = never;
type MLModelUploadsQuery = never;

export type { MLModelUploads, MLModelUploadsData, MLModelUploadsPatch, MLModelUploadsQuery };

export interface MLModelUploadsServiceOptions {
  app: Application;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MLModelUploadsParams extends Params<MLModelUploadsQuery> {}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class MLModelUploadsService<
  ServiceParams extends MLModelUploadsParams = MLModelUploadsParams,
> implements
    ServiceInterface<MLModelUploads, MLModelUploadsData, ServiceParams, MLModelUploadsPatch>
{
  // async create(data: MLModelUploadsData, params?: ServiceParams): Promise<MLModelUploads>;
  // async create(data: MLModelUploadsData[], params?: ServiceParams): Promise<MLModelUploads[]>;
  // async create(
  //   data: MLModelUploadsData | MLModelUploadsData[],
  //   params?: ServiceParams,
  // ): Promise<MLModelUploads | MLModelUploads[]> ;
  async create(data: MLModelUploadsData): Promise<MLModelUploads> {
    return data.files;
  }
}
