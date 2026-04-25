#!/usr/bin/env python3
"""Generate v2 Beta SVG mockups for pages 02-06.

Style system (dark mode 綠啡紅):
  bg-base         #0B1612
  surface         #13201C
  surface-hi      #1B2A24
  text-primary    #F0EBDD
  text-secondary  #B8B0A0
  text-muted      #7A7368
  green-deep      #1B5E3F
  green-bright    #3BBF7A
  brown-tan       #D4B78A
  red             #E6435A
  gold            #E8B838

Shared: status bar + brandbar + Beta pill + bottom nav.
"""
from pathlib import Path

OUT = Path("/tmp/tx/tianxi-frontend/design-refs")

# Shared design constants
BG = "#0B1612"
SURFACE = "#13201C"
SURFACE_HI = "#1B2A24"
SURFACE_HI2 = "#223329"
TEXT_PRI = "#F0EBDD"
TEXT_SEC = "#B8B0A0"
TEXT_MUT = "#7A7368"
GREEN_DEEP = "#1B5E3F"
GREEN_BRIGHT = "#3BBF7A"
BROWN = "#D4B78A"
RED = "#E6435A"
GOLD = "#E8B838"
BORDER = "#2A3A32"


def header(y_offset=0):
    """Status bar (20h) + brandbar (64h). Returns (svg_str, y_cursor)."""
    s = f'''
  <!-- Status bar -->
  <rect x="0" y="0" width="375" height="44" fill="{BG}"/>
  <text x="20" y="28" font-family="'Noto Sans TC'" font-size="15" font-weight="600" fill="{TEXT_PRI}">9:41</text>
  <circle cx="310" cy="22" r="2" fill="{TEXT_PRI}"/>
  <circle cx="320" cy="22" r="2" fill="{TEXT_PRI}"/>
  <circle cx="330" cy="22" r="2" fill="{TEXT_PRI}"/>
  <circle cx="340" cy="22" r="2" fill="{TEXT_PRI}"/>

  <!-- Brandbar -->
  <rect x="0" y="44" width="375" height="64" fill="{BG}"/>
  <g transform="translate(20,56)">
    <rect x="0" y="0" width="40" height="40" rx="10" fill="url(#brandGradient)"/>
    <text x="20" y="27" font-family="'Noto Sans TC'" font-size="20" font-weight="800" fill="{TEXT_PRI}" text-anchor="middle">天</text>
  </g>
  <text x="72" y="76" font-family="'Noto Sans TC'" font-size="15" font-weight="700" fill="{TEXT_PRI}">天喜娛樂</text>
  <text x="72" y="94" font-family="'JetBrains Mono'" font-size="10" font-weight="600" fill="{TEXT_SEC}" letter-spacing="1.5">TIANXI ENTERTAINMENT</text>
  <circle cx="340" cy="76" r="14" fill="none" stroke="{BORDER}" stroke-width="1.5"/>
  <circle cx="340" cy="72" r="5" fill="{GREEN_BRIGHT}"/>
'''
    return s, 108


def beta_pill(y):
    return f'''
  <!-- Beta pill -->
  <rect x="20" y="{y}" width="180" height="28" rx="14" fill="{GREEN_DEEP}"/>
  <circle cx="34" cy="{y+14}" r="4" fill="{GREEN_BRIGHT}"/>
  <text x="44" y="{y+18}" font-family="'Noto Sans TC'" font-size="12" font-weight="700" fill="{GREEN_BRIGHT}">Beta 免費 · 全功能開放</text>
'''


def bottom_nav(y, active_idx):
    """Bottom nav at y, active_idx 0..4 for 5 tabs."""
    tabs = [("儀", "儀表板"), ("神", "選馬神器"), ("日", "賽馬日程"), ("科", "馬匹百科"), ("聊", "馬圈聊天室")]
    nav = f'<rect x="0" y="{y}" width="375" height="72" fill="{SURFACE}" stroke="{BORDER}" stroke-width="1"/>\n'
    for i, (glyph, _name) in enumerate(tabs):
        cx = 37 + i * 75
        fill = GREEN_BRIGHT if i == active_idx else TEXT_MUT
        nav += f'  <circle cx="{cx}" cy="{y+20}" r="14" fill="{SURFACE_HI if i==active_idx else "none"}" stroke="{fill}" stroke-width="1.5"/>\n'
        nav += f'  <text x="{cx}" y="{y+25}" font-family="\'Noto Sans TC\'" font-size="12" font-weight="700" fill="{fill}" text-anchor="middle">{glyph}</text>\n'
        nav += f'  <text x="{cx}" y="{y+50}" font-family="\'Noto Sans TC\'" font-size="9" font-weight="600" fill="{fill}" text-anchor="middle">{_name}</text>\n'
    return nav


def defs():
    return f'''
  <defs>
    <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{GREEN_DEEP}"/>
      <stop offset="50%" stop-color="{BROWN}"/>
      <stop offset="100%" stop-color="{RED}"/>
    </linearGradient>
    <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="{GREEN_DEEP}"/>
      <stop offset="100%" stop-color="{GREEN_BRIGHT}"/>
    </linearGradient>
  </defs>
'''


def wrap_svg(height, body):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="375" height="{height}" viewBox="0 0 375 {height}" font-family="'Noto Sans TC', system-ui">
{defs()}
  <rect width="375" height="{height}" fill="{BG}"/>
{body}
</svg>'''


# ============================================================
# Page 02 — DASHBOARD · 我的儀表板
# ============================================================
def page_dashboard():
    H = 1600
    body, y = header()
    y = 120
    body += beta_pill(y); y += 44

    # Title
    body += f'''
  <text x="20" y="{y+22}" font-family="'Noto Sans TC'" font-size="24" font-weight="800" fill="{TEXT_PRI}">我的儀表板</text>
  <text x="20" y="{y+44}" font-family="'Noto Sans TC'" font-size="13" fill="{TEXT_SEC}">今日馬圈 · 一眼睇晒</text>
'''
    y += 70

    # 4 stat cards (2x2 grid)
    stats = [
        ("今日賽事", "8", "場", GREEN_BRIGHT),
        ("我心水", "5", "隻", GOLD),
        ("AI 準繩度", "72", "%", BROWN),
        ("值博提醒", "3", "個", RED),
    ]
    for i, (label, num, unit, color) in enumerate(stats):
        cx = 20 + (i % 2) * 175
        cy = y + (i // 2) * 100
        body += f'''
  <rect x="{cx}" y="{cy}" width="160" height="88" rx="14" fill="{SURFACE}" stroke="{BORDER}" stroke-width="1"/>
  <text x="{cx+16}" y="{cy+22}" font-family="'Noto Sans TC'" font-size="11" fill="{TEXT_SEC}">{label}</text>
  <text x="{cx+16}" y="{cy+60}" font-family="'JetBrains Mono'" font-size="30" font-weight="800" fill="{color}">{num}</text>
  <text x="{cx+70}" y="{cy+60}" font-family="'Noto Sans TC'" font-size="12" fill="{TEXT_SEC}">{unit}</text>
'''
    y += 220

    # Next race countdown card (大)
    body += f'''
  <rect x="20" y="{y}" width="335" height="150" rx="16" fill="{SURFACE_HI}" stroke="{GOLD}" stroke-width="1.5"/>
  <text x="36" y="{y+24}" font-family="'Noto Sans TC'" font-size="11" font-weight="700" fill="{GOLD}" letter-spacing="1.5">NEXT RACE</text>
  <text x="36" y="{y+54}" font-family="'Noto Sans TC'" font-size="18" font-weight="700" fill="{TEXT_PRI}">第 3 場 · 沙田 1200M</text>
  <text x="36" y="{y+76}" font-family="'Noto Sans TC'" font-size="12" fill="{TEXT_SEC}">場地：好地 · 天氣：晴</text>
  <text x="36" y="{y+118}" font-family="'JetBrains Mono'" font-size="32" font-weight="800" fill="{TEXT_PRI}">02:14:07</text>
  <text x="220" y="{y+118}" font-family="'Noto Sans TC'" font-size="11" fill="{TEXT_MUT}">倒數至開跑</text>
'''
    y += 170

    # My watchlist section title
    body += f'''
  <text x="20" y="{y+20}" font-family="'Noto Sans TC'" font-size="18" font-weight="700" fill="{TEXT_PRI}">我嘅心水追蹤</text>
  <text x="335" y="{y+20}" font-family="'Noto Sans TC'" font-size="12" fill="{GREEN_BRIGHT}" text-anchor="end">查看全部 ›</text>
'''
    y += 40

    # 3 horse cards
    horses = [
        ("時時精綵", "E234", "1768", "第 3 場 · 2 檔", GREEN_BRIGHT, "↑"),
        ("福逸", "F102", "1742", "第 5 場 · 7 檔", GOLD, "·"),
        ("北極光", "G015", "1715", "第 7 場 · 1 檔", RED, "↓"),
    ]
    for name, code, elo, pos, clr, trend in horses:
        body += f'''
  <rect x="20" y="{y}" width="335" height="76" rx="12" fill="{SURFACE}" stroke="{BORDER}" stroke-width="1"/>
  <rect x="20" y="{y}" width="4" height="76" rx="2" fill="{clr}"/>
  <text x="36" y="{y+26}" font-family="'Noto Sans TC'" font-size="16" font-weight="700" fill="{TEXT_PRI}">{name}</text>
  <text x="36" y="{y+46}" font-family="'JetBrains Mono'" font-size="10" fill="{TEXT_MUT}">#{code}</text>
  <text x="95" y="{y+46}" font-family="'Noto Sans TC'" font-size="11" fill="{TEXT_SEC}">{pos}</text>
  <text x="270" y="{y+30}" font-family="'Noto Sans TC'" font-size="10" fill="{TEXT_MUT}">Elo</text>
  <text x="270" y="{y+52}" font-family="'JetBrains Mono'" font-size="18" font-weight="700" fill="{clr}">{elo}</text>
  <text x="340" y="{y+52}" font-family="'Noto Sans TC'" font-size="16" font-weight="700" fill="{clr}">{trend}</text>
'''
        y += 86

    y += 10
    # System tip card
    body += f'''
  <rect x="20" y="{y}" width="335" height="80" rx="12" fill="{GREEN_DEEP}" stroke="{GREEN_BRIGHT}" stroke-width="1"/>
  <text x="36" y="{y+24}" font-family="'Noto Sans TC'" font-size="11" font-weight="700" fill="{GREEN_BRIGHT}" letter-spacing="1.2">BETA 貼士</text>
  <text x="36" y="{y+46}" font-family="'Noto Sans TC'" font-size="14" font-weight="700" fill="{TEXT_PRI}">今日選馬神器已分析全 8 場</text>
  <text x="36" y="{y+64}" font-family="'Noto Sans TC'" font-size="11" fill="{TEXT_SEC}">有 3 隻馬被標記為「值博度高」</text>
'''
    y += 100

    # Beta feedback
    body += f'''
  <rect x="20" y="{y}" width="335" height="60" rx="10" fill="{SURFACE}" stroke="{BORDER}" stroke-width="1" stroke-dasharray="4 4"/>
  <text x="187" y="{y+25}" font-family="'Noto Sans TC'" font-size="12" font-weight="600" fill="{BROWN}" text-anchor="middle">Beta 反饋 · 幫我哋改進</text>
  <text x="187" y="{y+45}" font-family="'Noto Sans TC'" font-size="10" fill="{TEXT_SEC}" text-anchor="middle">⌇ 告訴我哋你想多啲邊啲功能 →</text>
'''
    y += 80

    body += bottom_nav(H - 92, 0)

    return wrap_svg(H, body)


# ============================================================
# Page 03 — PREDICTOR · 選馬神器 (王牌)
# ============================================================
def page_predictor():
    H = 1800
    body, _ = header()
    y = 120
    body += beta_pill(y); y += 44

    # Title with WangPai badge
    body += f'''
  <text x="20" y="{y+22}" font-family="'Noto Sans TC'" font-size="24" font-weight="800" fill="{TEXT_PRI}">選馬神器</text>
  <rect x="120" y="{y+4}" width="40" height="22" rx="4" fill="{RED}"/>
  <text x="140" y="{y+19}" font-family="'Noto Sans TC'" font-size="11" font-weight="800" fill="{TEXT_PRI}" text-anchor="middle">王牌</text>
  <text x="20" y="{y+44}" font-family="'Noto Sans TC'" font-size="13" fill="{TEXT_SEC}">AI 計勝率 · 揀因子 · 搵值博</text>
'''
    y += 70

    # Race selector pill
    body += f'''
  <rect x="20" y="{y}" width="335" height="48" rx="12" fill="{SURFACE}" stroke="{GREEN_BRIGHT}" stroke-width="1.5"/>
  <text x="36" y="{y+20}" font-family="'Noto Sans TC'" font-size="11" fill="{TEXT_MUT}">分析中</text>
  <text x="36" y="{y+38}" font-family="'Noto Sans TC'" font-size="15" font-weight="700" fill="{TEXT_PRI}">第 3 場 · 沙田 1200M 第四班</text>
  <text x="340" y="{y+30}" font-family="'Noto Sans TC'" font-size="18" fill="{GREEN_BRIGHT}" text-anchor="end">▾</text>
'''
    y += 68

    # Factor chip row
    body += f'''
  <text x="20" y="{y+18}" font-family="'Noto Sans TC'" font-size="13" font-weight="700" fill="{TEXT_PRI}">分析因子 (12 個全開)</text>
  <text x="340" y="{y+18}" font-family="'Noto Sans TC'" font-size="11" fill="{GREEN_BRIGHT}" text-anchor="end">自訂 ›</text>
'''
    y += 32

    factors = [("Elo v1.1", True), ("場地偏差", True), ("檔位", True), ("負磅", True), ("往績", True), ("騎師", True)]
    x_cursor = 20
    for label, active in factors:
        w = 20 + len(label) * 12
        fill = GREEN_DEEP if active else SURFACE
        stroke = GREEN_BRIGHT if active else BORDER
        txt = TEXT_PRI if active else TEXT_MUT
        if x_cursor + w > 355:
            x_cursor = 20; y += 36
        body += f'''
  <rect x="{x_cursor}" y="{y}" width="{w}" height="28" rx="14" fill="{fill}" stroke="{stroke}" stroke-width="1"/>
  <text x="{x_cursor+w/2}" y="{y+19}" font-family="'Noto Sans TC'" font-size="11" font-weight="600" fill="{txt}" text-anchor="middle">{label}</text>
'''
        x_cursor += w + 8
    y += 50

    # Disclaimer
    body += f'''
  <rect x="20" y="{y}" width="335" height="40" rx="8" fill="{SURFACE_HI}" stroke="{BORDER}" stroke-width="1"/>
  <circle cx="36" cy="{y+20}" r="7" fill="none" stroke="{BROWN}" stroke-width="1.5"/>
  <text x="36" y="{y+25}" font-family="'Noto Sans TC'" font-size="11" font-weight="800" fill="{BROWN}" text-anchor="middle">i</text>
  <text x="52" y="{y+17}" font-family="'Noto Sans TC'" font-size="10" fill="{TEXT_SEC}">賠率 = 0 權重 · 純物理向量計勝率</text>
  <text x="52" y="{y+31}" font-family="'Noto Sans TC'" font-size="10" fill="{TEXT_MUT}">(市場情緒唔入 model · 決定權交返俾你)</text>
'''
    y += 60

    # Top 3 AI picks — 大 card
    body += f'''
  <text x="20" y="{y+18}" font-family="'Noto Sans TC'" font-size="15" font-weight="700" fill="{TEXT_PRI}">AI Top 3 推介</text>
  <text x="340" y="{y+18}" font-family="'Noto Sans TC'" font-size="11" fill="{TEXT_MUT}" text-anchor="end">依勝率排序</text>
'''
    y += 32

    picks = [
        ("1", "時時精綵", "#3", "28.4%", "值博", GOLD, GREEN_BRIGHT),
        ("2", "福逸", "#7", "19.1%", "熱門", SURFACE_HI2, BROWN),
        ("3", "北極光", "#2", "14.6%", "均勢", SURFACE_HI2, TEXT_SEC),
    ]
    for rank, name, num, pct, tag, bg, pill_clr in picks:
        body += f'''
  <rect x="20" y="{y}" width="335" height="86" rx="14" fill="{bg}" stroke="{BORDER}" stroke-width="1"/>
  <circle cx="48" cy="{y+43}" r="20" fill="{pill_clr}" opacity="0.25"/>
  <text x="48" y="{y+50}" font-family="'Noto Sans TC'" font-size="22" font-weight="800" fill="{pill_clr}" text-anchor="middle">{rank}</text>
  <text x="84" y="{y+28}" font-family="'Noto Sans TC'" font-size="17" font-weight="700" fill="{TEXT_PRI}">{name}</text>
  <text x="84" y="{y+50}" font-family="'JetBrains Mono'" font-size="11" fill="{TEXT_MUT}">{num} · 騎師何澤堯 · 練馬師蔡約翰</text>
  <text x="84" y="{y+72}" font-family="'Noto Sans TC'" font-size="10" fill="{TEXT_SEC}">Elo 1768 · 最近 3 仗 1-2-1</text>
  <text x="340" y="{y+32}" font-family="'Noto Sans TC'" font-size="10" fill="{TEXT_MUT}" text-anchor="end">勝率</text>
  <text x="340" y="{y+54}" font-family="'JetBrains Mono'" font-size="20" font-weight="800" fill="{pill_clr}" text-anchor="end">{pct}</text>
  <rect x="280" y="{y+62}" width="55" height="18" rx="9" fill="{GREEN_DEEP if tag=='值博' else SURFACE}"/>
  <text x="307" y="{y+75}" font-family="'Noto Sans TC'" font-size="9" font-weight="700" fill="{pill_clr}" text-anchor="middle">{tag}</text>
'''
        y += 96

    y += 6
    # AI explanation card
    body += f'''
  <rect x="20" y="{y}" width="335" height="140" rx="14" fill="{SURFACE}" stroke="{GREEN_DEEP}" stroke-width="1"/>
  <text x="36" y="{y+24}" font-family="'Noto Sans TC'" font-size="11" font-weight="700" fill="{GREEN_BRIGHT}" letter-spacing="1.2">AI 分析報告</text>
  <text x="36" y="{y+48}" font-family="'Noto Sans TC'" font-size="13" font-weight="700" fill="{TEXT_PRI}">點解揀「時時精綵」？</text>
  <text x="36" y="{y+70}" font-family="'Noto Sans TC'" font-size="11" fill="{TEXT_SEC}">• Elo 1768 · 同場第一 (平均 1631)</text>
  <text x="36" y="{y+88}" font-family="'Noto Sans TC'" font-size="11" fill="{TEXT_SEC}">• 沙田短途往績 4-1-2-0 (勝率 28%)</text>
  <text x="36" y="{y+106}" font-family="'Noto Sans TC'" font-size="11" fill="{TEXT_SEC}">• 3 號檔 · 近 6 仗 3 號檔頭馬率 35%</text>
  <text x="36" y="{y+124}" font-family="'Noto Sans TC'" font-size="11" fill="{GOLD}">• 市場賠率 8.5 倍 vs AI 勝率 28% · 值博</text>
'''
    y += 160

    # Ask AI chat input mockup
    body += f'''
  <rect x="20" y="{y}" width="335" height="56" rx="28" fill="{SURFACE_HI}" stroke="{BROWN}" stroke-width="1.5"/>
  <text x="40" y="{y+34}" font-family="'Noto Sans TC'" font-size="13" fill="{TEXT_MUT}">問 AI：點解呢場唔值博？</text>
  <circle cx="325" cy="{y+28}" r="18" fill="{GREEN_BRIGHT}"/>
  <path d="M 319 {y+28} L 325 {y+22} L 331 {y+28} M 325 {y+22} L 325 {y+34}" stroke="{BG}" stroke-width="2" fill="none"/>
'''
    y += 80

    body += bottom_nav(H - 92, 1)
    return wrap_svg(H, body)


# ============================================================
# Page 04 — SCHEDULE · 賽馬日程
# ============================================================
def page_schedule():
    H = 1500
    body, _ = header()
    y = 120
    body += beta_pill(y); y += 44

    body += f'''
  <text x="20" y="{y+22}" font-family="'Noto Sans TC'" font-size="24" font-weight="800" fill="{TEXT_PRI}">賽馬日程</text>
  <text x="20" y="{y+44}" font-family="'Noto Sans TC'" font-size="13" fill="{TEXT_SEC}">2025-2026 賽季 · 152 個賽馬日</text>
'''
    y += 70

    # Month pill tabs
    months = [("4月", False), ("5月", True), ("6月", False), ("7月", False)]
    x = 20
    for m, active in months:
        w = 70
        body += f'''
  <rect x="{x}" y="{y}" width="{w}" height="32" rx="16" fill="{GREEN_BRIGHT if active else SURFACE}" stroke="{GREEN_BRIGHT if active else BORDER}" stroke-width="1"/>
  <text x="{x+w/2}" y="{y+21}" font-family="'Noto Sans TC'" font-size="12" font-weight="700" fill="{BG if active else TEXT_SEC}" text-anchor="middle">{m}</text>
'''
        x += w + 10
    y += 52

    # Month stats row
    body += f'''
  <rect x="20" y="{y}" width="335" height="64" rx="12" fill="{SURFACE_HI}" stroke="{BORDER}" stroke-width="1"/>
  <text x="36" y="{y+24}" font-family="'Noto Sans TC'" font-size="10" fill="{TEXT_MUT}">5 月總場次</text>
  <text x="36" y="{y+50}" font-family="'JetBrains Mono'" font-size="22" font-weight="800" fill="{GREEN_BRIGHT}">9 日</text>
  <line x1="120" y1="{y+12}" x2="120" y2="{y+52}" stroke="{BORDER}" stroke-width="1"/>
  <text x="140" y="{y+24}" font-family="'Noto Sans TC'" font-size="10" fill="{TEXT_MUT}">沙田</text>
  <text x="140" y="{y+50}" font-family="'JetBrains Mono'" font-size="22" font-weight="800" fill="{BROWN}">6</text>
  <line x1="220" y1="{y+12}" x2="220" y2="{y+52}" stroke="{BORDER}" stroke-width="1"/>
  <text x="240" y="{y+24}" font-family="'Noto Sans TC'" font-size="10" fill="{TEXT_MUT}">跑馬地</text>
  <text x="240" y="{y+50}" font-family="'JetBrains Mono'" font-size="22" font-weight="800" fill="{RED}">3</text>
'''
    y += 84

    # Race day cards
    days = [
        ("5 月 3 日", "星期六", "沙田 · 日賽", "10 場", "即將舉行", GOLD, True),
        ("5 月 7 日", "星期三", "跑馬地 · 夜賽", "8 場", "5 天後", BROWN, False),
        ("5 月 10 日", "星期六", "沙田 · 日賽", "10 場", "8 天後", BROWN, False),
        ("5 月 14 日", "星期三", "跑馬地 · 夜賽", "8 場", "12 天後", TEXT_MUT, False),
        ("5 月 17 日", "星期六", "沙田 · 日賽", "11 場", "15 天後", TEXT_MUT, False),
        ("5 月 21 日", "星期三", "跑馬地 · 夜賽", "8 場", "19 天後", TEXT_MUT, False),
    ]
    for date, weekday, venue, count, when, clr, highlight in days:
        stroke = clr if highlight else BORDER
        sw = 1.5 if highlight else 1
        body += f'''
  <rect x="20" y="{y}" width="335" height="72" rx="12" fill="{SURFACE}" stroke="{stroke}" stroke-width="{sw}"/>
  <rect x="20" y="{y}" width="4" height="72" rx="2" fill="{clr}"/>
  <text x="36" y="{y+24}" font-family="'Noto Sans TC'" font-size="15" font-weight="700" fill="{TEXT_PRI}">{date}</text>
  <text x="150" y="{y+24}" font-family="'Noto Sans TC'" font-size="11" fill="{TEXT_SEC}">{weekday}</text>
  <text x="36" y="{y+46}" font-family="'Noto Sans TC'" font-size="12" fill="{TEXT_SEC}">{venue}</text>
  <text x="36" y="{y+62}" font-family="'JetBrains Mono'" font-size="10" fill="{TEXT_MUT}">{count}</text>
  <text x="340" y="{y+32}" font-family="'Noto Sans TC'" font-size="10" fill="{clr}" text-anchor="end">{when}</text>
  <text x="340" y="{y+55}" font-family="'Noto Sans TC'" font-size="12" fill="{GREEN_BRIGHT}" text-anchor="end">查看 ›</text>
'''
        y += 82

    body += bottom_nav(H - 92, 2)
    return wrap_svg(H, body)


# ============================================================
# Page 05 — ENCYCLOPEDIA · 馬匹百科
# ============================================================
def page_encyclopedia():
    H = 1500
    body, _ = header()
    y = 120
    body += beta_pill(y); y += 44

    body += f'''
  <text x="20" y="{y+22}" font-family="'Noto Sans TC'" font-size="24" font-weight="800" fill="{TEXT_PRI}">馬匹百科</text>
  <text x="20" y="{y+44}" font-family="'Noto Sans TC'" font-size="13" fill="{TEXT_SEC}">8,361 隻馬 · 11 年歷史</text>
'''
    y += 70

    # Search bar
    body += f'''
  <rect x="20" y="{y}" width="335" height="48" rx="24" fill="{SURFACE_HI}" stroke="{BORDER}" stroke-width="1"/>
  <circle cx="40" cy="{y+24}" r="7" fill="none" stroke="{TEXT_MUT}" stroke-width="1.5"/>
  <line x1="45" y1="{y+29}" x2="50" y2="{y+34}" stroke="{TEXT_MUT}" stroke-width="1.5"/>
  <text x="58" y="{y+29}" font-family="'Noto Sans TC'" font-size="13" fill="{TEXT_MUT}">搜尋馬名 / 馬主 / 騎師 / 練馬師</text>
'''
    y += 64

    # Filter chips
    filters = [("全部", True), ("現役", False), ("熱門", False), ("新星", False), ("老將", False)]
    x = 20
    for label, active in filters:
        w = 20 + len(label) * 14
        fill = GREEN_BRIGHT if active else SURFACE
        txt_clr = BG if active else TEXT_SEC
        body += f'''
  <rect x="{x}" y="{y}" width="{w}" height="28" rx="14" fill="{fill}" stroke="{GREEN_BRIGHT if active else BORDER}" stroke-width="1"/>
  <text x="{x+w/2}" y="{y+19}" font-family="'Noto Sans TC'" font-size="11" font-weight="700" fill="{txt_clr}" text-anchor="middle">{label}</text>
'''
        x += w + 8
    y += 50

    # Trending horses (小 hero cards)
    body += f'''
  <text x="20" y="{y+18}" font-family="'Noto Sans TC'" font-size="15" font-weight="700" fill="{TEXT_PRI}">本週熱搜</text>
'''
    y += 32

    horses = [
        ("時時精綵", "E234", "1768", "現役 · F 班", "4 歲", GREEN_BRIGHT),
        ("金鎗六十", "D001", "1816", "已退役", "8 歲", GOLD),
        ("福逸", "F102", "1742", "現役 · 三班", "5 歲", BROWN),
        ("北極光", "G015", "1715", "現役 · 二班", "4 歲", RED),
    ]
    for i, (name, code, elo, status, age, clr) in enumerate(horses):
        cx = 20 + (i % 2) * 175
        cy = y + (i // 2) * 130
        body += f'''
  <rect x="{cx}" y="{cy}" width="160" height="118" rx="14" fill="{SURFACE}" stroke="{BORDER}" stroke-width="1"/>
  <rect x="{cx}" y="{cy}" width="160" height="36" rx="14" fill="{clr}" opacity="0.18"/>
  <text x="{cx+16}" y="{cy+24}" font-family="'Noto Sans TC'" font-size="14" font-weight="700" fill="{TEXT_PRI}">{name}</text>
  <text x="{cx+16}" y="{cy+56}" font-family="'JetBrains Mono'" font-size="10" fill="{TEXT_MUT}">#{code}</text>
  <text x="{cx+16}" y="{cy+76}" font-family="'Noto Sans TC'" font-size="10" fill="{TEXT_SEC}">{status}</text>
  <text x="{cx+16}" y="{cy+92}" font-family="'Noto Sans TC'" font-size="10" fill="{TEXT_SEC}">{age}</text>
  <text x="{cx+144}" y="{cy+56}" font-family="'Noto Sans TC'" font-size="9" fill="{TEXT_MUT}" text-anchor="end">Elo</text>
  <text x="{cx+144}" y="{cy+78}" font-family="'JetBrains Mono'" font-size="16" font-weight="800" fill="{clr}" text-anchor="end">{elo}</text>
  <text x="{cx+144}" y="{cy+104}" font-family="'Noto Sans TC'" font-size="10" fill="{GREEN_BRIGHT}" text-anchor="end">查看 ›</text>
'''
    y += 270

    # Category tiles
    body += f'''
  <text x="20" y="{y+18}" font-family="'Noto Sans TC'" font-size="15" font-weight="700" fill="{TEXT_PRI}">瀏覽分類</text>
'''
    y += 32

    cats = [("練馬師", "67 位"), ("騎師", "約 100 位"), ("馬主", "數百位"), ("配種系列", "族譜")]
    for i, (label, desc) in enumerate(cats):
        cx = 20 + (i % 2) * 175
        cy = y + (i // 2) * 90
        body += f'''
  <rect x="{cx}" y="{cy}" width="160" height="80" rx="12" fill="{SURFACE}" stroke="{BORDER}" stroke-width="1"/>
  <text x="{cx+16}" y="{cy+28}" font-family="'Noto Sans TC'" font-size="14" font-weight="700" fill="{TEXT_PRI}">{label}</text>
  <text x="{cx+16}" y="{cy+50}" font-family="'Noto Sans TC'" font-size="11" fill="{TEXT_SEC}">{desc}</text>
  <text x="{cx+144}" y="{cy+50}" font-family="'Noto Sans TC'" font-size="14" fill="{GREEN_BRIGHT}" text-anchor="end">›</text>
'''
    y += 190

    body += bottom_nav(H - 92, 3)
    return wrap_svg(H, body)


# ============================================================
# Page 06 — CHAT · 馬圈聊天室
# ============================================================
def page_chat():
    H = 1400
    body, _ = header()
    y = 120
    body += beta_pill(y); y += 44

    body += f'''
  <text x="20" y="{y+22}" font-family="'Noto Sans TC'" font-size="24" font-weight="800" fill="{TEXT_PRI}">馬圈聊天室</text>
  <text x="20" y="{y+44}" font-family="'Noto Sans TC'" font-size="13" fill="{TEXT_SEC}">實時討論 · Beta 用戶優先</text>
'''
    y += 70

    # Online indicator
    body += f'''
  <rect x="20" y="{y}" width="335" height="44" rx="10" fill="{SURFACE}" stroke="{BORDER}" stroke-width="1"/>
  <circle cx="40" cy="{y+22}" r="5" fill="{GREEN_BRIGHT}"/>
  <text x="54" y="{y+19}" font-family="'Noto Sans TC'" font-size="12" font-weight="700" fill="{TEXT_PRI}">#今日第 3 場</text>
  <text x="54" y="{y+34}" font-family="'Noto Sans TC'" font-size="10" fill="{TEXT_SEC}">127 位馬迷在線</text>
  <rect x="280" y="{y+10}" width="60" height="24" rx="12" fill="{GREEN_DEEP}"/>
  <text x="310" y="{y+26}" font-family="'Noto Sans TC'" font-size="10" font-weight="700" fill="{GREEN_BRIGHT}" text-anchor="middle">實時</text>
'''
    y += 60

    # Chat messages
    msgs = [
        ("馬迷 A", "時時精綵今日真係 fit 爆，3 號檔有著數", "2 分鐘前", GREEN_BRIGHT, False),
        ("你", "同意，AI 都俾 28% 勝率，值博啊", "1 分鐘前", GOLD, True),
        ("馬迷 B", "但賠率 8.5 已經偏熱，小心", "剛剛", BROWN, False),
        ("馬迷 C", "沙田短途往績 4-1-2-0，問題係檔位", "剛剛", RED, False),
        ("馬迷 D", "我押福逸 7 號檔，5 月運氣", "剛剛", TEXT_SEC, False),
    ]
    for author, msg, time, clr, is_me in msgs:
        align_right = is_me
        if align_right:
            bg = GREEN_DEEP
            stroke = GREEN_BRIGHT
            text_clr = TEXT_PRI
            box_x = 100
            box_w = 255
        else:
            bg = SURFACE
            stroke = BORDER
            text_clr = TEXT_PRI
            box_x = 20
            box_w = 255
        body += f'''
  <circle cx="{'340' if align_right else '35'}" cy="{y+20}" r="14" fill="{clr}" opacity="0.3"/>
  <text x="{'340' if align_right else '35'}" y="{y+25}" font-family="'Noto Sans TC'" font-size="12" font-weight="700" fill="{clr}" text-anchor="middle">{author[0]}</text>
  <rect x="{box_x}" y="{y+4}" width="{box_w}" height="60" rx="14" fill="{bg}" stroke="{stroke}" stroke-width="1"/>
  <text x="{box_x+14}" y="{y+24}" font-family="'Noto Sans TC'" font-size="11" font-weight="700" fill="{clr}">{author}</text>
  <text x="{box_x+14}" y="{y+44}" font-family="'Noto Sans TC'" font-size="12" fill="{text_clr}">{msg}</text>
  <text x="{box_x+box_w-14}" y="{y+60}" font-family="'Noto Sans TC'" font-size="9" fill="{TEXT_MUT}" text-anchor="end">{time}</text>
'''
        y += 80

    y += 10
    # AI moderator card
    body += f'''
  <rect x="20" y="{y}" width="335" height="76" rx="14" fill="{SURFACE_HI}" stroke="{BROWN}" stroke-width="1" stroke-dasharray="4 4"/>
  <rect x="20" y="{y}" width="4" height="76" rx="2" fill="{BROWN}"/>
  <text x="36" y="{y+22}" font-family="'Noto Sans TC'" font-size="11" font-weight="700" fill="{BROWN}" letter-spacing="1.2">天喜 AI 摘要</text>
  <text x="36" y="{y+44}" font-family="'Noto Sans TC'" font-size="12" font-weight="700" fill="{TEXT_PRI}">本場討論熱度：時時精綵 (42%) · 福逸 (28%)</text>
  <text x="36" y="{y+62}" font-family="'Noto Sans TC'" font-size="10" fill="{TEXT_SEC}">⌇ 馬迷普遍看好 3 號檔 · 檔位爭議係主要變數</text>
'''
    y += 96

    # Input box
    body += f'''
  <rect x="20" y="{y}" width="335" height="56" rx="28" fill="{SURFACE_HI}" stroke="{BORDER}" stroke-width="1"/>
  <text x="40" y="{y+34}" font-family="'Noto Sans TC'" font-size="13" fill="{TEXT_MUT}">同馬迷傾計 · 分享你心水...</text>
  <circle cx="325" cy="{y+28}" r="18" fill="{GREEN_BRIGHT}"/>
  <path d="M 319 {y+28} L 325 {y+22} L 331 {y+28} M 325 {y+22} L 325 {y+34}" stroke="{BG}" stroke-width="2" fill="none"/>
'''
    y += 76

    body += bottom_nav(H - 92, 4)
    return wrap_svg(H, body)


# ============================================================
# Main
# ============================================================
pages = {
    "02-dashboard": (page_dashboard, 1600),
    "03-predictor": (page_predictor, 1800),
    "04-schedule": (page_schedule, 1500),
    "05-encyclopedia": (page_encyclopedia, 1500),
    "06-chat": (page_chat, 1400),
}

for key, (fn, height) in pages.items():
    subdir_map = {
        "02-dashboard": "dashboard",
        "03-predictor": "predictor",
        "04-schedule": "schedule",
        "05-encyclopedia": "encyclopedia",
        "06-chat": "chat",
    }
    sub = subdir_map[key]
    d = OUT / sub
    d.mkdir(parents=True, exist_ok=True)
    svg = fn()
    svg_path = d / f"{key}-v2-beta.svg"
    svg_path.write_text(svg)
    print(f"Wrote {svg_path}  ({len(svg)} bytes, h={height})")

print("DONE")
