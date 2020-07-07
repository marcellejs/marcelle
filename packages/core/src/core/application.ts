import { Module } from './module';
import App from './components/App.svelte';

interface ApplicationOptions {
  title: string;
  author: string;
  // plugins: [ImagePlugin],
  datasets: string[];
}

class Application {
  modules: Record<string, Module> = {};
  ui: {
    left: Record<string, string[]>;
    right: Record<string, string[]>;
  } = { left: {}, right: {} };
  dashboards: string[] = [];
  app: App | undefined = undefined;

  constructor(
    private title = 'Hello, Marcelle!',
    private author = 'author',
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    private datasets: string[] = [],
  ) {}

  use(module: Module) {
    this.modules[module.id] = module;
  }

  input(module: Module) {
    if (!Object.keys(this.modules).includes(module.id)) {
      throw new Error(
        `Module '${module.id}' hasn't been registered on the application.
        Use \`app.use()\`
      `,
      );
    }
    if (!Object.keys(this.ui.left).includes('input')) {
      this.ui.left.input = [];
    }
    this.ui.left.input.push(module.id);
  }

  dashboard(dashboardName: string) {
    if (!Object.keys(this.ui.right).includes(dashboardName)) {
      this.ui.right[dashboardName] = [];
    }
    return {
      use: (module: Module) => {
        if (!Object.keys(this.modules).includes(module.id)) {
          throw new Error(
            `Module '${module.id}' hasn't been registered on the application.
            Use \`app.use()\`
          `,
          );
        }
        this.ui.right[dashboardName].push(module.id);
      },
    };
  }

  async start(): Promise<Application> {
    this.app = new App({
      target: document.body,
      props: {
        title: this.title,
        author: this.author,
        left: this.ui.left,
        right: this.ui.right,
      },
    });
    Object.values(this.ui.left)
      .reduce((x, y) => x.concat(y), [])
      .concat(Object.values(this.ui.right).reduce((x, y) => x.concat(y), []))
      .forEach((id) => {
        this.modules[id].run();
      });
    return this;
  }
}

export function createApp(options: ApplicationOptions): Application {
  return new Application(options.title, options.author, options.datasets);
}
