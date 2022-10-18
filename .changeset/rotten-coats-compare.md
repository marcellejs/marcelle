---
'@marcellejs/core': minor
---

Data stores are no longer passed to the constructor of machine learning models for model synchronization. Instead, a data store must be passed explicitly to `.sync()`, `.save()` and `.load()`.
