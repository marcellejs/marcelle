import { Module } from './module';
import App from './components/App.svelte';

interface ApplicationOptions {
  title: string;
  author: string;
}

class Dashboard {
  modules: Module[] = [];
  modulesLeft: Module[] = [];

  constructor(public name: string) {}

  use(...modules: [Module]): Dashboard {
    this.modules = this.modules.concat(modules);
    return this;
  }

  useLeft(...modules: [Module]): Dashboard {
    this.modulesLeft = this.modulesLeft.concat(modules);
    return this;
  }

  mount() {
    this.modules.forEach((m) => m.mount());
    this.modulesLeft.forEach((m) => m.mount());
  }

  destroy() {
    this.modules.forEach((m) => m.destroy());
    this.modulesLeft.forEach((m) => m.destroy());
  }
}

export class Application {
  dashboards: Record<string, Dashboard> = {};
  app: App | undefined = undefined;

  constructor(private title = 'Hello, Marcelle!', private author = 'author') {}

  dashboard(name: string): Dashboard {
    if (!Object.keys(this.dashboards).includes(name)) {
      this.dashboards[name] = new Dashboard(name);
    }
    return this.dashboards[name];
  }

  start(): void {
    this.app = new App({
      target: document.body,
      props: {
        title: this.title,
        author: this.author,
        dashboards: this.dashboards,
      },
    });
    this.app.$on('quit', () => {
      this.app?.$destroy();
      this.app = undefined;
    });
  }

  destroy(): void {
    this.app?.quit();
  }
}

export function createApp(options: ApplicationOptions): Application {
  return new Application(options.title, options.author);
}
