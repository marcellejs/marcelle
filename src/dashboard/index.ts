import { DashboardPage } from './dashboard_page';
import DashboardComponent from './Dashboard.svelte';

export interface DashboardOptions {
  title: string;
  author: string;
}

export class Dashboard {
  panels: Record<string, DashboardPage> = {};
  app?: DashboardComponent;
  settings = new DashboardPage('settings');

  constructor(private title = 'Hello, Marcelle!', private author = 'author') {}

  page(name: string): DashboardPage {
    if (!Object.keys(this.panels).includes(name)) {
      this.panels[name] = new DashboardPage(name);
    }
    return this.panels[name];
  }

  start(): void {
    // const target = document.querySelector('#dashboard');
    // if (!target) {
    //   throw new Error('Cannot start dashboard, div#dashboard not found.');
    // }
    this.app = new DashboardComponent({
      target: document.body,
      props: {
        title: this.title,
        author: this.author,
        dashboards: this.panels,
        settings: this.settings,
      },
    });
    this.app.$on('quit', () => {
      this.app?.$destroy();
      Object.values(this.panels).forEach((panel) => {
        panel.destroy();
      });
      this.app = undefined;
    });
  }

  destroy(): void {
    this.app?.quit();
  }
}

export function dashboard(options: DashboardOptions): Dashboard {
  return new Dashboard(options.title, options.author);
}
