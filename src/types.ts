// UCP transport schema — subset of the Semore production shape.
// Full shape lives at apps/api/src/routes/ucp.ts in the Semore monorepo.

/**
 * UCP capability transport. One of the standardised values in the
 * UCP working-group draft. New transports may be added as the spec stabilises.
 */
export type UcpTransport =
  | "mcp"
  | "http-json"
  | "did-web"
  | "graphql"
  | "websocket";

/**
 * A single capability advertisement entry. Capability ids follow a
 * dotted-namespace convention — `commerce.*` for primitive commerce surfaces
 * (search, cart, checkout, returns) and `agentic.*` for protocol bridges
 * (ACP, AP2, MCP).
 */
export interface UcpCapability {
  readonly id: string; // e.g. `commerce.search`, `agentic.acp`
  readonly endpoint: string;
  readonly transport: UcpTransport;
  readonly description?: string;
  readonly status?: "stable" | "phase-1" | "phase-2" | "experimental";
  readonly [k: string]: unknown;
}

export interface UcpProvider {
  readonly id: string; // DID or stable URL identifier
  readonly name: string;
  readonly website?: string;
  readonly storefront?: string;
  readonly [k: string]: unknown;
}

export interface UcpPaymentMethod {
  readonly brand: string;
  readonly networks: readonly string[];
}

/**
 * The JSON document served at `/ucp/capability`. Mirrors the shape produced
 * by the Semore production endpoint at `api.semore.net/ucp/capability`.
 */
export interface UcpCapabilityDocument {
  readonly "@context": string;
  readonly protocol: "ucp";
  readonly version: string;
  readonly provider: UcpProvider;
  readonly capabilities: readonly UcpCapability[];
  readonly paymentMethods?: readonly UcpPaymentMethod[];
  readonly categories?: readonly string[];
  readonly shipToCountries?: readonly string[];
  readonly [k: string]: unknown;
}

/**
 * UCP query envelope. Phase 2 spec — kept minimal until the working group
 * publishes the canonical query schema.
 */
export interface UcpQuery {
  readonly capability: string; // e.g. `commerce.search`
  readonly params: Readonly<Record<string, unknown>>;
}

export type UcpResponseReason =
  | "not_implemented"
  | "unknown_capability"
  | "invalid_params"
  | "upstream_error";

export type UcpResponse =
  | { readonly ok: true; readonly result: unknown }
  | { readonly ok: false; readonly reason: UcpResponseReason; readonly detail?: string };

export interface UcpAdapterOptions {
  readonly providerId: string;
  readonly providerName: string;
  readonly website?: string;
  readonly storefront?: string;
  readonly contextUrl?: string; // default https://ucp-protocol.org/context/v1
  readonly version?: string; // default "0.1.0"
  readonly paymentMethods?: readonly UcpPaymentMethod[];
  readonly categories?: readonly string[];
  readonly shipToCountries?: readonly string[];
}
