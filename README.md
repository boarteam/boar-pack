### How to generate code

#### Generate a new module

```shell
yarn gen:module <package-name> <module-name>
```

Use singular form for the module name. It will be converted to plural form in the generated code where necessary.

Example:

```shell
yarn gen:module common quote
```

It will add a new module `quotes` to `packages/common-backend/src/modules` folder.

#### Generate a page with table

```shell
yarn gen:page <package-name> <module-name>
```

It will generate:

- a new page in `packages/<package-name>-frontend/src/pages` folder
- components for the page in `packages/<package-name>-frontend/src/components` folder

## Documentation

See [docs/auth-refresh-token.md](docs/auth-refresh-token.md) for details on the refresh token implementation (commit 75bdcc7).

