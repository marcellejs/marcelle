/* eslint-disable max-classes-per-file */
/* global tf, mostCore */

let dtNextId = 0;
class DisplayTensor {
  constructor(imgStream) {
    this.id = `module-display-${++dtNextId}`;
    this.imgStream = imgStream;
    this.name = 'diplay image';
  }

  mount(targetSelector) {
    const target = document.querySelector(targetSelector || `#${this.id}`);
    const displayCanvas = document.createElement('canvas');
    displayCanvas.style.width = '200px';
    displayCanvas.style.height = '200px';
    displayCanvas.style.imageRendering = 'crisp-edges';
    displayCanvas.getContext('2d').imageSmoothingEnabled = false;
    target.innerHTML = `<span class="card-title svelte-1mqcbxb">${this.name}</span>`;
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

let dsNextId = 0;
class DisplaySamples {
  constructor(ganModel) {
    this.id = `module-display-samples-${++dsNextId}`;
    this.ganModel = ganModel;
    this.name = 'GAN-generated Samples';
  }

  mount(targetSelector) {
    const target = document.querySelector(targetSelector || `#${this.id}`);
    target.innerHTML = `<span class="card-title svelte-1mqcbxb">${this.name}</span>`;
    const p = document.createElement('p');
    const img = document.createElement('img');
    img.classList.add('w-full');
    const unSub = this.ganModel.$training.thru(mostCore.filter((x) => x.sample)).subscribe((x) => {
      p.innerText = `Samples (Generated at epoch ${x.epoch})`;
      img.src = x.sample;
    });
    target.appendChild(p);
    target.appendChild(img);
    this.destroy = () => {
      unSub();
      target.removeChild(p);
      target.removeChild(img);
    };
  }

  // eslint-disable-next-line class-methods-use-this
  destroy() {}
}

// SIMPLER VERSION (glitchy):
// ------------------------------
// const samples = marcelle.text();
// samples.name = 'Samples from the generator';
// samples.$text = gan.$training.thru(mostCore.filter((x) => x.sample)).thru(
//   mostCore.map(
//     (x) => `<p>Samples (Generated at epoch ${x.epoch})</p>
//       <img src="${x.sample}" class="w-full">`,
//   ),
// );
// ------------------------------

export function displayTensor(s, name) {
  const m = new DisplayTensor(s);
  m.name = name;
  return m;
}

export function displaySamples(s) {
  const m = new DisplaySamples(s);
  return m;
}
