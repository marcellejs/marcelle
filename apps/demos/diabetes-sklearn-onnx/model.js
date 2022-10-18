import { fileUpload, onnxModel, select } from '@marcellejs/core';

/**
 * @warning
 * onnxruntime-web is not included in the build, to use the `onnxModel` component,
 * add the following line to your `index.html`:
 * <script src="https://cdn.jsdelivr.net/npm/onnxruntime-web@dev/dist/ort.js"></script>
 */
export const model = onnxModel({
  inputType: 'generic',
  taskType: 'generic',
  inputShape: [1, 10],
});

const selectModel = select(['diabetes_linear_model.onnx', 'diabetes_random_forest.onnx']);
selectModel.title = 'Select a Python-Trained Model';
selectModel.$value.subscribe((v) => {
  model.loadFromUrl(`/${v}`);
});

const uploadModel = fileUpload();
uploadModel.title = 'Upload model file (.onnx)';

uploadModel.$files.subscribe((fl) => {
  model.loadFromFile(fl[0]);
});

export const components = [selectModel, uploadModel, model];

export function setup(dash) {
  dash.page('Choose Model').sidebar(selectModel, uploadModel).use(model);
  dash.settings.models(model);
}
