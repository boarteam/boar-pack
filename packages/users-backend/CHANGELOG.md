# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.3.1](https://github.com/boarteam/boar-pack/compare/@boarteam/boar-pack-users-backend@5.3.0...@boarteam/boar-pack-users-backend@5.3.1) (2025-03-09)

**Note:** Version bump only for package @boarteam/boar-pack-users-backend





# [5.3.0](https://github.com/boarteam/boar-pack/compare/@boarteam/boar-pack-users-backend@5.2.1...@boarteam/boar-pack-users-backend@5.3.0) (2025-03-07)


### Features

* **users-backend:** PLA-17 Batch saving for logs ([#42](https://github.com/boarteam/boar-pack/issues/42)) ([8a8266f](https://github.com/boarteam/boar-pack/commit/8a8266f663395980fdcd1b87886ac184ffe71695))





## [5.2.1](https://github.com/boarteam/boar-pack/compare/@boarteam/boar-pack-users-backend@5.2.0...@boarteam/boar-pack-users-backend@5.2.1) (2025-02-20)


### Bug Fixes

* **users-backend:** Added missed users config service ([#43](https://github.com/boarteam/boar-pack/issues/43)) ([5a8b444](https://github.com/boarteam/boar-pack/commit/5a8b4442931fc64a60ba408783e5af478dcb6419))





# [5.2.0](https://github.com/boarteam/boar-pack/compare/@boarteam/boar-pack-users-backend@5.1.1...@boarteam/boar-pack-users-backend@5.2.0) (2025-02-17)


### Features

* **Table, Descriptions:** Creating records in modals with tabs ([#41](https://github.com/boarteam/boar-pack/issues/41)) ([45a676d](https://github.com/boarteam/boar-pack/commit/45a676da993df37b9486691f9479c1539aa3234d))





## [5.1.1](https://github.com/boarteam/boar-pack/compare/@boarteam/boar-pack-users-backend@5.1.0...@boarteam/boar-pack-users-backend@5.1.1) (2025-02-08)


### Bug Fixes

* **casl:** Log an error instead of throwing when unknown permission has been met ([4899e10](https://github.com/boarteam/boar-pack/commit/4899e100e3f12ef4a76c870c2d942cf3c01d0aee))





# [5.1.0](https://github.com/boarteam/boar-pack/compare/@boarteam/boar-pack-users-backend@5.0.0...@boarteam/boar-pack-users-backend@5.1.0) (2025-02-07)


### Features

* **ws-auth:** Ability to use custom auth strategy for WS Auth ([936c31a](https://github.com/boarteam/boar-pack/commit/936c31a42edd1c5e799dfd74b41e8b7d9eac59e8))





# [5.0.0](https://github.com/boarteam/boar-pack/compare/@boarteam/boar-pack-users-backend@4.3.0...@boarteam/boar-pack-users-backend@5.0.0) (2025-02-06)


### Bug Fixes

* **users-backend:** Fixed ability to generate TS client for users-backend ([bc43cc9](https://github.com/boarteam/boar-pack/commit/bc43cc92ee6824c48aad39f4f8e30470302caad5))


### Code Refactoring

* **users-backend:** Bcrypt logic moved to separate module ([c86a63a](https://github.com/boarteam/boar-pack/commit/c86a63a09b8bef0c6061a6d569837ec8e124ab71))


### Features

* **users-backend:** Support for creating opaque tokens for further auth via tokens ([f3dc9c9](https://github.com/boarteam/boar-pack/commit/f3dc9c90095b2881576e0c79806d5cbdb7a67f21))
* **users-backend:** Tokens auth guard and strategy ([de5c497](https://github.com/boarteam/boar-pack/commit/de5c4974eb42e2b932945297a9ca1ace683b38ed))


### BREAKING CHANGES

* **users-backend:** Users module does not export bcrypt service anymore





# [4.3.0](https://github.com/boarteam/boar-pack/compare/@boarteam/boar-pack-users-backend@4.2.0...@boarteam/boar-pack-users-backend@4.3.0) (2024-12-27)


### Features

* **users-backend:** Ability to generate token for authenticated user ([2ab8248](https://github.com/boarteam/boar-pack/commit/2ab824868b6814eb6b27697b0861f48547b8a1e5))
* **users-backend:** Bearer authentication is now supported for JWT auth strategy ([d466c51](https://github.com/boarteam/boar-pack/commit/d466c516b5674dd98f2effa22f7cfcb95545e2ba))
