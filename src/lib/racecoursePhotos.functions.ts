import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { RacecoursePhotoRow } from "./racecoursePhotoPick";

export function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const getRacecoursePhotos = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await publicClient()
    .from("racecourse_photos")
    .select("file_title,venue,image_url,width,height,author,license,license_url,source_page")
    .eq("active", true);
  return (data ?? []) as RacecoursePhotoRow[];
});
