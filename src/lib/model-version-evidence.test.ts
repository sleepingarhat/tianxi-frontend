import { expect, it } from "vitest";
import { orderVersions, recordedAlpha } from "./model-version-evidence";
it("uses the alpha recorded for that version, not the current setting", () => {
  expect(recordedAlpha("ensemble α=0.88")).toBe(0.88);
  expect(recordedAlpha("α=0.85")).toBe(0.85);
  expect(recordedAlpha("LightGBM")).toBeNull();
});
it("puts the current version above newer historical records", () => {
  expect(orderVersions([{ status: "archived", released_at: "2026-10-14" }, { status: "active", released_at: "2026-09" }]).map(v => v.status)).toEqual(["active", "archived"]);
});