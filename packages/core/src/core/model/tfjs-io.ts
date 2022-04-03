import { io } from '@tensorflow/tfjs-core';
import { logger } from '../logger';

interface SpecificModelArtifacts extends io.ModelArtifacts {
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

function fixSeparableConv2D(artifacts: SpecificModelArtifacts): io.ModelArtifacts {
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
    for (const [i, layer] of artifacts.modelTopology.model_config.config.layers.entries()) {
      if (layer.class_name === 'SeparableConv2D') {
        const fields = ['kernel_constraint', 'kernel_initializer', 'kernel_regularizer'];
        for (const field of fields) {
          if (
            Object.keys(artifacts.modelTopology.model_config.config.layers[i].config).includes(
              field,
            )
          ) {
            removeKernels = true;
          }
          // eslint-disable-next-line no-param-reassign
          delete artifacts.modelTopology.model_config.config.layers[i].config[field];
        }
      }
    }
    if (removeKernels) {
      logger.warning(
        'TFJS Model loading: experimentally removing Kernel attributes from SeparableConv2D layers',
      );
    }
  } catch (error) {
    logger.warning(
      'TFJS Model loading: An error occurred whil experimentally removing Kernel attributes from SeparableConv2D layers',
      error,
    );
  }
  return artifacts;
}

export function http(...args: Parameters<typeof io.http>): ReturnType<typeof io.http> {
  const loader = io.http(...args);
  const superLoad = loader.load.bind(loader);
  loader.load = async function loadx(): Promise<io.ModelArtifacts> {
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
  loader.load = async function loadx(): Promise<io.ModelArtifacts> {
    const x = await superLoad();
    return fixSeparableConv2D(x as SpecificModelArtifacts);
  };
  return loader;
}
