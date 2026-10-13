import { describe, expect, it } from "vitest";
import { isArchivedProductPath, isRacingEngine } from "./product-scope";

describe("2026-10-13 racing-only scope", () => {
  it("archives football frontend and APIs including lock jobs", () => {
    expect(isArchivedProductPath("/football/dual-ledger")).toBe(true);
    expect(isArchivedProductPath("/api/public/football-dual-lock")).toBe(true);
    expect(isArchivedProductPath("/api/public/data-mirror")).toBe(true);
  });
  it("archives marksix frontend and APIs", () => {
    expect(isArchivedProductPath("/marksix-results")).toBe(true);
    expect(isArchivedProductPath("/marksix")).toBe(true);
    expect(isArchivedProductPath("/api/public/marksix-next")).toBe(true);
  });
  it("preserves racing pages and draw-factor tuning", () => {
    expect(isArchivedProductPath("/strategy-pnl")).toBe(false);
    expect(isArchivedProductPath("/api/public/draw-tune")).toBe(false);
    expect(isArchivedProductPath("/api/public/hkjc-weather")).toBe(false);
  });
  it("limits monitoring versions to racing", () => {
    expect(isRacingEngine("racing")).toBe(true);
    expect(isRacingEngine("football")).toBe(false);
    expect(isRacingEngine("marksix")).toBe(false);
  });
});