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
import { Catch, type Instance, logger, Model, TrainingError } from '@marcellejs/core';
import { SkeletonRenderer } from './renderer';
import View from './pose-detection.view.svelte';
import { ready } from '@tensorflow/tfjs-core';
import { BehaviorSubject } from 'rxjs';
import { mount, unmount } from 'svelte';

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
  $loading = new BehaviorSubject(true);
  $bodyParts = new BehaviorSubject('Full body');

  #fullRenderer: SkeletonRenderer;
  #thumbnailRenderer: SkeletonRenderer;

  constructor(
    public model: PoseDetectionModel = 'MoveNet',
    public modelConfig?: ModelConfig,
  ) {
    super();
    this.#fullRenderer = new SkeletonRenderer(SupportedModels[model], 224);
    this.#thumbnailRenderer = new SkeletonRenderer(SupportedModels[model], 60);
    this.setup(model, modelConfig);
  }

  async setup(model: PoseDetectionModel, modelConfig?: ModelConfig): Promise<void> {
    await ready();
    this.#detector = await createDetector(SupportedModels[model], modelConfig);
    logger.info(`${model} loaded`);
    this.$loading.next(false);
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

  mount(target?: HTMLElement) {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    const app = mount(View, {
      target: t,
      props: {
        loading: this.$loading,
        model: this.model,
      },
    });
    return () => unmount(app);
  }

  @Catch
  train(): never {
    throw new TrainingError('Model `MobileNet` cannot be trained');
  }

  @Catch
  save(): never {
    throw new Error('MobileNet does not support saving');
  }

  @Catch
  load(): never {
    throw new Error('MobileNet does not support loading');
  }

  @Catch
  download(): never {
    throw new Error('MobileNet does not support downloading');
  }

  @Catch
  upload(): never {
    throw new Error('MobileNet does not support uploading');
  }
}
