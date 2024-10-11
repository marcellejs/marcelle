import { DashboardPage } from './dashboard_page';
import DashboardComponent from './Dashboard.svelte';
import { DashboardSettings } from './dashboard_settings';
import { BehaviorSubject } from 'rxjs';

export interface DashboardOptions {
  title: string;
  author: string;
  closable?: boolean;
}

export class Dashboard {
  panels: Record<string, DashboardPage> = {};
  app?: DashboardComponent;
  settings = new DashboardSettings();

  $active = new BehaviorSubject(false as boolean);
  $page = new BehaviorSubject('');

  title: string;
  author: string;
  closable: boolean;

  constructor({
    title = 'Hello, Marcelle!',
    author = 'author',
    closable = false,
  }: DashboardOptions) {
    this.title = title;
    this.author = author;
    this.closable = closable;
  }

  page(name: string, showSidebar?: boolean): DashboardPage {
    if (!Object.keys(this.panels).includes(name)) {
      this.panels[name] = new DashboardPage(name, showSidebar);
    }
    return this.panels[name];
  }

  show(): void {
    this.app = new DashboardComponent({
      target: document.body,
      props: {
        title: this.title,
        author: this.author,
        dashboards: this.panels,
        settings: this.settings,
        page: this.$page,
        closable: this.closable,
      },
    });
    this.$active.next(true);
    this.app.$on('quit', () => {
      this.$active.next(false);
      this.app?.$destroy();
      for (const panel of Object.values(this.panels)) {
        panel.destroy();
      }
      this.app = undefined;
    });
  }

  hide(): void {
    this.app?.quit();
  }
}

export function dashboard(options: DashboardOptions): Dashboard {
  return new Dashboard(options);
}
