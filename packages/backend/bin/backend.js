#!/usr/bin/env node

const fs = require('fs')

const configDir = `${process.cwd()}/backend/config`
if (fs.existsSync(configDir)) {
  process.env['NODE_CONFIG_DIR'] = configDir;
  const runBackend = require('../lib/').default;
  runBackend();
} else {
  console.error(`Marcelle backend error: config directory does not exist
  \t expected at ${configDir}
  \t to specify a path, use environment variable: NODE_CONFIG_DIR=/path/to/config_dir`);
}