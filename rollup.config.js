import configCore from './packages/core/rollup.config';

function fixConfiguration(config, path) {
  const c = config;
  c.input = `${path}/${config.input}`;
  if (Array.isArray(config.output)) {
    config.output.forEach((o, i) => {
      c.output[i].file = `${path}/${o.file}`;
    });
  } else {
    c.output.file = `${path}/${config.output.file}`;
  }
}

fixConfiguration(configCore, 'packages/core');

export default [configCore];
