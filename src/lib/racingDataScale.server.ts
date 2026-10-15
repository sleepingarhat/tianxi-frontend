// 數據規模索引：逐個賽果檔記低場數同賽果行數，每次只補新檔（最多 BATCH 個），避免超出 Worker 子請求上限。
const REPO = "sleepingarhat/tianxi-racing";
const BATCH = 40;
const PATH_RE = /^data\/\d{4}\/results_(\d{4}-\d{2}-\d{2})\.csv$/;

export function countResultsCsv(text: string): { races: number; rows: number } {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  const header = lines.shift() ?? "";
  const idx = header.split(",").indexOf("race_no");
  const races = new Set<string>();
  let rows = 0;
  for (const l of lines) {
    if (!l.trim()) continue;
    const m = l.match(/^[^,]*,[^,]*,([^,]*)/); // race_no 係第 3 欄，前面兩欄冇引號
    if (!m || idx !== 2) continue;
    rows++;
    races.add(m[1]!);
  }
  return { races: races.size, rows };
}

export async function syncRacingDataScale() {
  const token = process.env["GITHUB_TOKEN"];
  const h: Record<string, string> = { "User-Agent": "tianxi-web", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const tr = await fetch(`https://api.github.com/repos/${REPO}/git/trees/main?recursive=1`, { headers: h });
  if (!tr.ok) return { ok: false, message: `GitHub ${tr.status}`, added: 0 };
  const tree = ((await tr.json()) as { tree: { path: string }[] }).tree;
  const paths = tree.map((t) => t.path).filter((p) => PATH_RE.test(p));
  const { data: have } = await supabaseAdmin.from("racing_results_index").select("path").limit(100000);
  const known = new Set((have ?? []).map((r) => r.path));
  const todo = paths.filter((p) => !known.has(p)).sort().reverse().slice(0, BATCH);
  const rows = await Promise.all(todo.map(async (p) => {
    const r = await fetch(`https://raw.githubusercontent.com/${REPO}/main/${p}`, { headers: h });
    if (!r.ok) return null;
    const c = countResultsCsv(await r.text());
    return { path: p, meeting_date: p.match(PATH_RE)![1]!, races: c.races, result_rows: c.rows };
  }));
  const ok = rows.filter((r): r is NonNullable<typeof r> => !!r && r.races > 0);
  if (ok.length) {
    const { error } = await supabaseAdmin.from("racing_results_index").upsert(ok, { onConflict: "path" });
    if (error) return { ok: false, message: error.message, added: 0 };
  }
  return { ok: true, added: ok.length, remaining: Math.max(0, paths.length - known.size - ok.length) };
}
