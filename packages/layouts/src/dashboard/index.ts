import { DashboardPage } from './dashboard_page';
import DashboardComponent from './Dashboard.svelte';
import { DashboardSettings } from './dashboard_settings';
import { BehaviorSubject } from 'rxjs';
import { mount, unmount } from 'svelte';

export interface DashboardOptions {
  title: string;
  author: string;
  closable?: boolean;
}

export class Dashboard {
  panels: Record<string, DashboardPage> = {};
  app?: {
    $on?(type: string, callback: (e: unknown) => void): () => void;
    $set?(props: Partial<Record<string, unknown>>): void;
  } & Record<string, unknown>;
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
    this.app = mount(DashboardComponent, {
      target: document.body,
      props: {
        title: this.title,
        author: this.author,
        dashboards: this.panels,
        settings: this.settings,
        page: this.$page,
        closable: this.closable,
        onquit: () => {
          this.$active.next(false);
          if (this.app) {
            unmount(this.app);
          }
          for (const panel of Object.values(this.panels)) {
            panel.destroy();
          }
          this.app = undefined;
        },
      },
    });
    this.$active.next(true);
  }

  hide(): void {
    this.$active.next(false);
    if (this.app) {
      unmount(this.app);
    }
    for (const panel of Object.values(this.panels)) {
      panel.destroy();
    }
    this.app = undefined;
  }
}

export function dashboard(options: DashboardOptions): Dashboard {
  return new Dashboard(options);
}
