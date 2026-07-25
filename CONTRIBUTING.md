# Contributing Guide

Thank you for your interest in contributing to boar-pack! This guide outlines
the steps and conventions for contributing code, reporting issues, and
improving documentation.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Environment](#development-environment)
3. [Branching and Workflow](#branching-and-workflow)
4. [Commit Message Guidelines](#commit-message-guidelines)
5. [Developing Locally](#developing-locally)
6. [Building and Testing](#building-and-testing)
7. [Scripts Overview](#scripts-overview)
8. [Releasing](#releasing)
9. [Code of Conduct](#code-of-conduct)

---

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/boarteam/boar-pack.git
   cd boar-pack
   ```

2. **Install dependencies**:
   This project uses `yarn` (v1) for package management. Run:
   ```bash
   yarn install
   ```

3. **Understand the monorepo structure**:
   The project is a monorepo managed by [Lerna](https://lerna.js.org/) and
   Yarn Workspaces. All packages live in the `packages` directory and are
   published to npm as `@boarteam/boar-pack-*`.

---

## Development Environment

A local Postgres is only needed for the dev-time API-client type generation
(`gen-types`) and for exercising the backend modules against a real database.
Building the packages does **not** require it. (The test suite manages its
own throwaway Postgres containers via Testcontainers and only needs Docker —
see [Building and Testing](#building-and-testing).)

1. **Start Postgres** (Docker):
   ```bash
   docker compose up -d
   ```
   This runs Postgres 13 on `localhost:5951` with database `boar_pack` and
   roles `admin`/`app`, all using the password `password`. These are dummy
   credentials for the local container only — nothing outside your machine
   uses them. The init logic lives in `docker/init-db.sh`.

2. **Environment file**: `packages/users-backend/.env.example` documents the
   environment variables the users-backend modules read (scrypt/bcrypt salts,
   JWT secret and token lifetimes, cookie settings). The dev-time scripts load
   `packages/users-backend/.env` — copy the example when you need them:
   ```bash
   cp packages/users-backend/.env.example packages/users-backend/.env
   ```
   The example values are dummies; use real secrets only in your own
   applications, never committed here.

---

## Branching and Workflow

1. **Default branch**: `master`
2. **Feature branches**: Use the format `feature/<short-description>` for new features.
3. **Bugfix branches**: Use the format `bugfix/<short-description>` for bug fixes.
4. **Pull requests**: Create pull requests against `master`. Make sure
   `yarn build` passes locally before requesting review. (There is no CI
   yet; once it exists, its checks will be required on every PR.)

---

## Commit Message Guidelines

This project follows the [Conventional Commits](https://www.conventionalcommits.org/)
standard. This is not just style: **Lerna computes version bumps and
changelogs from these messages**, so a malformed type (e.g. `feature:` or
`**feat:**`) silently skips the release it should have triggered.

### Commit Types

- **`feat:`** Introduces a new feature *(minor version bump)*.
- **`fix:`** Fixes a bug *(patch version bump)*.
- **`docs:`** Documentation updates.
- **`style:`** Code style changes (e.g., formatting, missing semi-colons).
- **`refactor:`** Code changes that neither fix a bug nor add a feature.
- **`test:`** Adding or updating tests.
- **`chore:`** Miscellaneous changes (e.g., tooling updates).

Scope commits to the package they touch, e.g.
`feat(users-backend): add session revocation`.

### Breaking Changes

Include `BREAKING CHANGE:` in the commit body to indicate breaking changes —
it triggers a major version bump.

Example:

```plaintext
feat(common-backend): add a new API endpoint

BREAKING CHANGE: The response structure of the `/example` endpoint has changed.
```

---

## Developing Locally

### Starting Watchers

The packages are consumed by real applications during development via
[yalc](https://github.com/wclr/yalc). Run the watchers to auto-push changes
to consuming projects on every edit:

```bash
yarn watch
```

You can also run individual watchers:

```bash
yarn watch:common-frontend
```

### Generating Modules or Pages (maintainers only)

> **Note:** the generator scripts copy templates from a sibling checkout of the
> **private** `boarteam/boar-plate` repository (`../boar-plate` next to this
> repo). They only work for maintainers with access to that repository; outside
> contributors can create modules and pages by hand, using an existing module
> as the reference.

- **New Module**:

  ```bash
  yarn gen:module <package-name> <module-name>
  ```

  Use singular form for the module name; it is converted to plural form in the
  generated code where necessary. Example: `yarn gen:module common quote` adds
  a `quotes` module to `packages/common-backend/src/modules`.

- **New Page with a table**:

  ```bash
  yarn gen:page <package-name> <module-name>
  ```

  Generates a page in `packages/<package-name>-frontend/src/pages` and its
  components in `packages/<package-name>-frontend/src/components`.

---

## Building and Testing

- **Build everything** (from the repo root):
  ```bash
  yarn build
  ```
  This runs each package's `build` script via Lerna — plain `tsc` for the
  frontend packages and `nest build` for the backend packages. Output goes to
  each package's `dist/`.

- **Build a single package**:
  ```bash
  yarn --cwd packages/users-backend build
  ```

- **Run the tests** (from the repo root):
  ```bash
  yarn test
  ```
  This runs every package's suite via Lerna, one package at a time. The
  backend packages use **Jest** (with `@nestjs/testing`); suites that need a
  database start a **disposable `postgres:13` container** through
  [Testcontainers](https://testcontainers.com/) — **Docker must be
  running** — and every suite gets its own isolated database inside it, so
  runs never touch the compose dev DB or each other. The frontend packages
  use **Vitest** + Testing Library in jsdom and need no Docker.

- **Run one package or one file**:
  ```bash
  yarn --cwd packages/users-backend test
  ```
  ```bash
  yarn --cwd packages/users-backend jest test/auth.spec.ts
  ```
  ```bash
  yarn --cwd packages/common-frontend vitest run src/tools/numberTools.test.ts
  ```

- **Test conventions**: backend unit specs live next to the code as
  `src/**/*.spec.ts`; anything that boots a Nest app or touches Postgres
  lives in `test/*.spec.ts` and uses the helpers in `test/pg.ts`
  (`createTestDataSource(entities)` gives you a fresh database). Frontend
  tests are colocated as `src/**/*.test.ts(x)`; import `describe`/`it`/`vi`
  from `vitest` explicitly (globals are off), and see `test/setup.ts` for
  the jsdom polyfills already in place. New behavior should come with tests;
  keep them behavioral (assert responses, DB rows, rendered output — not
  implementation details).

- **Regenerating API client types**: the backend packages expose a
  `gen-types` script that boots a minimal Nest app (Postgres from
  [Development Environment](#development-environment) must be running),
  serves its OpenAPI spec, and regenerates the corresponding frontend
  package's `api-client/generated` code:
  ```bash
  yarn --cwd packages/users-backend gen-types
  ```
  Commit the regenerated client together with the backend change that caused
  it.

---

## Scripts Overview

Root `package.json` scripts:

| Script | What it does |
| --- | --- |
| `yarn build` | Builds all packages (`lerna run build`). |
| `yarn clean` | Removes `node_modules` from all packages (`lerna clean`). |
| `yarn watch` | Pushes all packages via yalc, then watches every package and re-pushes on change. |
| `yarn watch:<package>` | Watches a single package (e.g. `watch:users-backend`). |
| `yarn push` | One-off `yalc push` of every package to linked consumers. |
| `yarn ver` | `lerna version` — computes bumps from Conventional Commits, tags, updates changelogs. |
| `yarn ver:pre` | Conventional-commits **prerelease** version/publish flow. |
| `yarn pub` | Builds all packages, then `lerna publish from-package` (publishes whatever versions are unpublished). |
| `yarn gen:module` / `yarn gen:page` | Code generators — [maintainers only](#generating-modules-or-pages-maintainers-only). |

Per-package scripts:

| Script | Packages | What it does |
| --- | --- | --- |
| `build` | all | Compiles the package into `dist/`. |
| `yalc:push` | all | Publishes the package to local yalc consumers. |
| `gen-types` | users-backend, liquidity-monitor-backend | Regenerates the sibling frontend package's OpenAPI client (needs the dev Postgres). |

---

## Releasing

Releasing is done by maintainers from a clean checkout of `master`:

1. Ensure all commits follow the Conventional Commits format.
2. Use Lerna to handle version bumps and changelog generation:
   ```bash
   yarn ver
   ```

3. Publish packages:
   ```bash
   yarn pub
   ```

---

## Code of Conduct

We value an open and welcoming community. All contributors are expected to
adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

Security issues should be reported privately — see [SECURITY.md](SECURITY.md).

---

Thank you for contributing! 🚀 If you have any questions, feel free to open an
issue or reach out to the maintainers.
