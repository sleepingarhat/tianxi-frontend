// 每週由 Wikimedia Commons 抓沙田／跑馬地分類嘅商用自由授權相，寫入 racecourse_photos。
import { isCommercialFreeLicense, isPosterSize } from "./racecoursePhotoPick";

const CATEGORIES: { venue: "ST" | "HV"; cat: string }[] = [
  { venue: "ST", cat: "Category:Sha Tin Racecourse" },
  { venue: "HV", cat: "Category:Happy Valley Racecourse" },
];

type Page = {
  title: string;
  imageinfo?: { url: string; thumburl?: string; width: number; height: number; descriptionurl: string; mime?: string;
    extmetadata?: Record<string, { value?: string }> }[];
};

const strip = (s: string) => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

export async function syncRacecoursePhotos() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let scanned = 0, accepted = 0, added = 0;
  const rows: Record<string, unknown>[] = [];
  try {
    for (const { venue, cat } of CATEGORIES) {
      const u = new URL("https://commons.wikimedia.org/w/api.php");
      Object.entries({ action: "query", format: "json", generator: "categorymembers", gcmtitle: cat, gcmtype: "file",
        gcmlimit: "200", prop: "imageinfo", iiprop: "url|size|mime|extmetadata", iiurlwidth: "1920" }).forEach(([k, v]) => u.searchParams.set(k, v));
      const res = await fetch(u, { headers: { "User-Agent": "TianxiRacing/1.0 (https://tianxi.racing)" }, signal: AbortSignal.timeout(20_000) });
      if (!res.ok) throw new Error(`Wikimedia ${res.status}`);
      const pages = Object.values(((await res.json()) as { query?: { pages?: Record<string, Page> } }).query?.pages ?? {});
      for (const p of pages) {
        scanned++;
        const i = p.imageinfo?.[0];
        if (!i || !/^image\/(jpeg|png|webp)$/.test(i.mime ?? "")) continue;
        const m = i.extmetadata ?? {};
        const license = strip(m["LicenseShortName"]?.value ?? "");
        const author = strip(m["Artist"]?.value ?? "");
        if (!license || !author || !isCommercialFreeLicense(license) || !isPosterSize(i.width, i.height)) continue;
        accepted++;
        rows.push({ file_title: p.title, venue, image_url: i.thumburl ?? i.url, width: i.width, height: i.height,
          author: author.slice(0, 200), license, license_url: m["LicenseUrl"]?.value ?? null, source_page: i.descriptionurl,
          active: true, checked_at: new Date().toISOString() });
      }
    }
    const { data: existing } = await supabaseAdmin.from("racecourse_photos").select("file_title");
    const known = new Set((existing ?? []).map((r) => r.file_title));
    added = rows.filter((r) => !known.has(r["file_title"] as string)).length;
    if (rows.length) {
      const { error } = await supabaseAdmin.from("racecourse_photos").upsert(rows as never, { onConflict: "file_title" });
      if (error) throw new Error(error.message);
    }
    // 已唔再合資格（例如改咗授權）嘅相即時下架
    const keep = new Set(rows.map((r) => r["file_title"] as string));
    const drop = [...known].filter((t) => !keep.has(t));
    if (drop.length) await supabaseAdmin.from("racecourse_photos").update({ active: false }).in("file_title", drop);
    const review = await reviewPending(supabaseAdmin);
    await supabaseAdmin.from("racecourse_photo_runs").insert({ ok: true, scanned, accepted, added, message: `下架 ${drop.length}；審相 ${review}` });
    return { ok: true, scanned, accepted, added, deactivated: drop.length, review };
  } catch (e) {
    const message = String(e).slice(0, 300);
    await supabaseAdmin.from("racecourse_photo_runs").insert({ ok: false, scanned, accepted, added, message });
    return { ok: false, scanned, accepted, added, message };
  }
}

const REVIEW_PROMPT =
  "You review photos for a Hong Kong horse racing website's weekly racecourse poster. Approve ONLY if the photo is a scenic, attractive view of a racecourse: the track, grandstand, horses racing, or racecourse at night. Reject: indoor rooms, shops, food stalls, studios, buses/trams, city streets or buildings where the racecourse is not the main subject, aerial town views, close-up portraits, ceremonies, screens, blurry or low-quality shots, or images with large text/logos overlaid.";

/** AI 審相：每次最多 2 張（避免定時任務逾時）未審相，失敗唔阻塞；402／403／429 即停。 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function reviewPending(sb: any): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) return "冇 AI 金鑰";
  const { data } = await sb.from("racecourse_photos").select("file_title,image_url").eq("active", true).is("approved", null).limit(2);
  let ok = 0, no = 0;
  for (const r of (data ?? []) as { file_title: string; image_url: string }[]) {
    const img = await fetch(r.image_url.replace("/1920px-", "/960px-"), { headers: { "User-Agent": "TianxiRacing/1.0 (https://tianxi.racing)" }, signal: AbortSignal.timeout(20_000) });
    if (!img.ok) continue;
    const b64 = Buffer.from(await img.arrayBuffer()).toString("base64");
    const dataUrl = `data:${img.headers.get("content-type") ?? "image/jpeg"};base64,${b64}`;
    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        reasoning: { effort: "low" },
        input: [{ role: "user", content: [
          { type: "input_text", text: REVIEW_PROMPT },
          { type: "input_image", image_url: dataUrl },
        ] }],
        text: { format: { type: "json_schema", name: "review", strict: true, schema: {
          type: "object", additionalProperties: false, required: ["approve", "reason"],
          properties: { approve: { type: "boolean" }, reason: { type: "string" } } } } },
      }),
      signal: AbortSignal.timeout(45_000),
    });
    if (res.status === 402 || res.status === 403 || res.status === 429) return `AI 暫停 ${res.status}（${ok} 過／${no} 唔過）`;
    if (!res.ok) { console.error("review", res.status, (await res.text()).slice(0, 200)); continue; }
    const j = (await res.json()) as { output?: { type: string; content?: { type: string; text?: string }[] }[] };
    const text = j.output?.find((o) => o.type === "message")?.content?.find((c) => c.type === "output_text")?.text;
    if (!text) continue;
    const v = JSON.parse(text) as { approve: boolean; reason: string };
    await sb.from("racecourse_photos").update({ approved: v.approve, review_note: v.reason.slice(0, 200) }).eq("file_title", r.file_title);
    if (v.approve) ok++; else no++;
  }
  return `${ok} 過／${no} 唔過`;
}
