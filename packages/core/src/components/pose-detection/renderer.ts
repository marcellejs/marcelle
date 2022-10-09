// From Google (2021), Apache Licence:
// https://github.com/tensorflow/tfjs-models/blob/master/pose-detection/demos
import type { Pose } from '.';
import { SupportedModels, util } from '@tensorflow-models/pose-detection';

const scoreThresholds = {
  MoveNet: 0.35,
  PoseNet: 0.5,
  BlazePose: 0.65,
};

const COLOR_PALETTE = [
  '#ffffff', // #ffffff - White
  '#800000', // #800000 - Maroon
  '#469990', // #469990 - Malachite
  '#e6194b', // #e6194b - Crimson
  '#42d4f4', // #42d4f4 - Picton Blue
  '#fabed4', // #fabed4 - Cupid
  '#aaffc3', // #aaffc3 - Mint Green
  '#9a6324', // #9a6324 - Kumera
  '#000075', // #000075 - Navy Blue
  '#f58231', // #f58231 - Jaffa
  '#4363d8', // #4363d8 - Royal Blue
  '#ffd8b1', // #ffd8b1 - Caramel
  '#dcbeff', // #dcbeff - Mauve
  '#808000', // #808000 - Olive
  '#ffe119', // #ffe119 - Candlelight
  '#911eb4', // #911eb4 - Seance
  '#bfef45', // #bfef45 - Inchworm
  '#f032e6', // #f032e6 - Razzle Dazzle Rose
  '#3cb44b', // #3cb44b - Chateau Green
  '#a9a9a9', // #a9a9a9 - Silver Chalice
];

export class SkeletonRenderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  params: {
    lineWidth: number;
    radius: number;
    scoreThreshold: number;
  };

  constructor(public model: SupportedModels, public width: number) {
    this.params = {
      lineWidth: 2,
      radius: 4,
      scoreThreshold: scoreThresholds[model],
    };
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.width;
    this.ctx = this.canvas.getContext('2d');
  }

  drawKeypoint(keypoint: Pose['keypoints'][0]) {
    // If score is null, just show the keypoint.
    const score = keypoint.score != null ? keypoint.score : 1;
    // const scoreThreshold = params.STATE.modelConfig.scoreThreshold || 0;

    if (score >= this.params.scoreThreshold) {
      const circle = new Path2D();
      circle.arc(keypoint.x, keypoint.y, this.params.radius, 0, 2 * Math.PI);
      this.ctx.fill(circle);
      this.ctx.stroke(circle);
    }
  }

  /**
   * Draw the keypoints on the video.
   * @param keypoints A list of keypoints.
   */
  drawKeypoints(keypoints: Pose['keypoints']) {
    const keypointInd = util.getKeypointIndexBySide(this.model);
    this.ctx.fillStyle = 'Red';
    this.ctx.strokeStyle = 'White';
    this.ctx.lineWidth = this.params.lineWidth;

    for (const i of keypointInd.middle) {
      this.drawKeypoint(keypoints[i]);
    }

    this.ctx.fillStyle = 'Green';
    for (const i of keypointInd.left) {
      this.drawKeypoint(keypoints[i]);
    }

    this.ctx.fillStyle = 'Orange';
    for (const i of keypointInd.right) {
      this.drawKeypoint(keypoints[i]);
    }
  }

  /**
   * Draw the skeleton of a body on the video.
   * @param keypoints A list of keypoints.
   */
  drawSkeleton(keypoints: Pose['keypoints'], poseId: number) {
    // Each poseId is mapped to a color in the color palette.
    const color =
      //params.STATE.modelConfig.enableTracking &&
      poseId != null ? COLOR_PALETTE[poseId % 20] : 'White';
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = this.params.lineWidth;

    util.getAdjacentPairs(this.model).forEach(([i, j]) => {
      const kp1 = keypoints[i];
      const kp2 = keypoints[j];

      // If score is null, just show the keypoint.
      const score1 = kp1.score != null ? kp1.score : 1;
      const score2 = kp2.score != null ? kp2.score : 1;
      const scoreThreshold = this.params.scoreThreshold || 0;

      if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
        this.ctx.beginPath();
        this.ctx.moveTo(kp1.x, kp1.y);
        this.ctx.lineTo(kp2.x, kp2.y);
        this.ctx.stroke();
      }
    });
  }

  // drawKeypoints3D(keypoints: Pose['keypoints3D']) {
  //   const pointsData = keypoints.map((keypoint) => [-keypoint.x, -keypoint.y, -keypoint.z]);

  //   const dataset = new scatter.ScatterGL.Dataset([...pointsData, ...ANCHOR_POINTS]);

  //   const keypointInd = util.getKeypointIndexBySide(model);
  //   this.scatterGL.setPointColorer((i) => {
  //     if (keypoints[i] == null || keypoints[i].score < params.scoreThreshold) {
  //       // hide anchor points and low-confident points.
  //       return '#ffffff';
  //     }
  //     if (i === 0) {
  //       return '#ff0000' /* Red */;
  //     }
  //     if (keypointInd.left.indexOf(i) > -1) {
  //       return '#00ff00' /* Green */;
  //     }
  //     if (keypointInd.right.indexOf(i) > -1) {
  //       return '#ffa500' /* Orange */;
  //     }
  //   });

  //   if (!this.scatterGLHasInitialized) {
  //     this.scatterGL.render(dataset);
  //   } else {
  //     this.scatterGL.updateDataset(dataset);
  //   }
  //   const connections = util.getAdjacentPairs(model);
  //   const sequences = connections.map((pair) => ({ indices: pair }));
  //   this.scatterGL.setSequences(sequences);
  //   this.scatterGLHasInitialized = true;
  // }

  drawResult(pose: Pose) {
    if (pose.keypoints != null) {
      this.drawKeypoints(pose.keypoints);
      this.drawSkeleton(pose.keypoints, pose.id);
    }
    if (
      pose.keypoints3D != null // && params.STATE.modelConfig.render3D
      // TODO: 3D as option?
    ) {
      // drawKeypoints3D(pose.keypoints3D);
      throw new Error('Keypoints 3D is not Implemented...');
    }
  }

  drawResults(poseList: Pose[]) {
    for (const pose of poseList) {
      this.drawResult(pose);
    }
  }

  drawImage(img: ImageData) {
    this.ctx.clearRect(0, 0, img.width, img.width);
    this.canvas.height = img.height;
    this.canvas.width = img.width;
    this.ctx.putImageData(img, 0, 0);
  }

  render(img: ImageData, poseList: Pose[], format = 'ImageData') {
    this.drawImage(img);
    this.drawResults(poseList);
    if (format === 'ImageData') return this.ctx.getImageData(0, 0, this.width, this.width);
    return this.canvas.toDataURL('image/jpeg');
  }
}
