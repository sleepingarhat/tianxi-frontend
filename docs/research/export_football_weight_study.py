"""Export season-out 2024/25 exploratory match rows for the read-only UI.

Source CSV files are stored under /tmp/tianxi-draw/multileague; odds are
settlement references only, never input features. Not an S5 backtest.
"""
import json
from collections import defaultdict
from pathlib import Path

import numpy as np

source = Path('docs/research/football_draw_five_leagues.py').read_text()
exec(source.split('for name, cols in variants.items():')[0])

season = '2425'
train = (games.season < season).to_numpy()
test = (games.season == season).to_numpy()
p = fit_predict(train, test, variants['draw_structure'])
form = defaultdict(list)
prior = {}
for day, group in games.groupby('kickoff', sort=True):
    updates = []
    for idx, row in group.iterrows():
        h, a = (row.league, row.HomeTeam), (row.league, row.AwayTeam)
        prior[idx] = (form[h][-5:], form[a][-5:])
        updates.append((h, a, row.FTR))
    for h, a, result in updates:
        form[h].append(3 if result == 'H' else 1 if result == 'D' else 0)
        form[a].append(3 if result == 'A' else 1 if result == 'D' else 0)

rows = []
for prob, (idx, row) in zip(p, games[test].iterrows()):
    home_form, away_form = prior[idx]
    odds = [row.get(key) for key in ('B365H', 'B365D', 'B365A')]
    rows.append(dict(
        id=f'{season}-{row.league}-{idx}', date=row.kickoff.strftime('%Y-%m-%d'),
        div=row.league, home=row.HomeTeam, away=row.AwayTeam,
        score=[int(row.FTHG), int(row.FTAG)], result=row.FTR,
        eloGap=round(float(row.elo * 400 - 65), 1),
        goals=[round(float(row.lh), 3), round(float(row.la), 3)],
        form=[home_form, away_form], injury=None,
        p=[round(float(v), 6) for v in prob],
        odds=[round(float(v), 3) for v in odds] if all(np.isfinite(odds)) and min(odds) > 1 else None,
    ))

target = Path('src/data/football-weight-study-2425.json')
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(json.dumps(rows, ensure_ascii=False, separators=(',', ':')) + '\n')
print('exported', len(rows), 'matches, odds available', sum(bool(r['odds']) for r in rows))