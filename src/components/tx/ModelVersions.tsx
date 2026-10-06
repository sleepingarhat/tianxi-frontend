import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

import { Pill } from "./ui";

type VersionRow = {
  version: string;
  engine: string;
  fingerprint: string | null;
  released_at: string;
  status: string;
  notes: string | null;
};

/** 版本化成績：讀 model_versions，當前版本置頂，歷史版本可展開；只讀，唔改任何帳。 */
export function ModelVersions({ engine }: { engine: "racing" | "football" | "marksix" }) {
  const q = useQuery({
    queryKey: ["model-versions", engine],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("model_versions")
        .select("version,engine,fingerprint,released_at,status,notes")
        .eq("engine", engine)
        .order("released_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as VersionRow[];
    },
    staleTime: 10 * 60_000,
  });
  const rows = q.data ?? [];
  if (q.isLoading || !rows.length) return null;
  const active = rows.filter((r) => r.status === "active");
  const archived = rows.filter((r) => r.status !== "active");

  const renderRow = (r: VersionRow) => (
    <li key={r.version} className="border-b border-hairline py-2 last:border-b-0">
      <p className="flex flex-wrap items-center gap-1.5">
        <span className="font-mono-tx text-[12px] font-bold text-ink">{r.version}</span>
        <Pill tone={r.status === "active" ? "win" : "ink"}>{r.status === "active" ? "當前版本" : "歷史版本"}</Pill>
        <span className="tabnum ml-auto font-mono-tx text-[9px] text-ink-3">{r.released_at}</span>
      </p>
      {r.notes ? <p className="mt-1 text-[10px] leading-relaxed text-ink-3">{r.notes}</p> : null}
      {r.fingerprint ? (
        <p className="tabnum mt-0.5 font-mono-tx text-[9px] text-ink-3">指紋 {r.fingerprint}</p>
      ) : null}
    </li>
  );

  return (
    <section className="mx-4 my-3 rounded-[8px] border border-hairline bg-paper-2 p-3 shadow-sm">
      <h2 className="font-serif-tc text-[15px] font-bold text-ink">
        模型版本
        <small className="ml-2 font-mono-tx text-[9px] font-bold uppercase tracking-[0.2em] text-ink-3">Model Versions</small>
      </h2>
      <ul>{active.map(renderRow)}</ul>
      {archived.length ? (
        <details className="mt-1 rounded-[6px] border border-hairline bg-paper px-2.5 py-2">
          <summary className="cursor-pointer text-[10px] font-bold text-ink-2">
            歷史版本（{archived.length}）— 成績由各自定版日起獨立計算，唔回填
          </summary>
          <ul className="mt-1">{archived.map(renderRow)}</ul>
        </details>
      ) : null}
    </section>
  );
}
