const Generator = require('yeoman-generator');
const path = require('path');
const { kebabCase } = require('lodash');
const makePkgConfig = require('./package.json');

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
        filter: kebabCase,
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
      {
        name: 'packager',
        type: 'list',
        message: 'Which package manager are you using (has to be installed globally)?',
        default: 'npm',
        choices: [
          { name: 'npm', value: 'npm' },
          { name: 'Yarn', value: 'yarn' },
        ],
      },
      {
        name: 'buildTool',
        type: 'list',
        message: 'Which build tool do you prefer?',
        default: 'vite',
        choices: [
          { name: 'vite', value: 'vite' },
          { name: 'webpack', value: 'webpack' },
        ],
      },
      {
        name: 'linting',
        type: 'checkbox',
        message: 'Linting and Formatting',
        choices: [
          { name: 'ESLint', value: 'eslint', checked: true },
          { name: 'Prettier', value: 'prettier', checked: true },
          { name: 'None', value: 'none' },
        ],
      },
      {
        name: 'backend',
        type: 'list',
        message: 'Where do you want to store the data?',
        default: 'browser',
        choices: [
          { name: 'In the browser (localStorage)', value: 'browser' },
          { name: 'On the server', value: 'server' },
        ],
      },
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = Object.assign({}, this.props, props);
      this.pkg = makePkgConfig(this);

      if (props.backend === 'server') {
        this.composeWith(require.resolve('../backend'), {
          pkg: this.pkg,
          language: props.language,
          isSub: true,
          useYarn: this.props.packager === 'yarn',
        });
      }
    });
  }

  writing() {
    const lang = this.props.language;
    const isTypeScript = lang === 'ts';
    const eslint = this.props.linting.includes('eslint');
    const prettier = this.props.linting.includes('prettier');
    const context = Object.assign({}, this.props, { isTypeScript, eslint, prettier });

    this.fs.copy(this.templatePath(`src_${lang}`), this.destinationPath('src'));
    this.fs.writeJSON(this.destinationPath('package.json'), this.pkg);

    if (isTypeScript) {
      this.fs.copy(this.templatePath('tsconfig.json'), this.destinationPath('tsconfig.json'));
    }
    if (this.props.linting.includes('eslint')) {
      this.fs.copyTpl(
        this.templatePath(`_eslintrc-${lang}.js`),
        this.destinationPath('', '.eslintrc.js'),
        context,
      );
    }

    if (this.props.linting.includes('prettier')) {
      this.fs.copy(this.templatePath('_prettierrc.js'), this.destinationPath('', '.prettierrc.js'));
    }

    if (this.props.buildTool === 'vite') {
      this.fs.copy(
        this.templatePath('vite/vite.config.js'),
        this.destinationPath('vite.config.js'),
      );
      this.fs.copyTpl(
        this.templatePath('vite/index.html'),
        this.destinationPath('index.html'),
        context,
      );
      this.fs.copy(this.templatePath('vite/_gitignore'), this.destinationPath('', '.gitignore'));
      this.fs.copyTpl(
        this.templatePath('webpack/README.md'),
        this.destinationPath('README.md'),
        context,
      );
    } else if (this.props.buildTool === 'webpack') {
      this.fs.copy(this.templatePath('webpack/_gitignore'), this.destinationPath('', '.gitignore'));
      this.fs.copy(this.templatePath('webpack/public'), this.destinationPath('public'));
      this.fs.copyTpl(
        this.templatePath('webpack/webpack.config.js'),
        this.destinationPath('webpack.config.js'),
        context,
      );
      this.fs.copyTpl(
        this.templatePath('webpack/README.md'),
        this.destinationPath('README.md'),
        context,
      );
    }
  }

  install() {
    this.installDependencies({
      yarn: this.props.packager === 'yarn',
      npm: this.props.packager === 'npm',
      bower: false,
    });
  }

  end() {
    this.log
      .writeln('\n------\n')
      .info('Your project is now ready. To run the application in development mode:\n')
      .writeln(`\t${this.props.packager === 'yarn' ? 'yarn' : 'npm run'} dev`);
  }
};
