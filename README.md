# @semore/ucp-adapter

[![CI](https://github.com/semore-hq/ucp-adapter/actions/workflows/ci.yml/badge.svg)](https://github.com/semore-hq/ucp-adapter/actions/workflows/ci.yml)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](./LICENSE)
[![npm](https://img.shields.io/npm/v/@semore/ucp-adapter.svg)](https://www.npmjs.com/package/@semore/ucp-adapter)
[![status](https://img.shields.io/badge/status-skeleton--v0-lightgrey.svg)](./CHANGELOG.md)

Adapter helpers for the **Universal Commerce Protocol (UCP)** — the
Google + Shopify–led capability advertisement standard for agentic commerce
discovery. Use this package to expose a `/ucp/capability` document from your
merchant or aggregator backend, and to consume capability documents from
upstream agents.

> **Source of Truth:** this directory in the Semore monorepo until repo split.
> The production capability surface lives in the internal Semore API at
> `apps/api/src/routes/ucp.ts`. This package exposes the stable, framework-
> agnostic contract for third-party merchants and agent orchestrators.
>
> **Standards-body posture [LEGAL-PENDING]:** References to UCP are nominative
> fair use. Semore claims no endorsement by, affiliation with, or co-authorship
> of the UCP working group. Any co-branded integration is **(proposed, subject
> to joint agreement)** with the respective body. [EXTERNAL-ADVISORY]

## Install

```bash
npm install @semore/ucp-adapter
# or
pnpm add @semore/ucp-adapter
```

## Usage

```ts
import { UcpAdapter, type UcpCapability } from "@semore/ucp-adapter";

const adapter = new UcpAdapter({
  providerId: "did:web:merchant.example",
  providerName: "Example Merchant",
  website: "https://merchant.example",
});

adapter.advertiseCapability({
  id: "commerce.search",
  endpoint: "https://merchant.example/mcp",
  transport: "mcp",
  description: "Catalog search",
});

const capability = adapter.buildCapabilityDocument();
// Serve at /ucp/capability — agents will fetch this to discover your surface.
```

## What this package provides

- `UcpAdapter` class — collect capability advertisements and build a UCP
  capability document.
- `advertiseCapability(cap)` — register a `commerce.*` or `agentic.*`
  capability entry.
- `buildCapabilityDocument()` — assemble the JSON payload to serve at
  `/ucp/capability`.
- `handleQuery(req)` — skeleton dispatcher for incoming UCP queries (Phase 2;
  currently throws `not_implemented`).
- Public types: `UcpCapability`, `UcpQuery`, `UcpResponse`,
  `UcpCapabilityDocument`.

## What this package does **not** provide

- The Semore production capability surface. `did:web:semore.net` advertisements
  live behind `api.semore.net/ucp/capability`.
- Authentication or rate limiting. Wrap the document in your own middleware.
- Actual query routing — Phase 2 will introduce `handleQuery` execution paths
  (search, cart, checkout) once the UCP query schema stabilises upstream.

## Reference

- UCP working group: <https://ucp.dev>
- Semore DID: `did:web:semore.net`
- Contact: `semore.hq@gmail.com` · GitHub [@semore_hq](https://github.com/semore-hq)

## License

Apache-2.0 — see [LICENSE](./LICENSE). Patent grant per Apache-2.0 §3.

Copyright (c) Semore Founding Team.
