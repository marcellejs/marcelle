/* eslint-disable max-classes-per-file */
/* global tf */

let dtNextId = 0;
class DisplayTensor {
  constructor(imgStream) {
    this.id = `module-display-${++dtNextId}`;
    this.imgStream = imgStream;
    this.title = 'diplay image';
  }

  mount(target) {
    const t = target || document.querySelector(`#${this.id}`);
    const displayCanvas = document.createElement('canvas');
    displayCanvas.style.width = '200px';
    displayCanvas.style.height = '200px';
    displayCanvas.style.imageRendering = 'crisp-edges';
    displayCanvas.getContext('2d').imageSmoothingEnabled = false;
    t.innerHTML = `<span class="card-title svelte-1mqcbxb">${this.title}</span>`;
    t.appendChild(displayCanvas);
    const unSub = this.imgStream.subscribe((img) => {
      tf.browser.toPixels(img, displayCanvas);
    });
    this.destroy = () => {
      unSub();
      t.removeChild(displayCanvas);
    };
  }

  // eslint-disable-next-line class-methods-use-this
  destroy() {}
}

let dsNextId = 0;
class DisplaySamples {
  constructor(ganModel) {
    this.id = `module-display-samples-${++dsNextId}`;
    this.ganModel = ganModel;
    this.title = 'GAN-generated Samples';
  }

  mount(target) {
    const t = target || document.querySelector(`#${this.id}`);
    t.innerHTML = `<span class="card-title svelte-1mqcbxb">${this.title}</span>`;
    const p = document.createElement('p');
    const img = document.createElement('img');
    img.classList.add('w-full');
    const unSub = this.ganModel.$training
      .filter((x) => x.sample)
      .subscribe((x) => {
        p.innerText = `Samples (Generated at epoch ${x.epoch})`;
        img.src = x.sample;
      });
    t.appendChild(p);
    t.appendChild(img);
    this.destroy = () => {
      unSub();
      t.removeChild(p);
      t.removeChild(img);
    };
  }

  // eslint-disable-next-line class-methods-use-this
  destroy() {}
}

// SIMPLER VERSION (glitchy):
// ------------------------------
// const samples = marcelle.text();
// samples.name = 'Samples from the generator';
// samples.$text = gan.$training
//   .filter((x) => x.sample)
//   .map(
//     (x) => `<p>Samples (Generated at epoch ${x.epoch})</p>
//       <img src="${x.sample}" class="w-full">`,
//   );
// ------------------------------

export function displayTensor(s, name) {
  const m = new DisplayTensor(s);
  m.title = name;
  return m;
}

export function displaySamples(s) {
  const m = new DisplaySamples(s);
  return m;
}
