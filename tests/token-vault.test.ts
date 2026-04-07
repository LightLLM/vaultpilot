import { describe, expect, it } from "vitest";
import {
  connectMockProvider,
  getDelegatedAccess,
  getGrantedScopes,
  isProviderConnected,
  listConnectedProviders,
  revokeProvider,
} from "@/lib/token-vault";

describe("token vault abstraction (README: scoped delegated access)", () => {
  it("returns delegated access with scopes when connected", () => {
    const access = getDelegatedAccess("mock_bank");
    expect(access).not.toBeNull();
    expect(access?.scopes).toContain("balances.read");
    expect(access?.vaultReference).toMatch(/^vault_ref_mock_bank_/);
  });

  it("getGrantedScopes reflects connection", () => {
    expect(getGrantedScopes("mock_billing")).toContain("bills.read");
  });

  it("listConnectedProviders returns all three mock integrations when connected", () => {
    const list = listConnectedProviders();
    expect(list).toHaveLength(3);
    expect(list.every((c) => c.connected)).toBe(true);
  });

  it("revoke disconnects provider and blocks delegated access", () => {
    revokeProvider("mock_bank");
    expect(isProviderConnected("mock_bank")).toBe(false);
    expect(getDelegatedAccess("mock_bank")).toBeNull();
    connectMockProvider("mock_bank");
    expect(isProviderConnected("mock_bank")).toBe(true);
  });
});
