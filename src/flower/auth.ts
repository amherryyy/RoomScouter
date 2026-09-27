/** Flower-managed auth integration contract. Runtime enforcement arrives in F4. */
export const flowerAuthModule = Object.freeze({
  id: "auth",
  version: "1.0.0",
  capabilities: ["identity", "session"] as const,
  requiredChecks: ["auth-contract"] as const
});

export type FlowerAuthModule = typeof flowerAuthModule;
