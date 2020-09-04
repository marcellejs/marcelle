import { DashboardPage } from './dashboard_page';
import DashboardAppComponent from './DashboardApp.svelte';
import { Dataset } from '../modules/dataset';

export interface DashboardOptions {
  title: string;
  author: string;
  datasets: Dataset[];
}

export class DashboardApp {
  panels: Record<string, DashboardPage> = {};
  app?: DashboardAppComponent;

  constructor(
    private title = 'Hello, Marcelle!',
    private author = 'author',
    private datasets: Dataset[] = [],
  ) {}

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
        datasets: this.datasets,
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
  return new DashboardApp(options.title, options.author, options.datasets);
}
