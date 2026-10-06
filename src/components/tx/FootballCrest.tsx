import { useState } from "react";

/** 球隊識別標：以隊名派生穩定色相，畫成盾形隊徽＋球衣條紋（非官方徽章，只作視覺識別） */
function hueOf(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
}

function initials(name: string) {
  const parts = name.replace(/[^A-Za-z\u4e00-\u9fff ]/g, " ").trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (/[\u4e00-\u9fff]/.test(name)) return name.slice(0, 2);
  if (parts.length === 1) return (parts[0] ?? "?").slice(0, 2).toUpperCase();
  return `${(parts[0] ?? "")[0] ?? ""}${(parts[1] ?? "")[0] ?? ""}`.toUpperCase();
}

export function FootballCrest({
  name,
  size = 26,
  src,
}: {
  name: string;
  size?: number;
  /** 官方隊徽 URL（football-data.org 託管）；載入失敗即自動退回派生盾形識別標 */
  src?: string | null;
}) {
  const [broken, setBroken] = useState(false);
  const h = hueOf(name);
  const main = `oklch(0.58 0.14 ${h})`;
  const alt = `oklch(0.86 0.07 ${h})`;
  const label = initials(name);

  if (src && !broken) {
    return (
      <img
        src={src}
        alt={`${name} 隊徽`}
        width={size}
        height={size}
        loading="lazy"
        onError={() => setBroken(true)}
        className="shrink-0 object-contain"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 32 36"
      width={size}
      height={(size * 36) / 32}
      className="shrink-0"
      role="img"
      aria-label={`${name} 識別標`}
    >
      <defs>
        <clipPath id={`c${h}`}>
          <path d="M2 3h28v18c0 7-8.5 11.5-14 13C10.5 32.5 2 28 2 21z" />
        </clipPath>
      </defs>
      <path d="M2 3h28v18c0 7-8.5 11.5-14 13C10.5 32.5 2 28 2 21z" fill={alt} />
      <g clipPath={`url(#c${h})`}>
        <rect x="6" y="0" width="4" height="36" fill={main} opacity="0.5" />
        <rect x="14" y="0" width="4" height="36" fill={main} opacity="0.5" />
        <rect x="22" y="0" width="4" height="36" fill={main} opacity="0.5" />
      </g>
      <path
        d="M2 3h28v18c0 7-8.5 11.5-14 13C10.5 32.5 2 28 2 21z"
        fill="none"
        stroke={main}
        strokeWidth="1.6"
      />
      <text
        x="16"
        y="20"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="oklch(0.22 0.02 60)"
        fontFamily="ui-sans-serif, system-ui"
      >
        {label}
      </text>
    </svg>
  );
}
