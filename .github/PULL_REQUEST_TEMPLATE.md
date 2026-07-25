<!--
Thanks for contributing! Please read CONTRIBUTING.md first — in particular
the Conventional Commits section: release versioning is computed from commit
messages, so malformed commit types silently skip version bumps.
-->

## What does this PR do?

<!-- A short description of the change and the motivation behind it. -->

## Affected package(s)

<!-- e.g. users-backend, common-frontend, repo tooling -->

## Related issue

<!-- "Fixes #123" / "Closes #123", or "n/a" for trivial changes. -->

## Checklist

- [ ] Commit messages follow
      [Conventional Commits](https://www.conventionalcommits.org/)
      (`feat(scope): …`, `fix(scope): …` — this drives automated versioning
      and changelogs)
- [ ] Breaking changes are marked with a `BREAKING CHANGE:` footer in the
      commit body
- [ ] `yarn build` passes from the repo root
- [ ] `yarn lint`, `yarn typecheck` and `yarn format:check` pass
- [ ] `yarn test` passes from the repo root (Docker must be running — the
      backend suites start disposable Postgres containers)
- [ ] New or changed behavior is covered by tests
- [ ] Documentation (README / docs/) is updated where behavior changed
