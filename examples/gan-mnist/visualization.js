/* global tf */

let diNextId = 0;
class DisplayImage {
  constructor(imgStream) {
    this.id = `module-display-${++diNextId}`;
    this.imgStream = imgStream;
  }

  mount(targetSelector) {
    const target = document.querySelector(targetSelector || `#${this.id}`);
    const displayCanvas = document.createElement('canvas');
    displayCanvas.style.width = '200px';
    displayCanvas.style.height = '200px';
    displayCanvas.style.imageRendering = 'crisp-edges';
    displayCanvas.getContext('2d').imageSmoothingEnabled = false;
    target.appendChild(displayCanvas);
    const unSub = this.imgStream.subscribe((img) => {
      tf.browser.toPixels(img, displayCanvas);
    });
    this.destroy = () => {
      unSub();
      target.removeChild(displayCanvas);
    };
  }

  // eslint-disable-next-line class-methods-use-this
  destroy() {}
}

export function displayImage(s, name) {
  const m = new DisplayImage(s);
  m.name = name;
  return m;
}
