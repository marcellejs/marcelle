---
sidebarDepth: 2
---

# API Reference

This section describes Marcelle's main API.

## createDashboard()

```ts
marcelle.createDashboard({
  title: string;
  author: string;
  datasets: Dataset[];
}): DashboardApp
```

Create and return an empty marcelle dashboard Application.

| Parameter | Type             | Description                             | Required |
| --------- | ---------------- | --------------------------------------- | :------: |
| title     | String           | The application's title.                |          |
| author    | String           | The application's authors/credits.      |          |
| datasets  | Array\<Dataset\> | The datasets present in the application |          |

**Example**

```js
const dashboard = marcelle.createDashboard({
  title: 'Marcelle Example - Dashboard',
  author: 'Marcelle Pirates Crew',
  datasets: [trainingSet],
});
```

## DashboardApp

### .page

```ts
DashboardApp.page(name: string): DashboardPage
```

TODO

### .start()

```ts
DashboardApp.start(): void
```

TODO

### .destroy()

```ts
DashboardApp.destroy(): void
```

TODO
