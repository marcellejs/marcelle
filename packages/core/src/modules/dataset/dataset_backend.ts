import { Instance, InstanceId } from './dataset.common';
import genId from './objectid';

export class InMemoryBackend {
  instanceData: Record<string, Instance> = {};
  classes: Record<string, InstanceId[]> = {};

  async addInstance(instance: Instance): Promise<string> {
    if (instance.id) {
      throw new Error('Instance already has an ID!');
    }
    const id = genId();
    this.instanceData[id] = { ...instance, id };
    return id;
  }

  async getInstance(id: InstanceId): Promise<Instance> {
    if (await this.hasId(id)) {
      return this.instanceData[id];
    }
    return null;
  }

  async hasId(id: InstanceId): Promise<boolean> {
    return Object.keys(this.instanceData).includes(id);
  }
}
