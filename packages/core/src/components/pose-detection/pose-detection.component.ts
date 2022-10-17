import {
  type BlazePoseMediaPipeModelConfig,
  type BlazePoseTfjsModelConfig,
  type MoveNetModelConfig,
  type PosenetModelConfig,
  type PoseDetector,
  createDetector,
  SupportedModels,
  type Pose,
} from '@tensorflow-models/pose-detection';
import type { GraphModel } from '@tensorflow/tfjs-converter';
import { Instance, logger, Model, Stream } from '../../core';
import { Catch, TrainingError } from '../../utils/error-handling';
import { SkeletonRenderer } from './renderer';
import View from './pose-detection.view.svelte';

export type PoseDetectionModel = keyof typeof SupportedModels;

export type ModelConfig =
  | PosenetModelConfig
  | BlazePoseTfjsModelConfig
  | BlazePoseMediaPipeModelConfig
  | MoveNetModelConfig;

export interface PoseDetectionInstance extends Instance {
  x: ImageData;
  y: undefined;
}

export { type Pose };

export class PoseDetection extends Model<PoseDetectionInstance, Pose[]> {
  title = 'Pose Detection';

  parameters = {};
  serviceName = 'undefined';

  #detector: (PoseDetector & { model?: GraphModel }) | undefined;
  $loading = new Stream(true, true);
  $bodyParts = new Stream('Full body', false);

  #fullRenderer: SkeletonRenderer;
  #thumbnailRenderer: SkeletonRenderer;

  constructor(public model: PoseDetectionModel = 'MoveNet', public modelConfig?: ModelConfig) {
    super();
    this.#fullRenderer = new SkeletonRenderer(SupportedModels[model], 224);
    this.#thumbnailRenderer = new SkeletonRenderer(SupportedModels[model], 60);
    this.start();
    this.setup(model, modelConfig);
  }

  async setup(model: PoseDetectionModel, modelConfig?: ModelConfig): Promise<void> {
    this.#detector = await createDetector(SupportedModels[model], modelConfig);
    logger.info(`${model} loaded`);
    this.$loading.set(false);
    this.start();
  }

  async predict(image: ImageData): Promise<Pose[]> {
    if (!this.#detector) {
      logger.error('Movenet is not loaded');
      return [];
    }
    const results = await this.#detector.estimatePoses(image);
    return results;
  }

  postprocess(poses: Pose[], indices?: number[]): number[] {
    const filt =
      indices && Array.isArray(indices) && indices.length > 0
        ? (_: unknown, i: number) => indices.includes(i)
        : () => true;

    return poses
      .map((pose) => {
        const nose = pose.keypoints[0];
        return pose.keypoints
          .filter(filt)
          .reduce((res, x) => [...res, (x.x - nose.x) / 100, (x.y - nose.y) / 100], []);
      })
      .reduce((res, x) => [...res, ...x], []);
  }

  thumbnail(img: ImageData, result: Pose[]) {
    return this.#thumbnailRenderer.render(img, result, 'dataURL');
  }

  render(img: ImageData, result: Pose[]) {
    return this.#fullRenderer.render(img, result);
  }

  // https://colab.research.google.com/drive/19txHpN8exWhstO6WVkfmYYVC6uug_oVR#scrollTo=0L6HLFd9AXmh

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
      target: t,
      props: {
        title: this.title,
        loading: this.$loading,
        model: this.model,
      },
    });
  }

  @Catch
  // eslint-disable-next-line class-methods-use-this
  train(): never {
    throw new TrainingError('Model `MobileNet` cannot be trained');
  }

  @Catch
  // eslint-disable-next-line class-methods-use-this
  save(): never {
    throw new Error('MobileNet does not support saving');
  }

  @Catch
  // eslint-disable-next-line class-methods-use-this
  load(): never {
    throw new Error('MobileNet does not support loading');
  }

  @Catch
  // eslint-disable-next-line class-methods-use-this
  download(): never {
    throw new Error('MobileNet does not support downloading');
  }

  @Catch
  // eslint-disable-next-line class-methods-use-this
  upload(): never {
    throw new Error('MobileNet does not support uploading');
  }
}
