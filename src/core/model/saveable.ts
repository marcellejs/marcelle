import { Service } from '@feathersjs/feathers';
import { DataStore } from '../../data-store';
import { logger } from '../logger';
import { ObjectId, StoredModel } from '../types';
import type { Model, ModelConstructor } from './model';

export interface HookContext {
  model?: StoredModel | null;
  meta?: {
    labels?: string[];
    [key: string]: unknown;
  };
}
type HookFn = (context?: HookContext) => Promise<HookContext>;
type Hook = {
  action: 'save' | 'load' | 'download' | 'upload';
  when: 'before' | 'after';
  fn: HookFn;
};

export function Saveable<TBase extends ModelConstructor<Model>>(Base: TBase) {
  abstract class SaveableModel extends Base {
    dataStore: DataStore;
    abstract modelId: string;
    modelService: Service<StoredModel>;
    storedModelId: string;

    #hooks: Array<Hook> = [];

    registerHook(
      action: 'save' | 'load' | 'download' | 'upload',
      when: 'before' | 'after',
      fn: (context?: HookContext) => Promise<HookContext>,
    ) {
      this.#hooks.push({
        action,
        when,
        fn,
      });
    }

    async processHooks(
      action: 'save' | 'load' | 'download' | 'upload',
      when: 'before' | 'after',
      context: HookContext = {},
    ) {
      const hooks = this.#hooks
        .filter((x) => x.action === action && x.when === when)
        .map((x) => x.fn);
      return hooks.reduce(async (res, fn) => fn(await res), Promise.resolve(context));
    }

    sync(dataStore: DataStore) {
      this.dataStore = dataStore;
      return this;
    }

    async save(update = true): Promise<ObjectId | null> {
      if (!this.dataStore) return null;
      const { model } = await this.processHooks('save', 'before');
      if (!model) return null;
      if (update && this.storedModelId) {
        await this.modelService.update(this.storedModelId, model);
      } else {
        const res = await this.modelService.create(model);
        this.storedModelId = res.id;
      }
      await this.processHooks('save', 'after');
      logger.info(
        `Model ${this.modelId} was saved to data store at location ${this.dataStore.location}`,
      );
      return this.storedModelId;
    }

    async load(id?: ObjectId): Promise<void> {
      if (!this.dataStore || (!id && !this.storedModelId)) return;
      await this.processHooks('load', 'before');
      const model = await this.modelService.get(id || this.storedModelId);
      if (!model) return;
      await this.processHooks('load', 'after', { model });
      this.$training.set({
        status: 'loaded',
      });
      logger.info(
        `Model ${this.modelId} was loaded from data store at location ${this.dataStore.location}`,
      );
    }

    abstract download(): Promise<void>;
    abstract upload(...files: File[]): Promise<void>;

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
