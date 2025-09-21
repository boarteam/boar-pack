# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [6.5.0](https://github.com/boarteam/boar-pack/compare/@boarteam/boar-pack-users-backend@6.4.0...@boarteam/boar-pack-users-backend@6.5.0) (2025-09-21)


### Bug Fixes

* **users-backend:** log unknown permissions with warning instead of error ([9502ad9](https://github.com/boarteam/boar-pack/commit/9502ad94a36c4dc6e9695af43179132c73660163))


### Features

* **users-backend:** support custom EntityManager in `createAuditLog` method ([9b603a2](https://github.com/boarteam/boar-pack/commit/9b603a2bcc01a4b2f4ab80612c35bc20348934e2))





# [6.4.0](https://github.com/boarteam/boar-pack/compare/@boarteam/boar-pack-users-backend@6.3.0...@boarteam/boar-pack-users-backend@6.4.0) (2025-09-19)


### Features

* **users-backend:** centralize audit log creation in `AuditLogBaseService` ([187061b](https://github.com/boarteam/boar-pack/commit/187061b5148d5079e433709a43a258bac93b3cb1))





# [6.3.0](https://github.com/boarteam/boar-pack/compare/@boarteam/boar-pack-users-backend@6.2.0...@boarteam/boar-pack-users-backend@6.3.0) (2025-09-18)


### Features

* **users-backend:** add audit logs module for tracking entity changes ([d41a4cb](https://github.com/boarteam/boar-pack/commit/d41a4cbefb1a3d96f5607a116902ae047b7226c4))





# [6.2.0](https://github.com/boarteam/boar-pack/compare/@boarteam/boar-pack-users-backend@6.1.0...@boarteam/boar-pack-users-backend@6.2.0) (2025-08-18)


### Features

* **users-backend:** enhance role management and validation in UsersEditingGuard ([7867d22](https://github.com/boarteam/boar-pack/commit/7867d22b138c163dda9202d2bd69e3b1e0539f47))





# [6.1.0](https://github.com/boarteam/boar-pack/compare/@boarteam/boar-pack-users-backend@6.0.3...@boarteam/boar-pack-users-backend@6.1.0) (2025-07-29)


### Features

* **auth:** Add refresh token support with configurable expiration and session revocation ([#65](https://github.com/boarteam/boar-pack/issues/65)) ([75bdcc7](https://github.com/boarteam/boar-pack/commit/75bdcc76d5e824d9da70cc24a30a19a7bd98eb8b))





## [6.0.3](https://github.com/boarteam/boar-pack/compare/@boarteam/boar-pack-users-backend@6.0.2...@boarteam/boar-pack-users-backend@6.0.3) (2025-07-21)

**Note:** Version bump only for package @boarteam/boar-pack-users-backend





## [6.0.2](https://github.com/boarteam/boar-pack/compare/@boarteam/boar-pack-users-backend@6.0.1...@boarteam/boar-pack-users-backend@6.0.2) (2025-07-15)

**Note:** Version bump only for package @boarteam/boar-pack-users-backend





## [6.0.1](https://github.com/boarteam/boar-pack/compare/@boarteam/boar-pack-users-backend@6.0.0...@boarteam/boar-pack-users-backend@6.0.1) (2025-07-15)

**Note:** Version bump only for package @boarteam/boar-pack-users-backend





## [5.6.1](https://github.com/boarteam/boar-pack/compare/@boarteam/boar-pack-users-backend@5.6.0...@boarteam/boar-pack-users-backend@5.6.1) (2025-07-14)

**Note:** Version bump only for package @boarteam/boar-pack-users-backend





# [5.6.0](https://github.com/boarteam/boar-pack/compare/@boarteam/boar-pack-users-backend@5.5.0...@boarteam/boar-pack-users-backend@5.6.0) (2025-05-08)


### Features

* **Authentication:** add users management components ([c92086a](https://github.com/boarteam/boar-pack/commit/c92086ad9dd4bc89f5ec4341984e200762da2085))
* **liquidity monitor:** PLA-26 Add quotes-statistic upcoming flag ([3a11bfc](https://github.com/boarteam/boar-pack/commit/3a11bfcfdcd64d83c50b848a362ef47dfcd39cd0))





# [5.5.0](https://github.com/boarteam/boar-pack/compare/@boarteam/boar-pack-users-backend@5.4.2...@boarteam/boar-pack-users-backend@5.5.0) (2025-05-02)


### Bug Fixes

* **quotes and event logs:** PLA-25 conditionally import ScheduleModule based on SWAGGER environment variable ([810e668](https://github.com/boarteam/boar-pack/commit/810e668ebd1aec90c618792c0c5269edc912b286))


### Features

* **backend settings and telegraf modules:** PLA-25 integrate Settings and Telegraf modules ([7a1681a](https://github.com/boarteam/boar-pack/commit/7a1681a0416a6b78849921ce2908a76b258a5d36))
* **provider monitoring:** PLA-25 add controller and refactor monitoring toggle logic ([cd3bc53](https://github.com/boarteam/boar-pack/commit/cd3bc5388f22d5ac51e60801d8a62a55cd3251b3))
* **settings:** PLA-25 split telegram and events configuration ([7a217ea](https://github.com/boarteam/boar-pack/commit/7a217ea74dbd86e0cee574e7d27fa912c3dad55c))
* **telegraf service:** PLA-25 update sendMessage to support formatted strings and add validation for bot token and chat ID ([bc03726](https://github.com/boarteam/boar-pack/commit/bc03726d704237b8b1f83597bd730992faa94d9d))
* **telegram settings:** PLA-25 notifyAboutQuotesByProvider option for telegram settings ([e07a751](https://github.com/boarteam/boar-pack/commit/e07a751b869d23b2ed369740e6c625298b7a8e31))





## [5.4.2](https://github.com/boarteam/boar-pack/compare/@boarteam/boar-pack-users-backend@5.4.1...@boarteam/boar-pack-users-backend@5.4.2) (2025-04-15)

**Note:** Version bump only for package @boarteam/boar-pack-users-backend





## [5.4.1](https://github.com/boarteam/boar-pack/compare/@boarteam/boar-pack-users-backend@5.4.0...@boarteam/boar-pack-users-backend@5.4.1) (2025-03-28)


### Bug Fixes

* **EventLogs:** update index name for service in event log entity ([0eab782](https://github.com/boarteam/boar-pack/commit/0eab782e0dbddca7bbc6f72a57ecf471a2b8f962))
* **users:** update admin email address to new domain ([3d7ad1b](https://github.com/boarteam/boar-pack/commit/3d7ad1ba3bab88cc1b30f3c39efe59c1123d0bb7))





# [5.4.0](https://github.com/boarteam/boar-pack/compare/@boarteam/boar-pack-users-backend@5.3.1...@boarteam/boar-pack-users-backend@5.4.0) (2025-03-12)


### Features

* **EventLogs:** PLA-21 Service names are fetched from DB for event logs table filters ([9f02a3c](https://github.com/boarteam/boar-pack/commit/9f02a3cd934cc1d69e2b25ad45743fc29ba8a731))





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
