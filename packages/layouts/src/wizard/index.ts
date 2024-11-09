import { BehaviorSubject } from 'rxjs';
import WizardComponent from './Wizard.svelte';
import { WizardPage } from './wizard_page';
import { mount } from 'svelte';

export class Wizard {
  pages: WizardPage[] = [];
  app: {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Record<string, any>>): void;
  } & Record<string, any> = undefined;

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
        // onquit: () => {
        //   this.app?.$destroy();
        //   this.app = undefined;
        // },
      },
    });
  }

  hide(): void {
    this.app?.quit();
  }
}

export function wizard(): Wizard {
  return new Wizard();
}
