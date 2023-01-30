import devicemotion from '@ircam/devicemotion';
import { Component, Stream } from '../../core';
import View from './device-motion.view.svelte';

export class DeviceMotion extends Component {
  title = 'Device Motion';

  $active = new Stream<boolean>(false, true);
  $acceleration = new Stream<[number, number, number]>(undefined, false);
  $accelerationIncludingGravity = new Stream<[number, number, number]>(undefined, false);
  $rotationRate = new Stream<[number, number, number]>(undefined, false);

  // $acceleration = new Stream<DeviceMotionEventAcceleration>(undefined, false);
  // $accelerationIncludingGravity = new Stream<DeviceMotionEventAcceleration>(undefined, false);
  // $rotationRate = new Stream<DeviceMotionEventRotationRate>(undefined, false);

  constructor() {
    super();
    this.$active.filter((v) => !!v).subscribe(this.setup);
    this.$active.filter((v) => !v).subscribe(this.takeDown);
    this.start();
  }

  setup() {
    devicemotion.requestPermission().then((permission) => {
      if (permission === 'granted') {
        devicemotion.addEventListener(this.callback);
      }
    });
  }

  takeDown() {
    devicemotion.removeEventListener(this.callback);
  }

  callback(e: DeviceMotionEvent): void {
    // // XYZ Format
    // this.$acceleration.set({ ...e.acceleration });
    // this.$accelerationIncludingGravity.set({ ...e.accelerationIncludingGravity });
    // this.$rotationRate.set({ ...e.rotationRate });

    this.$acceleration.set([e.acceleration.x, e.acceleration.y, e.acceleration.z]);
    this.$accelerationIncludingGravity.set([
      e.accelerationIncludingGravity.x,
      e.accelerationIncludingGravity.y,
      e.accelerationIncludingGravity.z,
    ]);
    this.$rotationRate.set([e.rotationRate.alpha, e.rotationRate.beta, e.rotationRate.gamma]);
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
      target: t,
      props: {
        title: this.title,
        active: this.$active,
        acceleration: this.$accelerationIncludingGravity,
      },
    });
  }
}
