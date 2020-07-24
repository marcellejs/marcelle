/* eslint-disable max-classes-per-file */
// import { Dashboard } from './dashboard';
import WizardComponent from './components/Wizard.svelte';
import { Module } from './module';
import { Stream } from './stream';

class Step {
  modules: Module[] = [];

  attr = { title: '', description: '' };

  constructor(public parent: Wizard) {}

  title(title: string): Step {
    this.attr.title = title;
    return this;
  }

  description(desc: string): Step {
    this.attr.description = desc;
    return this;
  }

  use(...modules: Module[]): Step {
    this.modules = this.modules.concat(modules);
    return this;
  }

  step(): Step {
    return this.parent.step();
  }
}

export class Wizard {
  steps: Step[] = [];
  app: WizardComponent | undefined = undefined;

  $current = new Stream(0, true);

  step(): Step {
    const s = new Step(this);
    this.steps.push(s);
    return s;
  }

  start(): void {
    this.app = new WizardComponent({
      target: document.body,
      props: {
        steps: this.steps,
        current: this.$current,
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

export function createWizard(): Wizard {
  return new Wizard();
}
