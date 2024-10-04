---
sidebarDepth: 3
---

# Dashboards

Dashboards provide a way to create applications with multiple pages displaying collections of components. This is particularly useful in the development stage to allow developers to customize the user interface to their needs. Dashboards provide an interface similar to [Tensorboard](https://www.tensorflow.org/tensorboard), Tensorflow's visualization toolkit. Programming a dashboard only requires specifying pages with the list of component instances to display on each page.

In Marcelle, dashboards are applications that can be displayed on demand on top of any existing web application.

## Dashboard

The following factory function creates and returns an empty Dashboard Application:

```tsx
function dashboard({
  title: string;
  author: string;
  closable?: boolean;
}): Dashboard
```

### Parameters

| Parameter | Type    | Description                                                                                                                                 | Required | Default |
| --------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------- | :------: | :-----: |
| title     | String  | The application's title.                                                                                                                    |          |         |
| author    | String  | The application's authors/credits.                                                                                                          |          |         |
| closable  | boolean | Whether the dashboard can be closed. This flag adds a close button to the menu bar, and is useful when the dashboard is displayed on demand |          |  false  |

### properties

| Name     | Type              | Description                                                        | Hold |
| -------- | ----------------- | ------------------------------------------------------------------ | :--: |
| \$active | Stream\<boolean\> | Stream specifying whether the dashboard is active (visible) or not |  ✓   |
| \$page   | Stream\<string\>  | Stream indicating the current page slug                            |  ✓   |

### Example

```js
const dash = dashboard({
  title: 'Marcelle Example - Dashboard',
  author: 'Marcelle Pirates Crew',
});

dash
  .page('Data Management')
  .sidebar(input, featureExtractor)
  .use([label, capture], trainingSetBrowser);
dash.page('Training').use(params, b, prog, plotTraining);
dash.page('Batch Prediction').use(predictButton, confusionMatrix);
dash.settings.dataStores(store).datasets(trainingSet).models(classifier).predictions(batchMLP);
```

### .hide()

```tsx
Dashboard.hide(): void
```

Hide the dashboard application. This destroys the current view, if it exists, but preserves the configuration, meaning that the dashboard can still be re-started.

### .page()

```tsx
Dashboard.page(name: string, showSidebar?: boolean): DashboardPage
```

Create a new page on the dashboard entitled `name`, and returns the corresponding [`DashboardPage`](#dashboardpage) instance.

### .settings

```tsx
Dashboard.settings: DashboardSettings
```

The dashboard's settings. See [`DashboardSettings`](#dashboardsettings).

### .show()

```tsx
Dashboard.show(): void
```

Show the dashboard application. The application, a Svelte component instance, is mounted on the document's body, creating an overlay on the current web page without destroying any content.

## DashboardPage

Dashboard pages are simply components containers. They are created using the [`page`](#page) method of a Dashboard.

### .use()

```tsx
use(...components: Array<Component | Component[] | string>): DashboardPage
```

The `use` method takes an arbitrary number of arguments specifying the components to display on the page. By default, components are stacked vertically in the right column of the page. Each argument can either be:

- A component ([`Component`](/api/components/)), displayed full-width on the right column
- An array of component, which are then distributed horizontally
- A string, which defines a section title

### .sidebar()

```tsx
sidebar(...components: Component[]): DashboardPage {
  this.componentsLeft = this.componentsLeft.concat(components);
  return this;
}
```

The `sidebar` method is similar to use except that components are placed on the left column of the dashboard page. The method only accept components as argument.

## DashboardSettings

Specifies the contents of the dashboards settings panel.

### .datasets()

```tsx
datasets(...datasets: Dataset[]): DashboardSettings
```

Specify the datasets that can be managed in the settings panel.

### .dataStores()

```tsx
dataStores(...stores: DataStore[]): DashboardSettings
```

Specify the data stores that can be managed in the settings panel.

### .models()

```tsx
models(...models: Model<any, any>[]): DashboardSettings
```

Specify the models that can be managed in the settings panel.

### .predictions()

```tsx
predictions(...predictions: BatchPrediction[]): DashboardSettings
```

Specify the batch prediction components that can be managed in the settings panel.

### .use()

```tsx
use(...components: Array<Component | Component[] | string>): DashboardSettings
```

The `use` method takes an arbitrary number of arguments specifying the components to display on the page. By default, components are stacked vertically in the right column of the page. Each argument can either be:

- A component ([`Component`](/api/components/)), displayed full-width on the right column
- An array of component, which are then distributed horizontally
- A string, which defines a section title
