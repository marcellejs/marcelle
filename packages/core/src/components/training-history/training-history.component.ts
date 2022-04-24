import type { Paginated } from '@feathersjs/feathers';
import type { DataStore, Service } from '../../core';
import {
  logger,
  Model,
  Component,
  Stream,
  TrainingRun,
  TrainingStatus,
  Instance,
} from '../../core';
import { preventConcurrentCalls } from '../../utils/asynchronicity';
import { noop } from '../../utils/misc';
import View from './training-history.view.svelte';

function appendLogs(logs: Record<string, unknown>, d: Record<string, unknown>) {
  const l = { ...logs };
  for (const [key, val] of Object.entries(d)) {
    l[key] = ((l[key] as unknown[]) || []).concat([val]);
  }
  return l;
}

export interface TrainingHistoryOptions {
  metrics?: string[];
  actions?: Array<string | { name: string; multiple?: boolean }>;
}

const defaultOptions: TrainingHistoryOptions = {
  metrics: ['accuracy', 'accuracyVal', 'loss', 'lossVal'],
  actions: [],
};

export class TrainingHistory<T extends Instance, PredictionType> extends Component {
  title = 'Training History';

  $selection = new Stream<TrainingRun[]>([], true);
  $actions = new Stream<{ name: string; data: TrainingRun }>(null).skip(1);

  runService: Service<TrainingRun>;
  options: TrainingHistoryOptions;
  model: Model<T, PredictionType>;

  protected ready = Promise.resolve();
  protected stopTracking: () => void = noop;
  protected crtRun: TrainingRun;
  protected modelName: string;
  protected nextIndex: number;

  private lock = Promise.resolve();

  constructor(public dataStore: DataStore, options: TrainingHistoryOptions = {}) {
    super();
    this.options = { ...defaultOptions, ...options };
    this.lock = this.lock.then(noop);
    this.start();
    this.ready = this.ready
      .then(() => this.dataStore.connect())
      .then(() => {
        this.runService = this.dataStore.service('runs');
      })
      .catch(() => {
        logger.log('[dataset] dataStore connection failed');
      });
  }

  track(model: Model<T, PredictionType>, basename = 'anonymous'): this {
    this.ready
      .then(() => {
        this.stopTracking();
        this.model = model;
        this.modelName = basename;
        return this.runService.find({
          query: {
            basename,
            $sort: {
              createdAt: -1,
            },
            $select: ['name'],
            $limit: 1,
          },
        }) as Promise<Paginated<TrainingRun>>;
      })
      .then(({ data: foundRuns }) => {
        if (foundRuns.length > 0) {
          return parseInt(foundRuns[0].name.split(`${basename}-`)[1]) + 1;
        }
        return 1;
      })
      .then((nextIndex) => {
        this.nextIndex = nextIndex;
        this.crtRun = null;
        this.stopTracking = this.model
          ? this.model.$training.subscribe(this.trackTrainingStream)
          : noop;
      });
    return this;
  }

  @preventConcurrentCalls('lock')
  protected async trackTrainingStream(x: TrainingStatus): Promise<void> {
    if (x.status === 'start') {
      this.crtRun = await this.runService.create({
        name: `${this.modelName}-${this.nextIndex++}`,
        basename: this.modelName,
        start: new Date(Date.now()).toISOString(),
        source: 'js',
        status: x.status,
        epochs: x.epochs,
        params: Object.entries(this.model.parameters)
          .map(([key, s]) => ({ [key]: s.get() }))
          .reduce((o, y) => ({ ...o, ...y }), {}), // this.model.parameters
        logs: {},
      });
    } else if (x.status === 'epoch') {
      this.runService.patch(this.crtRun.id, {
        status: x.status,
        epoch: x.epoch,
        logs: appendLogs(this.crtRun.logs, x.data),
      });
    } else if (x.status === 'success') {
      const modelId = await this.model.save(this.dataStore, this.modelName, {});
      this.runService.patch(this.crtRun.id, {
        status: x.status,
        epoch: x.epoch,
        logs: x.data,
        checkpoints: (this.crtRun.checkpoints || []).concat([
          {
            id: modelId,
            name: `${this.crtRun.name}@final`,
            service: this.model.serviceName,
          },
        ]),
      });
    } else if (x.status === 'error') {
      this.runService.patch(this.crtRun.id, {
        status: x.status,
      });
    }
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.ready.then(() => {
      this.$$.app = new View({
        target: t,
        props: {
          title: this.title,
          service: this.runService,
          metrics: this.options.metrics,
          actions: this.options.actions,
          selection: this.$selection,
        },
      });
      for (const action of this.options.actions) {
        const name = typeof action === 'string' ? action : action.name;
        this.$$.app.$on(name, ({ detail }) => {
          this.$actions.set({ name, data: detail });
        });
      }
    });
  }
}
