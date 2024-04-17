# @marcellejs/devtools

## 0.6.5

## 0.6.4

## 0.6.3

## 0.6.2

## 0.6.1

## 0.6.0

### Minor Changes

- 259aec6: Models have been refactored to facilitate the creation of custom TFJS models. The new architecture involves the following classes:

  ```bash
  Model<T extends Instance, PredictionType>
  ├── TFJSBaseModel<T extends Instance, PredictionType>
  │   └── TFJSCustomModel<T extends Instance, PredictionType>
  │   └── TFJSCustomClassifier
  ```

- 6825bef: A new application generator and CLI were introduced to overcome limitations of the previous CLI.
  Instead of requiring the global install of `@marcellejs/cli`, application generation has been moved to a `create-marcelle` package that can be used with `npm init` or `yarn create`.
  The CLI for generating components and managing the backend in a project is now installed as a development dependency in new projects, and does not require arguments.
  See documentation for details: [https://marcelle.dev/cli.html](https://marcelle.dev/cli.html)

## 0.6.0-next.2

## 0.6.0-next.1

## 0.6.0-next.0

### Minor Changes

- 259aec6: Models have been refactored to facilitate the creation of custom TFJS models. The new architecture involves the following classes:

  ```bash
  Model<T extends Instance, PredictionType>
  ├── TFJSBaseModel<T extends Instance, PredictionType>
  │   └── TFJSCustomModel<T extends Instance, PredictionType>
  │   └── TFJSCustomClassifier
  ```

- 6825bef: A new application generator and CLI were introduced to overcome limitations of the previous CLI.
  Instead of requiring the global install of `@marcellejs/cli`, application generation has been moved to a `create-marcelle` package that can be used with `npm init` or `yarn create`.
  The CLI for generating components and managing the backend in a project is now installed as a development dependency in new projects, and does not require arguments.
  See documentation for details: [https://marcelle.dev/cli.html](https://marcelle.dev/cli.html)
