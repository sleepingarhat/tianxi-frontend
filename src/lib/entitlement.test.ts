import { describe, expect, it } from "vitest";
import { resolveEntitlement } from "./entitlement";

const now = new Date("2027-01-10T00:00:00Z");
const gate = "2027-01-01T00:00:00Z";

describe("會籍規則", () => {
  it("未滿 500 人：限時免費享 Pro", () => {
    const e = resolveEntitlement({ rank: 10, total: 499, gateOpenAt: null, subscription: null, now });
    expect(e).toMatchObject({ kind: "free_stage", hasPro: true, remaining: 1 });
  });
  it("首 500 名：開閘後 52 週 Pro", () => {
    const e = resolveEntitlement({ rank: 500, total: 600, gateOpenAt: gate, subscription: null, now });
    expect(e).toMatchObject({ kind: "founding", until: "2027-12-31T00:00:00.000Z" });
  });
  it("首 500 名期滿：失去 Pro，提示自行訂閱", () => {
    const e = resolveEntitlement({ rank: 1, total: 600, gateOpenAt: gate, subscription: null, now: new Date("2028-01-01T00:00:00Z") });
    expect(e.kind).toBe("founding_expired");
    expect(e.hasPro).toBe(false);
  });
  it("第 501 名：開閘後冇免費 Pro", () => {
    expect(resolveEntitlement({ rank: 501, total: 600, gateOpenAt: gate, subscription: null, now }).hasPro).toBe(false);
  });
  it("取消訂閱：用到本期完結", () => {
    const sub = { status: "canceled", current_period_end: "2027-01-12T00:00:00Z", cancel_at_period_end: true };
    expect(resolveEntitlement({ rank: 600, total: 600, gateOpenAt: gate, subscription: sub, now }).hasPro).toBe(true);
    expect(resolveEntitlement({ rank: 600, total: 600, gateOpenAt: gate, subscription: sub, now: new Date("2027-01-13T00:00:00Z") }).hasPro).toBe(false);
  });
  it("扣款失敗：即時停權", () => {
    const sub = { status: "past_due", current_period_end: "2027-01-12T00:00:00Z", cancel_at_period_end: false };
    expect(resolveEntitlement({ rank: 600, total: 600, gateOpenAt: gate, subscription: sub, now })).toMatchObject({ kind: "payment_failed", hasPro: false });
    expect(resolveEntitlement({ rank: 1, total: 600, gateOpenAt: gate, subscription: sub, now })).toMatchObject({ kind: "payment_failed", hasPro: false });
    expect(resolveEntitlement({ rank: 1, total: 499, gateOpenAt: null, subscription: sub, now })).toMatchObject({ kind: "payment_failed", hasPro: false });
  });
});
