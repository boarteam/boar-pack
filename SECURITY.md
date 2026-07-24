# Security Policy

The `@boarteam/boar-pack-*` packages include authentication, JWT and
permissions code that other projects depend on, so security reports get
priority over all other work.

## Reporting a vulnerability

**Please do not report security vulnerabilities through public GitHub
issues.**

Preferred channel: **GitHub private vulnerability reporting** — go to the
repository's [Security tab](https://github.com/boarteam/boar-pack/security)
and click **"Report a vulnerability"**. This keeps the report private while
it is being triaged and fixed.

If you cannot use GitHub, email **balakirev.andrey@gmail.com** with the
subject line starting with `[SECURITY] boar-pack`.

In your report, please include where possible:

- the affected package(s) and version(s),
- a description of the vulnerability and its impact,
- steps or a proof-of-concept to reproduce it.

## What to expect

This project is maintained on a best-effort basis by a small team, so the
commitments below are intentionally modest — but they are commitments:

- **Acknowledgement** of your report within **7 days**.
- An assessment (accepted / declined / need more info) within **14 days**.
- For accepted reports: a fix or mitigation released as soon as practical,
  and we will coordinate the disclosure timeline with you before any
  details are published.

Please give us a reasonable window to release a fix before disclosing the
issue publicly.

## Supported versions

Only the **latest published version of each package** receives security
fixes. Older majors are not patched.

## Scope notes

- The Docker Compose file and `.env.example` in this repository contain
  dummy credentials for local development only; they are not secrets, and
  reports about them will be declined.
- Vulnerabilities in third-party dependencies should be reported upstream;
  report them here only if boar-pack's usage makes the impact worse.
