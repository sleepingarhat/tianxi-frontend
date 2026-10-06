"""Calibrate dual-v1 constants on seasons before 2021/22, validate 2021/22–2024/25 unchanged.

Engine A = draw_structure proxy; engine B = diagonal-inflated Poisson on goal rates.
Vote: pick argmax of blended P_k / base_k. Constants frozen after this run.
"""
import json
from pathlib import Path
import numpy as np

src = Path('docs/research/football_dual_engine_study.py').read_text()
exec(src.split("ENGINES = ['poisson'")[0])

cal_tr = (games.season < '2021').to_numpy()   # 1415–1920 train
cal_va = (games.season == '2021').to_numpy()  # 2020/21 choose w
cal_all = (games.season < '2122').to_numpy()
a_va = fit_predict(cal_tr, cal_va, COLS)
(lh_t, la_t) = goal_rates(cal_all, cal_all)
base_t = grid_1x2(indep_grid(lh_t, la_t))
mix = lambda b, pi: b * (1 - pi) + np.array([0, pi, 0])
PI = float(minimize_scalar(lambda pi: ll(mix(base_t, pi), y[cal_all]), bounds=(0, .3), method='bounded').x)
BASE = np.bincount(y[cal_all], minlength=3) / cal_all.sum()


def engine_b_dip(train, idx):
    lh, la = goal_rates(train, idx)
    return mix(grid_1x2(indep_grid(lh, la)), PI)


b_va = engine_b_dip(cal_tr, cal_va)
vote = lambda p: (p / BASE).argmax(1)
best = None
for w in np.arange(0, 1.01, .05):
    p = blend(a_va, b_va, w)
    pk = vote(p); acc = (pk == y[cal_va]).mean(); share = (pk == 1).mean()
    score = ll(p, y[cal_va])
    if best is None or score < best[0]:
        best = (score, float(round(w, 2)), float(acc), float(share))
W = 0.5  # logloss flat over w (Δ<0.001); fixed mid-blend so engine B truly votes
print('PI', PI, 'BASE', BASE, 'W', W, best)

rows = []
for s in SEASONS[7:]:
    tr, te = (games.season < s).to_numpy(), (games.season == s).to_numpy()
    p = blend(fit_predict(tr, te, COLS), engine_b_dip(tr, te), W)
    yy = y[te]; pk = vote(p)
    odd = games.loc[te, ['B365H', 'B365D', 'B365A']].to_numpy(float)
    flat, _ = settle(p, pk, yy, odd)
    rows.append(dict(season=s, n=int(len(yy)), acc=float((pk == yy).mean()), rps=rps(p, yy),
                     picks=[int((pk == k).sum()) for k in range(3)],
                     hits=[float((yy[pk == k] == k).mean()) if (pk == k).any() else None for k in range(3)],
                     flat_roi=float(flat.mean())))
    print(rows[-1])
out = dict(version='dual-v1', pi=PI, w=W, base=BASE.tolist(), calibrated_on='1415–2021', validation=rows)
Path('docs/research/football_dual_engine_v1.json').write_text(json.dumps(out, ensure_ascii=False, indent=2) + '\n')
