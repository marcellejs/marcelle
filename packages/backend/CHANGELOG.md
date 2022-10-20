# Marcelle changelog

## 0.6.0-next.2

## 0.6.0-next.1

## 0.6.0-next.0

### Minor Changes

- 259aec6: Authentication and authorization have been improved. @marcelle/backend now uses feathers-casl for authorization. Login management has also been improved, although documentation remains scarce.

## v0.0.5

- Fix error message regarding NeDB's persistence
- Fix GridFS storage initialization
- Fix node version constraints in package.json

## v0.0.4

- Allow patch and remove with id null to change multiple items
- Add $distinct query parameter for generic services
- Add `/info` services to get registered services
- Setup service whitelist
- Add feathers debugger service to power Chrome extension

## v0.0.3

- Setup model upload on GridFS. The interface for stored models was changed: the field `url` was removed and replaced by a `files` field containing an array of `[<filename>, <id>]` tuples.
- Setup channels for real-time synchronization across clients

## v0.0.2

- Setup file upload for models (tfjs, onnx) and assets
- Setup services for models (tfjs, onnx)

## 0.1.0-alpha.2

- First-ish published version
