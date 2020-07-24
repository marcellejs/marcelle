import { Dashboard } from './dashboard';
import App from './components/App.svelte';

interface ApplicationOptions {
  title: string;
  author: string;
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
      Object.values(this.dashboards).forEach((dashboard) => {
        dashboard.destroy();
      });
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
