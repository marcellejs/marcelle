import { fileUpload, select } from '@marcellejs/core';
import { onnxModel } from '@marcellejs/onnx';

/**
 * @warning
 * onnxruntime-web is not included in the build, to use the `onnxModel` component,
 * add the following line to your `index.html`:
 * <script src="https://cdn.jsdelivr.net/npm/onnxruntime-web@dev/dist/ort.js"></script>
 */
export const classifier = onnxModel({
  inputType: 'generic',
  taskType: 'classification',
  inputShape: [1, 4],
});
classifier.labels = ['Setosa', 'Versicolor', 'Virginica'];

const selectModel = select(['iris_rf.onnx', 'iris_svc.onnx']);
selectModel.title = 'Select a Python-Trained Model';
selectModel.$value.subscribe((v) => {
  classifier.loadFromUrl(`/${v}`);
});

const uploadModel = fileUpload();
uploadModel.title = 'Upload model file (.onnx)';

uploadModel.$files.subscribe((fl) => {
  classifier.loadFromFile(fl[0]);
});

export const components = [selectModel, uploadModel, classifier];

export function setup(dash) {
  dash.page('Choose Model').sidebar(selectModel, uploadModel, classifier);
  dash.settings.models(classifier);
}
