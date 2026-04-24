export * as tokens from "./design-tokens";
export * as copy from "./copy";
export * as pricing from "./pricing";
export * as api from "./api";

// ⚠️ internal.ts 故意唔 re-export 喺度。
// 內部 admin routes 要直接 `import { internalGate } from "@tianxi/shared/internal"`
// 迫 bundler tree-shake 唔會帶落 user bundle。
