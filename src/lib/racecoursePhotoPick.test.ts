import { describe, expect, it } from "vitest";
import { isCommercialFreeLicense, isPosterSize, pickWeekly } from "./racecoursePhotoPick";

describe("馬場相授權", () => {
  it("收 CC BY 4.0、CC BY-SA 3.0、CC0", () => {
    expect(isCommercialFreeLicense("CC BY 4.0")).toBe(true);
    expect(isCommercialFreeLicense("CC BY-SA 3.0")).toBe(true);
    expect(isCommercialFreeLicense("CC0")).toBe(true);
  });
  it("拒絕非商用同禁改授權", () => {
    expect(isCommercialFreeLicense("CC BY-NC 4.0")).toBe(false);
    expect(isCommercialFreeLicense("CC BY-NC-SA 2.0")).toBe(false);
    expect(isCommercialFreeLicense("CC BY-ND 4.0")).toBe(false);
    expect(isCommercialFreeLicense("All rights reserved")).toBe(false);
  });
  it("只收闊度 1600 以上嘅橫向相", () => {
    expect(isPosterSize(1600, 1200)).toBe(true);
    expect(isPosterSize(1280, 960)).toBe(false);
    expect(isPosterSize(2000, 3000)).toBe(false);
  });
  it("每星期輪下一張", () => {
    const rows = [{ file_title: "a" }, { file_title: "b" }, { file_title: "c" }];
    expect(pickWeekly(rows, 0)?.file_title).toBe("a");
    expect(pickWeekly(rows, 1)?.file_title).toBe("b");
    expect(pickWeekly(rows, 3)?.file_title).toBe("a");
  });
});
