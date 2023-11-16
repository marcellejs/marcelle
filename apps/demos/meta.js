export default [
  {
    name: 'Webcam: Dashboard',
    path: 'webcam-dashboard',
    description: 'Simple dashboard for training an image classifier from the webcam',
    glitch: 'https://glitch.com/edit/#!/remix/marcelle-v2-dashboard',
    data: ['image'],
    training: ['browser'],
    task: ['classification'],
    layout: ['dashboard'],
  },
  {
    name: 'Webcam: MLP vs KNN',
    path: 'webcam-mlp-vs-knn',
    description: 'Dashboard for comparing image classification models interactively',
    glitch: 'https://glitch.com/edit/#!/remix/marcelle-v2-mlp-vs-knn',
    data: ['image'],
    training: ['browser'],
    task: ['classification'],
    layout: ['dashboard'],
  },
  {
    name: 'Move2Music',
    path: 'webcam-move2music',
    description: 'Control music playback from webcam-based image recognition',
    glitch: 'https://glitch.com/edit/#!/remix/marcelle-v2-move2audio',
    data: ['image'],
    training: ['browser'],
    task: ['classification'],
    layout: ['dashboard', 'wizard'],
  },
  {
    name: 'Sketching (Simple)',
    path: 'sketch-simple',
    description: 'An initial prototype for training a sketch classifier',
    glitch: 'https://glitch.com/edit/#!/remix/marcelle-uist2021-sketch-v1',
    data: ['sketch'],
    training: ['browser'],
    task: ['classification'],
    layout: ['dashboard'],
  },
  {
    name: 'Sketching (Detailed)',
    path: 'sketch-detailed',
    description: 'A variation of the initial prototype, with a more detailed dashboard',
    glitch: 'https://glitch.com/edit/#!/remix/marcelle-uist2021-sketch-v1b',
    data: ['sketch'],
    training: ['browser'],
    task: ['classification'],
    layout: ['dashboard'],
  },
  {
    name: 'Sketching (Online)',
    path: 'sketch-online',
    description: 'A version of the application with an improved workflow using online learning',
    glitch: 'https://glitch.com/edit/#!/remix/marcelle-uist2021-sketch-v2',
    data: ['sketch'],
    training: ['browser'],
    task: ['classification'],
    layout: ['dashboard'],
  },
  {
    name: 'Object Detection',
    path: 'object-detection',
    description: 'Object detection using COCO-SSD',
    data: ['image'],
    training: ['pretrained'],
    task: ['object detection'],
    layout: ['dashboard'],
  },
  {
    name: 'K-Means Clustering',
    path: 'kmeans-clustering',
    description: 'K-Means clustering on Mobilenet Features',
    data: ['image'],
    training: ['browser'],
    task: ['clustering'],
    layout: ['dashboard'],
  },
  {
    name: 'IRIS Flower Classification',
    path: 'iris',
    description: 'Simple classification on the IRIS dataset with interactive prediction',
    data: ['CSV'],
    training: ['browser'],
    task: ['classification'],
    layout: ['dashboard'],
  },
  {
    name: 'IRIS with Scikit-Learn',
    path: 'iris-sklearn',
    description: 'Simple classification on the IRIS dataset using scikit-learn and ONNX',
    data: ['CSV'],
    training: ['python'],
    task: ['classification'],
    layout: ['dashboard'],
  },
  {
    name: 'Diabetes Regression with Tensorflow.js',
    path: 'diabetes-tfjs',
    description: 'Diabetes disease progression prediction using scikit-learn and ONNX',
    data: ['CSV'],
    training: ['python'],
    task: ['regression'],
    layout: ['dashboard'],
  },
  {
    name: 'Diabetes Regression with Scikit-Learn and ONNX',
    path: 'diabetes-sklearn-onnx',
    description: 'Diabetes disease progression prediction using scikit-learn and ONNX',
    data: ['CSV'],
    training: ['python'],
    task: ['regression'],
    layout: ['dashboard'],
  },
  {
    name: 'UMAP',
    path: 'umap',
    description: 'Custom component implementing dataset visualization with UMAP',
    data: ['image'],
    training: ['browser'],
    task: ['classification'],
    layout: ['dashboard'],
    features: ['custom component'],
    hasPackage: true,
  },
  {
    name: 'Grad-CAM (on mobilenet)',
    path: 'gradcam-pretrained',
    description:
      'explaining predictions with Grad-CAM visualizations on a pretrained mobilenet model',
    data: ['image'],
    training: ['pretrained'],
    task: ['classification'],
    layout: ['dashboard'],
    features: ['custom component'],
  },
  {
    name: 'Grad-CAM (with Transfer Learning)',
    path: 'gradcam-transfer',
    description: 'explaining predictions with Grad-CAM visualizations on a custom image classifier',
    data: ['image'],
    training: ['browser'],
    task: ['classification'],
    layout: ['dashboard'],
    features: ['custom component'],
  },
  {
    name: 'Mobilenet Tetris',
    path: 'mobilenet-tetris',
    description: 'A tetris game controlled from your webcam using image classification',
    data: ['image'],
    training: ['browser'],
    task: ['classification'],
    layout: ['custom'],
    hasPackage: true,
  },
  {
    name: 'Pose Classification',
    path: 'pose-detection',
    description: 'Simple posture classification from optical pose detection',
    // glitch: 'https://glitch.com/edit/#!/remix/marcelle-v2-dashboard',
    data: ['movement'],
    training: ['browser'],
    task: ['classification'],
    layout: ['dashboard'],
  },
  {
    name: 'Audio Classification',
    path: 'audio-classification',
    description: 'Speech Command classification??',
    data: ['audio'],
    training: ['browser'],
    task: ['classification'],
    layout: ['dashboard'],
    draft: true,
  },
  {
    name: 'Video Upload',
    path: 'video-upload',
    description: 'Testing Stuff',
    data: ['video'],
    training: ['none'],
    task: ['misc'],
    layout: ['dashboard'],
    draft: true,
  },
];
