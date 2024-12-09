# Contribution Guide

Thank you for your interest in contributing to our project! This guide outlines the steps and conventions for
contributing code, reporting issues, and improving documentation.

---

## **Table of Contents**

1. [Getting Started](#getting-started)
2. [Branching and Workflow](#branching-and-workflow)
3. [Commit Message Guidelines](#commit-message-guidelines)
4. [Developing Locally](#developing-locally)
5. [Building and Testing](#building-and-testing)
6. [Scripts Overview](#scripts-overview)
7. [Releasing](#releasing)
8. [Code of Conduct](#code-of-conduct)

---

## **Getting Started**

1. **Clone the repository**:
   ```bash
   git clone git@github.com:boarteam/boar-pack.git
   cd boar-pack
   ```

2. **Install dependencies**:
   This project uses `yarn` for package management. Run:
   ```bash
   yarn install
   ```

3. **Understand the monorepo structure**:
   The project uses a monorepo managed by [Lerna](https://lerna.js.org/) and Yarn Workspaces. All packages are located
   in the `packages` directory.

---

## **Branching and Workflow**

1. **Default branch**: `master`
2. **Feature branches**: Use the format `feature/<short-description>` for new features.
3. **Bugfix branches**: Use the format `bugfix/<short-description>` for bug fixes.
4. **Merge requests**: Create pull requests against `master` and ensure CI checks pass.

---

## **Commit Message Guidelines**

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) standard to automate versioning
and changelog generation.

### **Commit Types**

- **`feat:`** Introduces a new feature.
- **`fix:`** Fixes a bug.
- **`docs:`** Documentation updates.
- **`style:`** Code style changes (e.g., formatting, missing semi-colons).
- **`refactor:`** Code changes that neither fix a bug nor add a feature.
- **`test:`** Adding or updating tests.
- **`chore:`** Miscellaneous changes (e.g., tooling updates).

### **Breaking Changes**

Include `BREAKING CHANGE` in the commit body to indicate breaking changes.

Example:

```plaintext
feat(common-backend): add a new API endpoint

BREAKING CHANGE: The response structure of the `/example` endpoint has changed.
```

---

## **Developing Locally**

### **Starting Watchers**

Run the watchers to auto-sync changes across packages:

```bash
yarn watch
```

You can also run individual watchers:

```bash
yarn watch:common-frontend
```

### **Generating Modules or Pages**

Use the provided scripts to scaffold new modules or pages:

- **New Module**:
  ```bash
  yarn gen:module
  ```
- **New Page**:
  ```bash
  yarn gen:page
  ```

---

## **Releasing**

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

## **Code of Conduct**

We value an open and welcoming community. All contributors are expected to adhere to
our [Code of Conduct](CODE_OF_CONDUCT.md).

---

Thank you for contributing! 🚀 If you have any questions, feel free to open an issue or reach out to the maintainers.
