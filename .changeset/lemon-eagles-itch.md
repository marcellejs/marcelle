---
'docs': minor
'@marcellejs/core': minor
'generator-marcelle': minor
---

To avoid errors with svelte>3.39, A new script for compiling svelte components used in apps (e.g. ViewContainer) was added to the core library.

As a result, `ViewContainer` now needs to be imported from `@marcellejs/core/svelte` instead of `@marcellejs/core`:

```js
import { ViewContainer } from '@marcellejs/core/svelte';
```
