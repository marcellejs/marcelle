import { io } from '@tensorflow/tfjs-core';
import { ModelArtifacts } from '@tensorflow/tfjs-core/dist/io/io';
import { logger } from '../logger';

interface SpecificModelArtifacts extends ModelArtifacts {
  modelTopology: {
    model_config: {
      config: {
        layers: Array<{
          class_name: string;
          config: Record<string, unknown>;
        }>;
      };
    };
  };
}

function fixSeparableConv2D(artifacts: SpecificModelArtifacts): ModelArtifacts {
  if (
    !artifacts.modelTopology.model_config ||
    !artifacts.modelTopology.model_config.config ||
    !artifacts.modelTopology.model_config.config.layers ||
    (artifacts.modelTopology.model_config.config.layers.length > 0 &&
      !artifacts.modelTopology.model_config.config.layers[0].class_name)
  ) {
    return artifacts;
  }
  try {
    let removeKernels = false;
    artifacts.modelTopology.model_config.config.layers.forEach((layer, i) => {
      if (layer.class_name === 'SeparableConv2D') {
        ['kernel_constraint', 'kernel_initializer', 'kernel_regularizer'].forEach((field) => {
          if (
            Object.keys(artifacts.modelTopology.model_config.config.layers[i].config).includes(
              field,
            )
          ) {
            removeKernels = true;
          }
          delete artifacts.modelTopology.model_config.config.layers[i].config[field];
        });
      }
    });
    if (removeKernels)
      logger.warning(
        'TFJS Model loading: experimentally removing Kernel attributes from SeparableConv2D layers',
      );
  } catch (error) {}
  return artifacts;
}

export function http(...args: Parameters<typeof io.http>): ReturnType<typeof io.http> {
  const loader = io.http(...args);
  const superLoad = loader.load.bind(loader);
  loader.load = async function loadx(): Promise<ModelArtifacts> {
    const x = await superLoad();
    return fixSeparableConv2D(x as SpecificModelArtifacts);
  };
  return loader;
}

export function browserFiles(
  ...args: Parameters<typeof io.browserFiles>
): ReturnType<typeof io.browserFiles> {
  const loader = io.browserFiles(...args);
  const superLoad = loader.load.bind(loader);
  loader.load = async function loadx(): Promise<ModelArtifacts> {
    const x = await superLoad();
    return fixSeparableConv2D(x as SpecificModelArtifacts);
  };
  return loader;
}
