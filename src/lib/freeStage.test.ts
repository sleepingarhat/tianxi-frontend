import { describe, expect, it } from "vitest";
import { FREE_STAGE_GOAL_MEMBERS, PRO_WEEKLY_PRICE_HKD, FOUNDING_PRO_WEEKS, FOUNDING_PRO_VALUE_HKD, FREE_STAGE_PRO_FEATURE_ACCESS } from "./freeStage";
describe("Pro 免費階段規則", () => {
  it("首500名會員優惠名額", () => expect(FREE_STAGE_GOAL_MEMBERS).toBe(500));
  it("Pro每星期HK$78", () => expect(PRO_WEEKLY_PRICE_HKD).toBe(78));
  it("一年免費會籍為52週", () => expect(FOUNDING_PRO_WEEKS).toBe(52));
  it("免費會籍總值HK$4056", () => expect(FOUNDING_PRO_VALUE_HKD).toBe(4056));
  it("免費階段享有Pro功能", () => expect(FREE_STAGE_PRO_FEATURE_ACCESS).toBe(true));
});