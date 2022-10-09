import { select, text } from '@marcellejs/core';

export const skeletonImage = text(
  '<img src="https://camo.githubusercontent.com/b8a385301ca6b034d5f4807505e528b4512a0aa78507dec9ebafcc829b9556be/68747470733a2f2f73746f726167652e676f6f676c65617069732e636f6d2f6d6f76656e65742f636f636f2d6b6579706f696e74732d3530302e706e67">',
);
skeletonImage.title = 'Keypoints Overview';

export const selectPreset = select(
  ['Full', 'Upper Body', 'Head'],
  localStorage.getItem('keypoints-preset') || 'Upper Body',
);
selectPreset.title = 'Select the Skeletong Preset';

selectPreset.$value.subscribe((x) => localStorage.setItem('keypoints-preset', x));

export const $joints = selectPreset.$value.map((preset) => {
  if (preset === 'Head') {
    return [0, 1, 2, 3, 4];
  }
  if (preset === 'Upper Body') {
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  }
  return undefined;
});
