import type { BatchPrediction } from '../../components';
import type { Model, Component, Instance } from '../../core';
import type { DataStore } from '../../core/data-store';
import type { Dataset } from '../../core/dataset';

function isTitle(x: Component | Component[] | string): x is string {
  return typeof x === 'string';
}

function isComponentArray(x: Component | Component[] | string): x is Component[] {
  return Array.isArray(x);
}

export class DashboardSettings {
  name = 'settings';
  components: Array<Component | Component[] | string> = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    for (const m of this.components) {
      if (isComponentArray(m)) {
        for (const n of m) {
          n.mount();
        }
      } else if (!isTitle(m)) {
        m.mount();
      }
    }
  }

  destroy(): void {
    for (const m of this.components) {
      if (isComponentArray(m)) {
        for (const n of m) {
          n.destroy();
        }
      } else if (!isTitle(m)) {
        m.destroy();
      }
    }
  }
}
