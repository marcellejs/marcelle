# How to use my model?

We propose a simple decision tree to to help you understand how to integrate a machine learning model in a Marcelle application.

<script setup>
import VPButton from '../../components/VPButton.vue'
import { computed, ref, watch } from 'vue';

const path = ref(location.hash ? location.hash.slice(1).split('-') : []);
const existing = computed(() => path.value.length > 0 ? path.value[0] === 'true' : undefined);
const inference = computed(() => (existing.value && path.value.length > 1) ? path.value[1] === 'inference' : undefined);
const inferenceFramework = computed(() => inference.value && path.value[2]);
const dataset = computed(() => existing.value !== undefined && existing.value === false && path.value[1]);
const trainLanguage = computed(() => dataset.value  !== undefined && dataset.value === 'marcelle' && path.value[2]);

watch(path, async (newPath, oldPath) => {
  // const newLoc = location.split('#')[0] + '#' + newPath.join('-');
  // console.log('path', newPath.join('-'), location, newLoc);
  location.hash = '#' + newPath.join('-');
});
</script>

**Do you have a pre-existing model?**

<div :class="$style.container">
<button :class="{ [$style.button]: true, [$style.active]: existing}" @click="path = ['true']">
  Yes
</button>
<button :class="{ [$style.button]: true, [$style.active]: existing === false}" @click="path = ['false']">
  No
</button>
</div>

<div v-show="existing" style="margin-top: 2rem;">

**What do you want to do?**

<div :class="$style.container">
<button
  :class="{ [$style.button]: true, [$style.active]: inference === true}"
  @click="path = [path[0], 'inference']">
  Run Inference
</button>
<button
  :class="{ [$style.button]: true, [$style.active]: inference === false}"
  @click="path = [path[0], 'finetune']">
  Fine-tune the model
</button>
</div>

</div>

<div v-show="inference" style="margin-top: 2rem;">

**What framework do you use?**

<div :class="$style.container">
<button
  :class="{ [$style.button]: true, [$style.active]: inferenceFramework === 'pytorch'}"
  @click="path = [path[0], path[1], 'pytorch']">
  PyTorch
</button>
<button
  :class="{ [$style.button]: true, [$style.active]: inferenceFramework === 'tensorflow'}"
  @click="path = [path[0], path[1], 'tensorflow']">
  Tensorflow/Keras
</button>
<button
  :class="{ [$style.button]: true, [$style.active]: inferenceFramework === 'sklearn'}"
  @click="path = [path[0], path[1], 'sklearn']">
  Scikit-learn
</button>
<button
  :class="{ [$style.button]: true, [$style.active]: inferenceFramework === 'huggingface'}"
  @click="path = [path[0], path[1], 'huggingface']">
  🤗 HuggingFace
</button>
<button
  :class="{ [$style.button]: true, [$style.active]: inferenceFramework === 'other-py'}"
  @click="path = [path[0], path[1], 'other-py']">
  Other (Python)
</button>
<button
  :class="{ [$style.button]: true, [$style.active]: inferenceFramework === 'other-js'}"
  @click="path = [path[0], path[1], 'other-js']">
  Other (JS)
</button>
</div>

</div>

<div v-show="existing === false" style="margin-top: 2rem;">

**What do you want to do?**

<div :class="$style.container">
<button
  :class="{ [$style.button]: true, [$style.active]: dataset === 'fixed'}"
  @click="path = [path[0], 'fixed']">
  Train a model from a fixed dataset
</button>
<button
  :class="{ [$style.button]: true, [$style.active]: dataset === 'marcelle'}"
  @click="path = [path[0], 'marcelle']">
  Train a model from Marcelle data
</button>
</div>

</div>

<div v-show="dataset === 'marcelle'" style="margin-top: 2rem;">

**What language to you want to use?**

<div :class="$style.container">
<button
  :class="{ [$style.button]: true, [$style.active]: trainLanguage === 'python'}"
  @click="path = [path[0], path[1], 'python']">
  Python
</button>
<button
  :class="{ [$style.button]: true, [$style.active]: trainLanguage === 'javascript'}"
  @click="path = [path[0], path[1], 'javascript']">
  JavaScript
</button>
</div>

</div>

<div v-show="inferenceFramework === 'pytorch'" style="margin-top: 2rem;">

<!--@include: ./parts/pretrained-pytorch.md-->

</div>

<div v-show="inferenceFramework === 'tensorflow'" style="margin-top: 2rem;">

<!--@include: ./parts/pretrained-tensorflow.md-->

</div>

<div v-show="inferenceFramework === 'sklearn'" style="margin-top: 2rem;">

<!--@include: ./parts/pretrained-sklearn.md -->

</div>

<div v-show="inferenceFramework === 'huggingface'" style="margin-top: 2rem;">

<!--@include: ./parts/pretrained-huggingface.md -->

</div>

<div v-show="inferenceFramework === 'other-py'" style="margin-top: 2rem;">

<!--@include: ./parts/pretrained-other-py.md -->

</div>

<div v-show="inferenceFramework === 'other-js'" style="margin-top: 2rem;">

<!--@include: ./parts/pretrained-other-js.md -->

</div>

<div v-show="dataset === 'fixed'" style="margin-top: 2rem;">

### Good for you!

Train your model and come back to the start.

</div>

<div v-show="trainLanguage === 'python'" style="margin-top: 2rem;">

<!--@include: ./parts/train-marcelle-python.md -->

</div>

<div v-show="trainLanguage === 'javascript'" style="margin-top: 2rem;">

<!--@include: ./parts/train-marcelle-js.md -->

</div>

<style module>
.container {
  display: flex;
  flex-wrap: wrap;
  column-gap: 0.5rem;
  row-gap: 0.5rem;
}

.button {
  background-color: LightSlateGray;
  padding: 1rem;
  border-radius: 1rem;
  color: white;
  font-weight: bold;
}

.button:hover {
  background-color: #5b6a79;
}

.button.active {
  background-color: rgb(244, 109, 9);
}

.button.active:hover {
  background-color: rgb(217, 93, 1);
}

.tip {
  background-color: SlateGray;
  font-size: 0.9rem;
  color: white;
  margin-left: 1rem;
  margin-top: -0.5rem;
  padding: 0.2rem 0.5rem;
  border-radius: 0.5rem;
}
</style>
