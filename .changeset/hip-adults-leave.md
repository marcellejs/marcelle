---
'@marcellejs/core': minor
'@marcellejs/devtools': minor
---

Models have been refactored to facilitate the creation of custom TFJS models. The new architecture involves the following classes:

```bash
Model<T extends Instance, PredictionType>
├── TFJSBaseModel<T extends Instance, PredictionType>
│   └── TFJSCustomModel<T extends Instance, PredictionType>
│   └── TFJSCustomClassifier
```
