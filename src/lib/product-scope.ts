/** Archived products stay in source/history but cannot execute in the live platform. */
export function isArchivedProductPath(path: string): boolean {
  const p = path.toLowerCase().replace(/\/+$/, "");
  return /^\/(football|marksix)(?:\/|-|$)/.test(p)
    || /^\/api\/public\/(football|marksix)(?:\/|-|$)/.test(p)
    || p === "/api/public/data-mirror";
}

export function isRacingEngine(engine: string): boolean {
  return engine === "racing";
}

export function isArchivedProductEvent(source: string, message = ""): boolean {
  return /football|marksix|足球|六合彩|雙引擎|bsd/i.test(`${source} ${message}`);
}