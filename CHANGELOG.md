# Changelog

## [0.1.1] — 2026-05-08

### Fixed

- Blocker A — `package.json` `main`/`exports` simplified to `./dist/index.js` (ESM-only, type:module). Pre-fix `./dist/index.cjs`/`.mjs` paths did not exist as build artifacts (ADR-0131).

All notable changes to `@semore/ucp-adapter` are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/), versioning follows [SemVer](https://semver.org/).

## [0.1.0] — 2026-05-08

### Added

- Initial public release.
- Source: [github.com/semore-hq/ucp-adapter](https://github.com/semore-hq/ucp-adapter)
- Stack: Semore agentic commerce (ADR-0073 5-protocol multi-adapter, ADR-0131 Phase 0 격상).

See [README.md](./README.md) for usage.
