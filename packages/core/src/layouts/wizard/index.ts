import { BehaviorSubject } from 'rxjs';
import WizardComponent from './Wizard.svelte';
import { WizardPage } from './wizard_page';

export class Wizard {
  pages: WizardPage[] = [];
  app: WizardComponent | undefined = undefined;

  $current = new BehaviorSubject(0);

  // constructor() {
  //   this.$current.start();
  // }

  page(): WizardPage {
    const s = new WizardPage(this.page.bind(this));
    this.pages.push(s);
    return s;
  }

  show(): void {
    this.app = new WizardComponent({
      target: document.body,
      props: {
        pages: this.pages,
        current: this.$current,
      },
    });
    this.app.$on('quit', () => {
      this.app?.$destroy();
      this.app = undefined;
    });
  }

  hide(): void {
    this.app?.quit();
  }
}

export function wizard(): Wizard {
  return new Wizard();
}
