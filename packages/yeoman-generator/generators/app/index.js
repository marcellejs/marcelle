const Generator = require('yeoman-generator');
const path = require('path');
const makePkgConfig = require('./package.json');

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.generatorPkg = this.fs.readJSON(path.join(__dirname, '..', 'package.json'));
    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});

    this.props = {
      name:
        this.pkg.name ||
        process
          .cwd()
          .split(path.sep)
          .pop(),
      description: this.pkg.description || 'A Marcelle Application',
    };
  }

  prompting() {
    const prompts = [
      {
        name: 'name',
        message: 'Project name',
        when: !this.pkg.name,
        default: this.props.name,
        filter: toKebabCase,
      },
      {
        type: 'list',
        name: 'language',
        message: 'Do you want to use JavaScript or TypeScript?',
        default: 'js',
        choices: [
          { name: 'JavaScript', value: 'js' },
          { name: 'TypeScript', value: 'ts' },
        ],
      },
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = Object.assign({}, this.props, props);
      this.pkg = makePkgConfig(this);
    });
  }

  writing() {
    const lang = this.props.language;
    const isTypeScript = lang === 'ts';
    const context = Object.assign({}, this.props, { isTypeScript });

    this.fs.copy(this.templatePath(`src_${lang}`), this.destinationPath('src'));
    this.fs.writeJSON(this.destinationPath('package.json'), this.pkg);

    if (isTypeScript) {
      this.fs.copy(this.templatePath('tsconfig.json'), this.destinationPath('tsconfig.json'));
    }

    this.fs.copyTpl(
      this.templatePath(`_eslintrc-${lang}.js`),
      this.destinationPath('', '.eslintrc.js'),
      context,
    );

    this.fs.copy(this.templatePath('_prettierrc.js'), this.destinationPath('', '.prettierrc.js'));

    this.fs.copy(this.templatePath('vite/vite.config.js'), this.destinationPath('vite.config.js'));
    this.fs.copyTpl(
      this.templatePath('vite/index.html'),
      this.destinationPath('index.html'),
      context,
    );
    this.fs.copy(this.templatePath('vite/_gitignore'), this.destinationPath('', '.gitignore'));
    this.fs.copyTpl(
      this.templatePath('vite/README.md'),
      this.destinationPath('README.md'),
      context,
    );
  }

  end() {
    this.log
      .writeln('\n------\n')
      .info('Your project is now ready. Start by installing dependencies:\n')
      .writeln(`\tnpm install # or yarn, pnpm\n`)
      .info('To run the application in development mode:\n')
      .writeln(`\tnpm run dev`);
  }
};
