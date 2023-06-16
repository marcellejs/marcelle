// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Params, ServiceInterface } from '@feathersjs/feathers';

import type { Application } from '../../declarations';
import { getRegisteredServices } from '../../utils/registered-services';

type Info = {
  services: string[];
};
type InfoData = any;
type InfoPatch = any;
type InfoQuery = any;

export type { Info, InfoData, InfoPatch, InfoQuery };

export interface InfoServiceOptions {
  app: Application;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InfoParams extends Params<InfoQuery> {}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class InfoService<ServiceParams extends InfoParams = InfoParams>
  implements ServiceInterface<Info, InfoData, ServiceParams, InfoPatch>
{
  constructor(public options: InfoServiceOptions) {}

  async find(): Promise<Info> {
    return {
      services: await getRegisteredServices(this.options.app),
    };
  }
}

export const getOptions = (app: Application) => {
  return { app };
};
