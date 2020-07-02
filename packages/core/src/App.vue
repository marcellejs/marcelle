<template>
  <el-main id="app">
    <h1>{{title}}</h1>
    <div class="row">
      <div class="left">
        <el-tabs tab-position="top">
          <el-tab-pane v-for="(ids, slot) in left" :key="slot" :label="slot">
            <div v-for="id in ids" :key="id" :id="id" ref="id" />
          </el-tab-pane>
          <!-- <el-tab-pane label="Project">
            <project-manager />
          </el-tab-pane> -->
        </el-tabs>
      </div>
      <div class="right">
        <!-- <el-tabs tab-position="top">
          <slot name="tabs" />
        </el-tabs> -->
        <el-tabs tab-position="top">
          <el-tab-pane v-for="(ids, slot) in right" :key="slot" :label="slot">
            <div v-for="id in ids" :key="id" :id="id" ref="id" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </el-main>
</template>

<script>
// import ProjectManager from './ProjectManager.vue';

export default {
  name: 'App',
  // components: { ProjectManager },
  props: {
    title: {
      type: String,
      default: 'Marcelle App',
    },
    left: {
      type: Object,
      default: {},
    },
    right: {
      type: Object,
      default: {},
    },
  },
  // data() {
  //   return {
  //     left: { input: ['test'] },
  //     right: {},
  //   };
  // },
};
</script>

<style>
html,
body {
  font-family: 'Lato', 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
}

p {
  font-size: 0.9em;
  margin: 8px 0;
}

h1 {
  font-size: 1.4em;
}

.el-card {
  margin-bottom: 10px;
}

#app {
  color: #2c3e50;
}

#app > .row {
  display: flex;
}

@media (max-width: 874px) {
  #app > .row {
    flex-direction: column;
  }
}

#app > .row > .left {
  margin-right: 20px;
  width: 350px;
  flex-shrink: 0;
}

#app > .row > .right {
  flex-grow: 1;
  max-width: calc(100% - 370px);
}

.el-card {
  margin: 5px 3px;
  flex-grow: 1;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.el-card__header {
  padding: 2px 10px;
  font-size: 0.8em;
  background-color: #ebeef5;
}

.el-card__body {
  padding: 10px;
}

.el-form--inline .el-form-item {
  margin-bottom: 10px;
}

.el-tooltip__popper a {
  color: white;
}

.marcelle-row {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
}

.dataset .el-badge__content.is-fixed.is-dot {
  right: 8px !important;
  top: 3px !important;
}
</style>
