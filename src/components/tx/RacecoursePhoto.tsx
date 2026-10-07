import happyValley from "@/assets/racecourses/happy-valley-racecourse.jpg.asset.json";
import shaTin from "@/assets/racecourses/sha-tin-racecourse.jpg.asset.json";

export function RacecoursePhoto({ venue }: { venue: string }) {
  const isHappyValley = venue === "HV" || venue.includes("跑馬地");
  const asset = isHappyValley ? happyValley : shaTin;
  const title = isHappyValley ? "跑馬地馬場夜賽" : "沙田馬場賽事";
  const source = isHappyValley
    ? "https://commons.wikimedia.org/wiki/File:HKIR_20231206_Happy_Valley_Racecourse_IJC.jpg"
    : "https://commons.wikimedia.org/wiki/File:HKIR_20231210_Sha_Tin_Racecourse_Hong_Kong_Cup.jpg";
  return (
    <figure className="mx-4 mt-3 overflow-hidden rounded-[8px] border border-hairline bg-paper-2">
      <img src={asset.url} alt={title} className="aspect-[16/7] w-full object-cover" loading="eager" />
      <figcaption className="flex flex-wrap items-center justify-between gap-1 px-3 py-2 text-[9px] text-ink-3">
        <span>{title}</span>
        <a href={source} target="_blank" rel="license noopener noreferrer" className="underline decoration-hairline underline-offset-2">Will629／Wikimedia Commons · CC BY 4.0 · 已裁切</a>
      </figcaption>
    </figure>
  );
}
