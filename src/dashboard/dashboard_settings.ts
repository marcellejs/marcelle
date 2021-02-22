import type { Model, Module } from '../core';
import { DataStore } from '../data-store';
import { BatchPrediction, Dataset } from '../modules';

function isTitle(x: Module | Module[] | string): x is string {
  return typeof x === 'string';
}

function isModuleArray(x: Module | Module[] | string): x is Module[] {
  return Array.isArray(x);
}
export class DashboardSettings {
  name = 'settings';
  modules: Array<Module | Module[] | string> = [];

  xModels: Model<any, any>[] = [];
  xDatasets: Dataset[] = [];
  xPredictions: BatchPrediction[] = [];
  xDataStores: DataStore[] = [];

  use(...modules: Array<Module | Module[] | string>): DashboardSettings {
    this.modules = this.modules.concat(modules);
    return this;
  }

  dataStores(...stores: DataStore[]): DashboardSettings {
    this.xDataStores = stores;
    return this;
  }

  models(...models: Model<any, any>[]): DashboardSettings {
    this.xModels = models;
    return this;
  }

  datasets(...datasets: Dataset[]): DashboardSettings {
    this.xDatasets = datasets;
    return this;
  }

  predictions(...predictions: BatchPrediction[]): DashboardSettings {
    this.xPredictions = predictions;
    return this;
  }

  mount(): void {
    this.modules.forEach((m) => {
      if (isModuleArray(m)) {
        m.forEach((n) => n.mount());
      } else if (!isTitle(m)) {
        m.mount();
      }
    });
  }

  destroy(): void {
    this.modules.forEach((m) => {
      if (isModuleArray(m)) {
        m.forEach((n) => n.destroy());
      } else if (!isTitle(m)) {
        m.destroy();
      }
    });
  }
}
