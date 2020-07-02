import { Module } from './module';
import { newDefaultScheduler } from '@most/scheduler';
import { Stream } from '@most/types';
import { runEffects } from '@most/core';
import App from './App.vue';
import Vue from 'vue';

interface ApplicationOptions {
  title: string;
  author: string;
  // plugins: [ImagePlugin],
  datasets: string[];
}

class Application {
  started = false;
  // input: Module | undefined;
  modules: Record<string, Module> = {};
  ui: {
    left: Record<string, string[]>;
    right: Record<string, string[]>;
  } = { left: {}, right: {} };
  streams: Stream<unknown>[] = [];
  scheduler = newDefaultScheduler();
  dashboards: string[] = [];

  constructor(
    private title = 'Hello, Marcelle!',
    private author = 'author',
    private datasets: string[] = [],
  ) {}

  //   /**
  //    * Add a new tab
  //    * @param {String} name Tab name
  //    */
  //   tab(name) {
  //     if (!Object.keys(this.tabs).includes(name)) {
  //       this.tabs[name] = new Tab(name);
  //     }
  //     return this.tabs[name];
  //   }

  //   watch(path, callback) {
  //     this.watchers.push({ path, callback });
  //     if (this.running) {
  //       runWatchers(this.$root, this.watchers);
  //     }
  //   }

  //   observable(name, value = undefined) {
  //     const obsExists = Object.keys(this.observables).includes(name);
  //     if (this.running && obsExists && value === undefined) {
  //       return this.$root.$observables[name];
  //     }
  //     this.observables[name] = value;
  //     if (this.running) {
  //       return this.$root.$observables[name];
  //     }
  //     return value;
  //   }

  use(module: Module) {
    this.modules[module.id] = module;
    // if (this.started) {
    //   module.run(this.scheduler);
    // }
  }

  run(stream: Stream<unknown>): void {
    this.streams.push(stream);
    if (this.started) {
      runEffects(stream, this.scheduler);
    }
  }

  input(module: Module) {
    if (!Object.keys(this.modules).includes(module.id)) {
      throw new Error(`Module '${module.id}' hasn't been registered on the application.
        Use \`app.use()\`
      `);
    }
    // const d = document.createElement('div');
    // d.id = module.id;
    // const leftContainer = document.querySelector('#left');
    // leftContainer?.appendChild(d);
    if (!Object.keys(this.ui.left).includes('input')) {
      this.ui.left.input = [];
    }
    this.ui.left.input.push(module.id);
  }

  dashboard(dashboardName: string) {
    if (!Object.keys(this.ui.right).includes(dashboardName)) {
      this.ui.right[dashboardName] = [];
    }
    // let dashboardIndex: number;
    // if (!this.dashboards.includes(dashboardName)) {
    //   dashboardIndex = this.dashboards.push(dashboardName) - 1;
    //   const d = document.createElement('el-tab-pane');
    //   d.id = `dashboard-${dashboardIndex}`;
    //   const rightContainer = document.querySelector('#right');
    //   rightContainer?.appendChild(d);
    // } else {
    //   dashboardIndex = this.dashboards.indexOf(dashboardName);
    // }
    // const dashboardContainer = document.querySelector(`#dashboard-${dashboardIndex}`);
    return {
      use: (module: Module) => {
        if (!Object.keys(this.modules).includes(module.id)) {
          throw new Error(`Module '${module.id}' hasn't been registered on the application.
            Use \`app.use()\`
          `);
        }
        this.ui.right[dashboardName].push(module.id);
      },
    };
  }

  async start(): Promise<Application> {
    console.log('title', this.title);
    console.log('author', this.author);
    console.log('datasets', this.datasets);
    const app = new Vue({
      el: '#app',
      // template: '<App :title="title" />',
      // components: { App },
      // data: {
      //   title: this.title,
      //   left: {
      //     input: ['test'],
      //   },
      //   right: {
      //     yo: ['test'],
      //   },
      // },
      render: (h) =>
        h(App, {
          props: {
            title: this.title,
            left: this.ui.left,
            right: this.ui.right,
          },
        }),
    });
    console.log('app.$data', app.$data);
    // app.$data.left = {
    //   input: ['test'],
    // };
    console.log('app', app);
    Object.values(this.ui.left)
      .reduce((x, y) => x.concat(y), [])
      .concat(Object.values(this.ui.right).reduce((x, y) => x.concat(y), []))
      .forEach((id) => {
        this.modules[id].run(this.scheduler);
      });
    this.streams.forEach((s) => {
      runEffects(s, this.scheduler);
    });
    //     const data = {
    //       slots: this.plugins.map((x) => x.slot).filter((x) => !!x),
    //       ...this.plugins.reduce((c, x) => ({ ...c, ...x.data }), {}),
    //       ...Object.values(this.tabs).reduce((x, y) => ({ ...x, ...y.data }), {}),
    //       observables: this.observables,
    //     };
    //     Vue.use(coreVuePlugin);
    //     const store = new Vuex.Store();
    //     const setupPlugins = this.plugins.map(
    //       ({ plugin }) =>
    //         new Promise((resolve, reject) => {
    //           try {
    //             Vue.use(plugin, {
    //               store,
    //               appSpec: this,
    //               loaded() {
    //                 resolve();
    //               },
    //             });
    //           } catch (e) {
    //             reject(e);
    //           }
    //         }),
    //     );
    //     await Promise.all(setupPlugins);
    //     this.$root = new Vue({
    //       el: '#app',
    //       store,
    //       components: this.components,
    //       data,
    //       template: this.markup,
    //     });
    //     runWatchers(this.$root, this.watchers);
    //     this.running = true;
    this.started = true;
    return this;
  }

  //   get components() {
  //     return {
  //       ...this.plugins.reduce((c, x) => ({ ...c, ...x.components }), {}),
  //       ...Object.values(this.tabs).reduce((x, { components }) => ({ ...x, ...components }), {}),
  //     };
  //   }

  //   get markup() {
  //     const pluginsMarkup = this.plugins.reduce((m, x) => m + x.markup, '');
  //     const tabsMarkup = Object.values(this.tabs).reduce(
  //       (x, y) => `${x}<el-tab-pane label="${y.name}">${y.markup}</el-tab-pane>`,
  //       '',
  //     );
  //     return `
  // <marcelle-app :slots="slots">
  //   ${pluginsMarkup}
  //   <template v-slot:tabs>
  //     ${tabsMarkup}
  //   </template>
  // </marcelle-app>`;
  //   }
}

export function createApp(options: ApplicationOptions): Application {
  return new Application(options.title, options.author, options.datasets);
}
