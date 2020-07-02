<template>
  <el-card shadow="hover">
    <div slot="header" class="clearfix card-header">
      <span>{{ title }}</span>
      <div>
        <el-tooltip
          v-for="(opt, key) in optionsObj"
          :key="`tag_${key}`"
          effect="dark"
          placement="top-end"
        >
          <div slot="content">{{ key }}</div>
          <el-tag size="mini">{{ opt }}</el-tag>
        </el-tooltip>
        <el-tooltip effect="dark" placement="top-end">
          <div slot="content">
            <slot name="description" />
          </div>
          <el-tag size="mini" type="info">
            <i class="el-icon-question" />
          </el-tag>
        </el-tooltip>
      </div>
    </div>
    <el-alert v-if="!!error" :title="error.toString()" show-icon type="error" />
    <slot />
  </el-card>
</template>

<script>
export default {
  name: 'CardWrapper',
  props: {
    title: {
      type: String,
      required: true,
    },
    options: {
      type: String,
      default: () => '',
    },
  },
  data() {
    return {
      error: null,
    };
  },
  computed: {
    optionsObj() {
      if (!this.options) return {};
      const opts = {};
      this.options
        .split(';')
        .filter(x => !!x)
        .forEach(opt => {
          const [key, val] = opt.split('=');
          opts[key] = val;
        });
      return opts;
    },
  },
  errorCaptured(e) {
    this.error = e;
    this.$notify.error({
      title: 'Error',
      duration: 4000,
      message: e.toString(),
    });
  },
};
</script>
