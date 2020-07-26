import WizardComponent from './Wizard.svelte';
import { Stream } from '../core/stream';
import { Step } from './wizard_step';

export class Wizard {
  steps: Step[] = [];
  app: WizardComponent | undefined = undefined;

  $current = new Stream(0, true);

  step(): Step {
    const s = new Step(this.step.bind(this));
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
