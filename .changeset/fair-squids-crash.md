---
'@marcellejs/core': patch
---

A new method `.get()` was added to streams, in order to avoid accessing `.value` directly, which was found confusing for beginners.
To update your code, replace `$<stream>.value` by `$<stream>.get()`, for example:

```js
input.$images
  .filter(() => capture.$pressed.get()) // instead of capture.$pressed.value
  .map(async (img) => ({
    x: await featureExtractor.process(img),
    thumbnail: input.$thumbnails.get(), // instead of input.$thumbnails.value
    y: label.$value.get(), // instead of label.$value.value
  }));
```
