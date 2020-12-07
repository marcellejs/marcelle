import { Service } from '@feathersjs/feathers';
import { logger } from '../logger';
import { StoredModel } from '../types';
import type { Model, ModelConstructor } from './model';

export function Saveable<TBase extends ModelConstructor<Model>>(Base: TBase) {
  abstract class SaveableModel extends Base {
    abstract modelId: string;
    modelService: Service<StoredModel>;
    storedModelId: string;

    abstract beforeSave(): Promise<StoredModel | null>;
    abstract afterLoad(s: StoredModel): Promise<void>;

    async save() {
      const modelData = await this.beforeSave();
      if (!modelData) return;
      if (this.storedModelId) {
        await this.modelService.update(this.storedModelId, modelData);
      } else {
        const res = await this.modelService.create(modelData);
        this.storedModelId = res.id;
      }
      logger.info(
        `Model ${this.modelId} was saved to data store at location ${this.dataStore.location}`,
      );
    }

    async load() {
      if (!this.storedModelId) return;
      const res = await this.modelService.get(this.storedModelId);
      if (!res) return;
      await this.afterLoad(res);
      this.$training.set({
        status: 'loaded',
      });
      logger.info(
        `Model ${this.modelId} was loaded from data store at location ${this.dataStore.location}`,
      );
    }

    parametersSnapshot(): Record<string, unknown> {
      const params: Record<string, unknown> = {};
      Object.entries(this.parameters).forEach(([key, s]) => {
        params[key] = s.value;
      });
      return params;
    }
  }
  return SaveableModel;
}
