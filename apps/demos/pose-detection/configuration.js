import { select, text } from '@marcellejs/core';
import { BehaviorSubject, map } from 'rxjs';

export const skeletonImage = text('<img src="/movenet.png">');
skeletonImage.title = 'Keypoints Overview';

export const selectPreset = select(
  ['Full', 'Upper Body', 'Head'],
  localStorage.getItem('keypoints-preset') || 'Upper Body',
);
selectPreset.title = 'Select the Skeletong Preset';

selectPreset.$value.subscribe((x) => localStorage.setItem('keypoints-preset', x));

export const $joints = new BehaviorSubject(undefined);
selectPreset.$value
  .pipe(
    map((preset) => {
      if (preset === 'Head') {
        return [0, 1, 2, 3, 4];
      }
      if (preset === 'Upper Body') {
        return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      }
      return undefined;
    }),
  )
  .subscribe($joints);
