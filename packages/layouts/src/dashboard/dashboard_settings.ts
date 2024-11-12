import type {
  BatchPrediction,
  Component,
  Dataset,
  DataStore,
  Instance,
  Model,
} from '@marcellejs/core';

function isTitle(x: Component | Component[] | string): x is string {
  return typeof x === 'string';
}

function isComponentArray(x: Component | Component[] | string): x is Component[] {
  return Array.isArray(x);
}

export class DashboardSettings {
  name = 'settings';
  components: Array<Component | Component[] | string> = [];
  unmount: Array<() => void> = [];

  xModels: Array<Model<Instance, unknown>> = [];
  xDatasets: Array<Dataset<Instance>> = [];
  xPredictions: BatchPrediction[] = [];
  xDataStores: DataStore[] = [];

  use(...components: Array<Component | Component[] | string>): DashboardSettings {
    this.components = this.components.concat(components);
    return this;
  }

  dataStores(...stores: DataStore[]): DashboardSettings {
    this.xDataStores = stores;
    return this;
  }

  models(...models: Array<Model<Instance, unknown>>): DashboardSettings {
    this.xModels = models;
    return this;
  }

  datasets(...datasets: Array<Dataset<Instance>>): DashboardSettings {
    this.xDatasets = datasets;
    return this;
  }

  predictions(...predictions: BatchPrediction[]): DashboardSettings {
    this.xPredictions = predictions;
    return this;
  }

  mount(): void {
    this.unmount = [];
    for (const m of this.components) {
      if (isComponentArray(m)) {
        for (const n of m) {
          this.unmount.push(n.mount());
        }
      } else if (!isTitle(m)) {
        this.unmount.push(m.mount());
      }
    }
  }

  destroy(): void {
    for (const f of this.unmount) {
      f();
    }
  }
}
