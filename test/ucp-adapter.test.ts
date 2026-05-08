import { describe, it, expect } from "vitest";
import { UcpAdapter, type UcpCapability } from "../src/index.js";

function makeAdapter(): UcpAdapter {
  return new UcpAdapter({
    providerId: "did:web:merchant.example",
    providerName: "Example Merchant",
    website: "https://merchant.example",
    storefront: "https://shop.merchant.example",
    paymentMethods: [{ brand: "visa", networks: ["agentic-intelligent-commerce"] }],
    categories: ["kbeauty"],
    shipToCountries: ["US", "JP"],
  });
}

describe("UcpAdapter constructor", () => {
  it("requires providerId", () => {
    expect(() =>
      // @ts-expect-error — runtime guard under test
      new UcpAdapter({ providerName: "X" }),
    ).toThrow(/providerId/);
  });

  it("requires providerName", () => {
    expect(() =>
      // @ts-expect-error — runtime guard under test
      new UcpAdapter({ providerId: "did:web:x" }),
    ).toThrow(/providerName/);
  });
});

describe("advertiseCapability + buildCapabilityDocument", () => {
  it("advertises and emits the canonical document shape", () => {
    const adapter = makeAdapter();
    adapter.advertiseCapability({
      id: "commerce.search",
      endpoint: "https://merchant.example/mcp",
      transport: "mcp",
      description: "Catalog search",
    });
    adapter.advertiseCapability({
      id: "commerce.cart",
      endpoint: "https://merchant.example/api/cart",
      transport: "http-json",
    });
    const doc = adapter.buildCapabilityDocument();

    expect(doc.protocol).toBe("ucp");
    expect(doc["@context"]).toBe("https://ucp-protocol.org/context/v1");
    expect(doc.version).toBe("0.1.0");
    expect(doc.provider.id).toBe("did:web:merchant.example");
    expect(doc.provider.name).toBe("Example Merchant");
    expect(doc.capabilities).toHaveLength(2);
    expect(doc.capabilities[0]?.id).toBe("commerce.search");
    expect(doc.capabilities[1]?.transport).toBe("http-json");
    expect(doc.paymentMethods?.[0]?.brand).toBe("visa");
    expect(doc.categories).toContain("kbeauty");
    expect(doc.shipToCountries).toContain("JP");
  });

  it("re-advertising the same id replaces the previous entry", () => {
    const adapter = makeAdapter();
    adapter.advertiseCapability({
      id: "commerce.search",
      endpoint: "https://old.example",
      transport: "mcp",
    });
    adapter.advertiseCapability({
      id: "commerce.search",
      endpoint: "https://new.example",
      transport: "mcp",
      description: "updated",
    });
    const caps = adapter.listCapabilities();
    expect(caps).toHaveLength(1);
    expect(caps[0]?.endpoint).toBe("https://new.example");
    expect(caps[0]?.description).toBe("updated");
  });

  it("rejects malformed capability advertisements", () => {
    const adapter = makeAdapter();
    expect(() =>
      adapter.advertiseCapability({ id: "", endpoint: "x", transport: "mcp" } as UcpCapability),
    ).toThrow(/id/);
    expect(() =>
      adapter.advertiseCapability({ id: "commerce.x", endpoint: "", transport: "mcp" } as UcpCapability),
    ).toThrow(/endpoint/);
  });
});

describe("handleQuery (Phase 1 stub)", () => {
  it("returns not_implemented for a known capability", async () => {
    const adapter = makeAdapter();
    adapter.advertiseCapability({
      id: "commerce.search",
      endpoint: "https://merchant.example/mcp",
      transport: "mcp",
    });
    const res = await adapter.handleQuery({
      capability: "commerce.search",
      params: { q: "sunscreen" },
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toBe("not_implemented");
  });

  it("returns unknown_capability for an unregistered id", async () => {
    const adapter = makeAdapter();
    const res = await adapter.handleQuery({
      capability: "commerce.unknown",
      params: {},
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toBe("unknown_capability");
  });

  it("returns invalid_params for malformed query", async () => {
    const adapter = makeAdapter();
    // @ts-expect-error — runtime guard under test
    const res = await adapter.handleQuery({});
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toBe("invalid_params");
  });
});
