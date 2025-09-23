# Authentication

:::warning TODO
TODO
:::

## Auth Flow

Strategies:

- Anonymous
- Email/pwd

## Email validation

- Flow
- Configuration
- Templates

## Roles and Permissions

It is possible to specify the permissions for a particular project in the configuration file. The `permissions` field of the config file accepts a record associating the role name ("editor" by default) to an array of [CASL](https://casl.js.org/v6/en/) Rules.

The following example specifies a default set of permissions:

```json
  "permissions": {
    "superadmin": [
      {"action": "manage", "subject": "all"}
    ],
    "admin": [
      { "action": "manage", "subject": "all", "conditions": { "userId": "${user._id}" } },
      { "action": "manage", "subject": "all", "conditions": { "public": "${true}" } },
      { "action": "manage", "subject": "users" }
    ],
    "editor": [
      { "action": "manage", "subject": "all", "conditions": { "userId": "${user._id}" } },
      { "action": "manage", "subject": "all", "conditions": { "public": "${true}" } },
      { "action": "read", "subject": "users" },
      { "action": "update", "subject": "users", "conditions": { "_id": "${user._id}" } },
      { "action": "delete", "subject": "users", "conditions": { "_id": "${user._id}" }, "inverted": "true" }
    ]
  }
```
