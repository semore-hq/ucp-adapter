// @semore/ucp-adapter — public entrypoint.
// Skeleton scaffolds for UCP capability advertisement + query dispatch.
// Phase 2 will introduce real query execution paths once the UCP query
// schema stabilises upstream.

export type {
  UcpAdapterOptions,
  UcpCapability,
  UcpCapabilityDocument,
  UcpPaymentMethod,
  UcpProvider,
  UcpQuery,
  UcpResponse,
  UcpResponseReason,
  UcpTransport,
} from "./types.js";

import type {
  UcpAdapterOptions,
  UcpCapability,
  UcpCapabilityDocument,
  UcpQuery,
  UcpResponse,
} from "./types.js";

const DEFAULT_CONTEXT = "https://ucp-protocol.org/context/v1";
const DEFAULT_VERSION = "0.1.0";

/**
 * UCP adapter — collect capability advertisements and emit the JSON document
 * an agent fetches at `/ucp/capability`. Framework-agnostic; bring your own
 * HTTP layer (Hono, Express, Workers, ...) to mount the document.
 */
export class UcpAdapter {
  readonly #options: UcpAdapterOptions;
  readonly #capabilities: UcpCapability[] = [];

  constructor(options: UcpAdapterOptions) {
    if (!options.providerId) {
      throw new Error("UcpAdapter: providerId is required");
    }
    if (!options.providerName) {
      throw new Error("UcpAdapter: providerName is required");
    }
    this.#options = options;
  }

  /**
   * Register a capability advertisement. Capability ids should follow the
   * `commerce.*` / `agentic.*` dotted-namespace convention. Re-advertising
   * an existing id replaces the previous entry.
   */
  advertiseCapability(cap: UcpCapability): void {
    if (!cap.id) throw new Error("UcpAdapter.advertiseCapability: id is required");
    if (!cap.endpoint) throw new Error("UcpAdapter.advertiseCapability: endpoint is required");
    if (!cap.transport) throw new Error("UcpAdapter.advertiseCapability: transport is required");

    const existing = this.#capabilities.findIndex((c) => c.id === cap.id);
    if (existing >= 0) {
      this.#capabilities[existing] = cap;
    } else {
      this.#capabilities.push(cap);
    }
  }

  /**
   * Snapshot of the currently-advertised capabilities. The returned array is
   * a defensive copy.
   */
  listCapabilities(): readonly UcpCapability[] {
    return [...this.#capabilities];
  }

  /**
   * Build the canonical UCP capability document. Serve the result as JSON at
   * `/ucp/capability` — agents will fetch this to discover your surface.
   */
  buildCapabilityDocument(): UcpCapabilityDocument {
    const o = this.#options;
    const provider = {
      id: o.providerId,
      name: o.providerName,
      ...(o.website !== undefined ? { website: o.website } : {}),
      ...(o.storefront !== undefined ? { storefront: o.storefront } : {}),
    };
    const doc: UcpCapabilityDocument = {
      "@context": o.contextUrl ?? DEFAULT_CONTEXT,
      protocol: "ucp",
      version: o.version ?? DEFAULT_VERSION,
      provider,
      capabilities: [...this.#capabilities],
      ...(o.paymentMethods !== undefined ? { paymentMethods: o.paymentMethods } : {}),
      ...(o.categories !== undefined ? { categories: o.categories } : {}),
      ...(o.shipToCountries !== undefined ? { shipToCountries: o.shipToCountries } : {}),
    };
    return doc;
  }

  /**
   * Handle an incoming UCP query. Phase-1 skeleton: returns `not_implemented`
   * for every call. Override in a subclass or wait for Phase 2 once the UCP
   * query schema is stable.
   */
  async handleQuery(query: UcpQuery): Promise<UcpResponse> {
    if (!query || typeof query.capability !== "string") {
      return { ok: false, reason: "invalid_params" };
    }
    const known = this.#capabilities.some((c) => c.id === query.capability);
    if (!known) {
      return { ok: false, reason: "unknown_capability" };
    }
    return {
      ok: false,
      reason: "not_implemented",
      detail: "UCP query dispatch lands in @semore/ucp-adapter Phase 2.",
    };
  }
}
