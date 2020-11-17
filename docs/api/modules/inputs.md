---
sidebarDepth: 1
---

# Inputs

## Faker

```tsx
marcelle.faker({ size?: number, period?: number }): Faker;
```

A module producing a synthetic data stream composed of periodic events with random vectors.

### Parameters

| Option | Type   | Description          | Required | Default |
| ------ | ------ | -------------------- | :------: | :-----: |
| size   | number | Vector size          |          |   32    |
| period | number | Sampling period (ms) |          |  1000   |

### Streams

| Name     | Type               | Description             | Hold |
| -------- | ------------------ | ----------------------- | :--: |
| \$frames | Stream\<number[]\> | Stream of random events |      |

<!-- ## Screenshot

<div style="background: rgb(237, 242, 247); padding: 8px; margin-top: 1rem;">
  <img src="./images/faker.png" alt="Screenshot of the faker component">
</div> -->

### Example

```js
const faker = marcelle.faker({ size: 12, period: 500 });
faker.$frames.subscribe((x) => console.log('faker $frames:', x));
```

## ImageDrop

```tsx
marcelle.imageDrop(): ImageDrop;
```

An Image drag'n'drop component, that creates a stream of images and thumbnails.

### Streams

| Name         | Type                | Description                                                                                                                        | Hold |
| ------------ | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | :--: |
| \$images     | Stream\<ImageData\> | Stream of images in the [ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) format.                            |
| \$thumbnails | Stream\<string\>    | Stream of thumbnail images in base64 [dataURI](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) format. |      |

### Screenshot

<div style="background: rgb(237, 242, 247); padding: 8px; margin-top: 1rem;">
  <img src="./images/imageDrop.png" alt="Screenshot of the imageDrop component" width="350">
</div>

### Example

```js
const imgDrop = marcelle.imageDrop();
imgDrop.$images.subscribe((x) => console.log('imageDrop $images:', x));
```

## Sketchpad

```tsx
marcelle.sketchpad(): Sketchpad;
```

An input sketching component allowing the user to draw. The module generates a stream of images of the sketches, as well as stream for various user actions.

### Streams

| Name          | Type                | Description                                                                                                                        | Hold |
| ------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | :--: |
| \$images      | Stream\<ImageData\> | Stream of images in the [ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) format.                            |
| \$thumbnails  | Stream\<string\>    | Stream of thumbnail images in base64 [dataURI](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) format. |      |
| \$strokeStart | Stream\<undefined\> | Stream of empty (undefined) events occurring every time the user starts drawing                                                    |      |
| \$strokeEnd   | Stream\<undefined\> | Stream of empty (undefined) events occurring every time the user stops drawing                                                     |      |

### Screenshot

<div style="background: rgb(237, 242, 247); padding: 8px; margin-top: 1rem;">
  <img src="./images/sketchpad.png" alt="Screenshot of the sketchpad component" width="350">
</div>

### Example

```js
const sketch = marcelle.sketchpad();
sketch.$strokeStart.subscribe(() => console.log('imageDrop $strokeStart'));
sketch.$strokeEnd.subscribe(() => console.log('imageDrop $strokeEnd'));
```

## Webcam

```tsx
marcelle.webcam({ width?: number, height?: number, period?: number }): Webcam;
```

A webcam source component, producing a periodic stream of images.

### Parameters

| Option | Type   | Description                                  | Required | Default |
| ------ | ------ | -------------------------------------------- | :------: | :-----: |
| width  | number | The target image width                       |          |   224   |
| height | number | The target image height                      |          |   224   |
| period | number | The period in ms at which images are sampled |          |   50    |

### Streams

| Name          | Type                  | Description                                                                                                                        | Hold |
| ------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | :--: |
| \$images      | Stream\<ImageData\>   | Stream of images in the [ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) format.                            |
| \$thumbnails  | Stream\<string\>      | Stream of thumbnail images in base64 [dataURI](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) format. |      |
| \$active      | Stream\<boolean\>     | Boolean stream specifying if the webcam is active (streaming)                                                                      |      |
| \$ready       | Stream\<boolean\>     | Boolean stream specifying if the webcam is ready                                                                                   |      |
| \$mediastream | Stream\<MediaStream\> | Stream of MediaStream corresponding to the selected webcam. Events are emitted whenever a webcam is selected.                      |      |

### Screenshot

<div style="background: rgb(237, 242, 247); padding: 8px; margin-top: 1rem;">
  <img src="./images/webcam.png" alt="Screenshot of the webcam component" width="350">
</div>

### Example

```js
const webcam = marcelle.webcam();
webcam.$images.subscribe((x) => console.log('webcam $images:', x));
```
