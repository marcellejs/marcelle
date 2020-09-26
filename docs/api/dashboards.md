---
sidebarDepth: 2
---

# Dashboards

Dashboards provide a way to create applications with multiple pages displaying collections of modules. This is particularly useful in the development stage to allow developers to customize the user interface to their needs. Dashboards provide an interface similar to [Tensorboard](https://www.tensorflow.org/tensorboard), Tensorflow's visualization toolkit. Programming a dashboard only requires specifying pages with the list of module instances to display on each page.

In Marcelle, dashboards are applications that can be displayed on demand on top of any existing web application.

## Dashboard

The following factory function creates and returns an empty Dashboard Application:

```tsx
marcelle.createDashboard({
  title: string;
  author: string;
  datasets: Dataset[];
}): Dashboard
```

#### Parameters

| Parameter | Type             | Description                             | Required |
| --------- | ---------------- | --------------------------------------- | :------: |
| title     | String           | The application's title.                |          |
| author    | String           | The application's authors/credits.      |          |
| datasets  | Array\<Dataset\> | The datasets present in the application |          |

#### Example

```js
const dashboard = marcelle.createDashboard({
  title: 'Marcelle Example - Dashboard',
  author: 'Marcelle Pirates Crew',
  datasets: [trainingSet],
});

dashboard
  .page('Data Management')
  .useLeft(input, featureExtractor)
  .use([label, capture], trainingSetBrowser);
dashboard
  .page('Training')
  .use(
    b,
    'KNN (k-Nearest Neighbors)',
    paramsKNN,
    progressKNN,
    'MLP (Multilayer Perceptron)',
    paramsMLP,
    progressMLP,
    plotTrainingMLP,
  );
```

### .page()

```tsx
Dashboard.page(name: string): DashboardPage
```

Create a new page on the dashboard entitled `name`, and returns the corresponding [`DashboardPage`](#dashboardpage) instance.

### .start()

```tsx
Dashboard.start(): void
```

Starts the dashboard application. The application, a Svelte component instance, is mounted on the document's body, creating an overlay on the current web page without destroying any content.

### .destroy()

```tsx
Dashboard.destroy(): void
```

Destroys the dashboard application. This destroys the current view, if it exists, but preserves the configuration, meaning that the dashboard can still be re-started.

## DashboardPage

Dashboard pages are simply modules containers. They are created using the [`page`](#page) method of a Dashboard.

### .use()

```tsx
use(...modules: Array<Module | Module[] | string>): DashboardPage
```

The `use` method takes an arbitrary number of arguments specifying the modules to display on the page. By default, modules are stacked vertically in the right column of the page. Each argument can either be:

- A module ([`Module`](/api/modules)), displayed full-width on the right column
- An array of module, which are then distributed horizontally
- A string, which defines a section title

### .useLeft()

```tsx
useLeft(...modules: Module[]): DashboardPage {
  this.modulesLeft = this.modulesLeft.concat(modules);
  return this;
}
```

The `useLeft` method is similar to use except that modules are placed on the left column of the dashboard page. The method only accept modules as argument.
