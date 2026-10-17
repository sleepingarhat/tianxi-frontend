import { expect, it } from "vitest";
import { assertDatabaseWrite, completeRaceIds, customerBelongsToUser, sameMeeting, sameFourPicks } from "./audit-safety";
it("資料寫入失敗不能當作付款通知已成功處理", () => {
  expect(() => assertDatabaseWrite({ error: { message: "write failed" } })).toThrow("write failed");
  expect(() => assertDatabaseWrite({ error: null })).not.toThrow();
});
it("相同電郵不能授權覆蓋另一會員的付款帳戶", () => {
  expect(customerBelongsToUser({ userId: "other-user" }, "current-user")).toBe(false);
  expect(customerBelongsToUser({}, "current-user")).toBe(false);
  expect(customerBelongsToUser({ userId: "current-user" }, "current-user")).toBe(true);
});
it("歷史賽事不借用10月19日其他賽日的同場次預測", () => {
  expect(sameMeeting("2026-10-14", "HV", { date: "2026-10-19", venue: "ST" })).toBe(false);
  expect(sameMeeting("2026-10-14", "HV", { date: "2026-10-14", venue: "ST" })).toBe(false);
  expect(sameMeeting("2026-10-14", "HV", { date: "2026-10-14", venue: "HV" })).toBe(true);
});
it("網站地圖不能將10場的空白或部分列表當成完整", () => {
  expect(() => completeRaceIds(10, [])).toThrow();
  expect(() => completeRaceIds(10, ["race_1"])).toThrow();
  expect(() => completeRaceIds(2, ["race_1", "race_1"])).toThrow();
  expect(completeRaceIds(2, ["race_1", "race_2"])).toEqual(["race_1", "race_2"]);
});
it("版本對照只纳入完整且一致的四揀", () => {
  expect(sameFourPicks([1,2,3,4], [4,3,2,1])).toBe(true);
  expect(sameFourPicks([1,2,3], [1,2,3,4])).toBe(false);
  expect(sameFourPicks([1,2,3,5], [1,2,3,4])).toBe(false);
  expect(sameFourPicks([1,2,3,3], [1,2,3,4])).toBe(false);
});
