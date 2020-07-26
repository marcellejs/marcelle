import { DashboardPage } from './dashboard_page';
import DashboardAppComponent from './DashboardApp.svelte';

export interface DashboardOptions {
  title: string;
  author: string;
}

export class DashboardApp {
  panels: Record<string, DashboardPage> = {};
  app?: DashboardAppComponent;

  constructor(private title = 'Hello, Marcelle!', private author = 'author') {}

  page(name: string): DashboardPage {
    if (!Object.keys(this.panels).includes(name)) {
      this.panels[name] = new DashboardPage(name);
    }
    return this.panels[name];
  }

  start(): void {
    this.app = new DashboardAppComponent({
      target: document.body,
      props: {
        title: this.title,
        author: this.author,
        dashboards: this.panels,
      },
    });
    this.app.$on('quit', () => {
      this.app?.$destroy();
      Object.values(this.panels).forEach((dashboard) => {
        dashboard.destroy();
      });
      this.app = undefined;
    });
  }

  destroy(): void {
    this.app?.quit();
  }
}

export function createDashboard(options: DashboardOptions): DashboardApp {
  return new DashboardApp(options.title, options.author);
}
