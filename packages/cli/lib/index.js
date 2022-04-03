const yeoman = require('yeoman-environment');
const program = require('commander');
const meta = require('generator-marcelle/meta');
const semver = require('semver');
const updateNotifier = require('update-notifier');

const env = yeoman.createEnv();

const marcelleGenerators = 'generator-marcelle/generators';

Object.keys(meta).forEach((name) => {
  const moduleName = `${marcelleGenerators}/${name}`;
  env.register(require.resolve(moduleName), `marcelle:${name}`);
});

module.exports = function (argv, generatorOptions = {}) {
  const pkg = require('../package.json');
  let description = 'Run a generator. Type can be\n';

  Object.keys(meta).forEach((name) => {
    description += `\t• ${name} - ${meta[name]}\n`;
  });

  updateNotifier({ pkg }).notify();

  program.version(pkg.version).usage('generate [type]');

  if (!semver.satisfies(process.version, '>= 12.0.0')) {
    console.error('The Marcelle CLI and generated application requires Node v12.0.0 or later.');
    return process.exit(1);
  }

  program
    .command('generate [type]')
    .alias('g')
    .description(description)
    .action((type) => {
      if (!type) {
        program.help();
      } else {
        env.run(`marcelle:${type}`, generatorOptions);
      }
    });

  program.command('*').action(() => program.help());
  program.parse(argv);

  if (argv.length === 2) {
    program.help();
  }
};
