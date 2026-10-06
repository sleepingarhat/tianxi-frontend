import { createFileRoute } from "@tanstack/react-router";

const FRAGMENT = `fragment lotteryDrawsFragment on LotteryDraw {
    id
    year
    no
    openDate
    closeDate
    drawDate
    status
    snowballCode
    snowballName_en
    snowballName_ch
    lotteryPool {
      sell
      status
      totalInvestment
      jackpot
      unitBet
      estimatedPrize
      derivedFirstPrizeDiv
      lotteryPrizes {
        type
        winningUnit
        dividend
      }
    }
    drawResult {
      drawnNo
      xDrawnNo
    }
  }`;

const QUERY = `query marksixDraw {
            timeOffset {
                m6  
                ts  
            }
            lotteryDraws {
                ...lotteryDrawsFragment
            }
        }
    `;

type Draw = {
  id?: string;
  year?: string | number;
  no?: string | number;
  drawDate?: string;
  closeDate?: string;
  status?: string;
};

function drawLabel(d: Draw): string {
  const year = String(d.year ?? (d.id ? d.id.slice(0, 4) : "")).slice(-2);
  const no = String(d.no ?? "").padStart(3, "0");
  return year && no ? `${year}/${no}` : "";
}

function isoDate(v?: string): string {
  if (!v) return "";
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : "";
}

function closeTimeLabel(v?: string): string {
  const m = v?.match(/T(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]} HKT` : "21:15 HKT";
}

export const Route = createFileRoute("/api/public/marksix-next")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const res = await fetch("https://info.cld.hkjc.com/graphql/base/", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              origin: "https://bet.hkjc.com",
              referer: "https://bet.hkjc.com/",
              "user-agent": "Mozilla/5.0",
            },
            body: JSON.stringify({
              operationName: "marksixDraw",
              variables: {},
              query: `${QUERY}\n${FRAGMENT}`,
            }),
          });
          const json = (await res.json()) as { data?: { lotteryDraws?: Draw[] } };
          const draws = json.data?.lotteryDraws ?? [];
          if (!draws.length) throw new Error("empty schedule");

          const upcoming =
            draws.find((d) => (d.status || "").toLowerCase() !== "result") ?? draws[draws.length - 1]!;

          const body = {
            ok: true,
            next: {
              draw: drawLabel(upcoming),
              date: isoDate(upcoming.drawDate),
              timeLabel: closeTimeLabel(upcoming.closeDate),
              status: upcoming.status ?? "",
            },
            schedule: draws.map((d) => ({
              draw: drawLabel(d),
              date: isoDate(d.drawDate),
              status: d.status ?? "",
            })),
          };

          return new Response(JSON.stringify(body), {
            headers: {
              "content-type": "application/json; charset=utf-8",
              "cache-control": "public, max-age=300",
              "access-control-allow-origin": "*",
            },
          });
        } catch (err) {
          return new Response(
            JSON.stringify({ ok: false, error: err instanceof Error ? err.message : "unknown" }),
            {
              status: 502,
              headers: {
                "content-type": "application/json; charset=utf-8",
                "access-control-allow-origin": "*",
              },
            },
          );
        }
      },
    },
  },
});
