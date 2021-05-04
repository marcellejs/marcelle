import type { Model, Module } from '../core';
import type { DataStore } from '../data-store';
import type { Dataset } from '../dataset';
import type { BatchPrediction } from '../modules';

function isTitle(x: Module | Module[] | string): x is string {
  return typeof x === 'string';
}

function isModuleArray(x: Module | Module[] | string): x is Module[] {
  return Array.isArray(x);
}
export class DashboardSettings {
  name = 'settings';
  modules: Array<Module | Module[] | string> = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  xModels: Model<any, any>[] = [];
  xDatasets: Dataset<unknown, unknown>[] = [];
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  models(...models: Model<any, any>[]): DashboardSettings {
    this.xModels = models;
    return this;
  }

  datasets(...datasets: Dataset<unknown, unknown>[]): DashboardSettings {
    this.xDatasets = datasets;
    return this;
  }

  predictions(...predictions: BatchPrediction[]): DashboardSettings {
    this.xPredictions = predictions;
    return this;
  }

  mount(): void {
    for (const m of this.modules) {
      if (isModuleArray(m)) {
        for (const n of m) {
          n.mount();
        }
      } else if (!isTitle(m)) {
        m.mount();
      }
    }
  }

  destroy(): void {
    for (const m of this.modules) {
      if (isModuleArray(m)) {
        for (const n of m) {
          n.destroy();
        }
      } else if (!isTitle(m)) {
        m.destroy();
      }
    }
  }
}
