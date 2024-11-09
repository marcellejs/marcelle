import { BehaviorSubject } from 'rxjs';
import WizardComponent from './Wizard.svelte';
import { WizardPage } from './wizard_page';
import { mount, unmount } from 'svelte';

export class Wizard {
  pages: WizardPage[] = [];
  app: {
    $on?(type: string, callback: (e: unknown) => void): () => void;
    $set?(props: Partial<Record<string, unknown>>): void;
  } & Record<string, unknown> = undefined;

  $current = new BehaviorSubject(0);

  page(): WizardPage {
    const s = new WizardPage(this.page.bind(this));
    this.pages.push(s);
    return s;
  }

  show(): void {
    this.app = mount(WizardComponent, {
      target: document.body,
      props: {
        pages: this.pages,
        current: this.$current,
        onquit: () => {
          if (this.app) {
            unmount(this.app);
          }
          this.app = undefined;
        },
      },
    });
  }

  hide(): void {
    if (this.app) {
      unmount(this.app);
    }
    this.app = undefined;
  }
}

export function wizard(): Wizard {
  return new Wizard();
}
