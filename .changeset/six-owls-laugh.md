---
'create-marcelle': minor
'@marcellejs/devtools': minor
---

A new application generator and CLI were introduced to overcome limitations of the previous CLI.
Instead of requiring the global install of `@marcellejs/cli`, application generation has been moved to a `create-marcelle` package that can be used with `npm init` or `yarn create`.
The CLI for generating components and managing the backend in a project is now installed as a development dependency in new projects, and does not require arguments.
See documentation for details: [https://marcelle.dev/cli.html](https://marcelle.dev/cli.html)
