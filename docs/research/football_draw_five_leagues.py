"""Exploratory five-league season-out study; does not edit production S5.

Download 1415–2425 E0/SP1/D1/I1/F1 CSVs from football-data.co.uk to
/tmp/tianxi-draw/multileague/<season>-<league>.csv. Odds are NEVER features.
Runs independent 1X2 models, not S5 score grids or official S25 gates.
"""
import json
from pathlib import Path

import numpy as np
import pandas as pd
from scipy.optimize import minimize
from scipy.special import softmax
from scipy.stats import poisson

ROOT = Path('/tmp/tianxi-draw/multileague')
SEASONS = [f'{year:02d}{(year+1)%100:02d}' for year in range(14, 25)]
LEAGUES = ('E0', 'SP1', 'D1', 'I1', 'F1')
COLS = ['elo', 'lh', 'la', 'close', 'low_total', 'poisson_draw']
rows = []
for season in SEASONS:
    for league in LEAGUES:
        data = pd.read_csv(ROOT / f'{season}-{league}.csv', encoding='latin1', on_bad_lines='skip')
        data = data[data.FTR.isin(('H', 'D', 'A'))].copy()
        data['kickoff'] = pd.to_datetime(data.Date, format='mixed', dayfirst=True, errors='coerce')
        if data.kickoff.isna().any():
            raise ValueError(f'Unknown date in {season}-{league}')
        data['season'], data['league'] = season, league
        rows.append(data)
games = pd.concat(rows, ignore_index=True).sort_values(['kickoff', 'league', 'HomeTeam']).reset_index(drop=True)
elo, goals = {}, {}
features = []
for day, group in games.groupby('kickoff', sort=True):
    updates = []
    for idx, r in group.iterrows():
        home, away = (r.league, r.HomeTeam), (r.league, r.AwayTeam)
        eh, ea = elo.get(home, 1500.), elo.get(away, 1500.)
        gh, ga = goals.get(home, (0., 0., 0.)), goals.get(away, (0., 0., 0.))
        # Previous matches only; initial prior is fixed without using target season labels.
        hfor = (gh[0] + 8 * 1.4) / (gh[2] + 8)
        hagainst = (gh[1] + 8 * 1.1) / (gh[2] + 8)
        afor = (ga[0] + 8 * 1.1) / (ga[2] + 8)
        aagainst = (ga[1] + 8 * 1.4) / (ga[2] + 8)
        lh, la = max(.2, (hfor + aagainst) / 2), max(.2, (afor + hagainst) / 2)
        # Sum of the diagonal of an independent score matrix, not a standalone production predictor.
        diag = float(np.dot(poisson.pmf(np.arange(12), lh), poisson.pmf(np.arange(12), la)))
        features.append((idx, (eh-ea+65)/400, lh, la, abs(eh-ea+65)/400, lh+la, diag))
        updates.append((home, away, eh, ea, r.FTHG, r.FTAG, r.FTR))
    # Block same-day outcomes from being used to predict another match that day.
    for home, away, eh, ea, hg, ag, result in updates:
        exp = 1 / (1 + 10**((ea-eh-65)/400))
        delta = 20 * ({'H': 1, 'D': .5, 'A': 0}[result] - exp)
        elo[home], elo[away] = eh+delta, ea-delta
        for team, gf, gc in ((home, hg, ag), (away, ag, hg)):
            prev = goals.get(team, (0., 0., 0.))
            goals[team] = (prev[0]+gf, prev[1]+gc, prev[2]+1)

feat = pd.DataFrame(features, columns=['index', *COLS]).set_index('index')
games = games.join(feat)
y = games.FTR.map({'H': 0, 'D': 1, 'A': 2}).to_numpy(dtype=int)

def fit_predict(train, test, cols):
    xtrain = games.loc[train, cols].to_numpy(float)
    xtest = games.loc[test, cols].to_numpy(float)
    mu, std = xtrain.mean(axis=0), xtrain.std(axis=0)+1e-8
    xtrain = np.c_[np.ones(len(xtrain)), (xtrain-mu)/std]
    xtest = np.c_[np.ones(len(xtest)), (xtest-mu)/std]
    onehot = np.eye(3)[y[train]]
    def objective(flat):
        w = flat.reshape(xtrain.shape[1], 3)
        p = softmax(xtrain@w, axis=1)
        loss = -np.mean(np.log(p[np.arange(len(p)), y[train]]+1e-12)) + .01*np.sum(w[1:]**2)
        grad = xtrain.T@(p-onehot)/len(p) + np.r_[np.zeros((1, 3)), .02*w[1:]]
        return loss, grad.ravel()
    opt = minimize(objective, np.zeros(xtrain.shape[1]*3), jac=True, method='L-BFGS-B')
    if not opt.success:
        raise RuntimeError(opt.message)
    return softmax(xtest@opt.x.reshape(xtrain.shape[1], 3), axis=1)

def rps(p, result):
    return float(np.mean(np.sum((np.cumsum(p, axis=1)[:, :2] - np.cumsum(np.eye(3)[result], axis=1)[:, :2])**2, axis=1)/2))

def ece(p, result):
    total = 0.
    for k in range(3):
        for j in range(10):
            selected = (p[:, k] >= j/10) & (p[:, k] < (j+1)/10 if j < 9 else p[:, k] <= 1)
            if selected.any():
                total += selected.mean() * abs((result[selected] == k).mean() - p[selected, k].mean()) / 3
    return float(total)

def bets(p, result, odd, season, threshold=.05, draw_only=False):
    valid = np.isfinite(odd).all(axis=1) & (odd > 1).all(axis=1)
    q = np.divide(1, odd[valid])
    q /= q.sum(axis=1, keepdims=True)
    edge = p[valid] - q
    pick = np.ones(len(q), int) if draw_only else edge.argmax(axis=1)
    selected = edge[np.arange(len(q)), pick] >= threshold
    returns = np.where(result[valid][selected] == pick[selected], odd[valid][np.arange(len(q))[selected], pick[selected]]-1, -1.)
    return dict(n=int(selected.sum()), roi=float(returns.mean()) if len(returns) else None,
                profit=float(returns.sum()), returns=returns.tolist(), seasons=[season]*len(returns))

variants = {'strength_goals': ['elo', 'lh', 'la'], 'draw_structure': COLS}
report = {'source': 'football-data.co.uk', 'kind': 'exploratory 1X2, not frozen S5', 'season_rows': {}, 'models': {}}
for name, cols in variants.items():
    yearly, all_p, all_y, all_returns = [], [], [], {'all': [], 'draw': []}
    for season in SEASONS[7:]:
        train = (games.season < season).to_numpy()
        test = (games.season == season).to_numpy()
        p, result = fit_predict(train, test, cols), y[test]
        g = games.loc[test]
        odds = g[['B365H', 'B365D', 'B365A']].to_numpy(float)
        valid = np.isfinite(odds).all(axis=1) & (odds > 1).all(axis=1)
        q = 1 / odds[valid]
        q /= q.sum(axis=1, keepdims=True)
        all_bets = bets(p, result, odds, season)
        draw_bets = bets(p, result, odds, season, draw_only=True)
        for key, val in [('all', all_bets), ('draw', draw_bets)]:
            all_returns[key].append(val['returns'])
        yearly.append(dict(season=season, n=len(result), rps=rps(p, result), ece=ece(p, result),
                           market_rps=rps(q, result[valid]), draw_actual=float((result == 1).mean()),
                           draw_pred=float(p[:, 1].mean()), draw_argmax=int((p.argmax(axis=1) == 1).sum()),
                           b365_valid=int(valid.sum()), all_edge5={k:v for k,v in all_bets.items() if k not in ('returns','seasons')},
                           draw_edge5={k:v for k,v in draw_bets.items() if k not in ('returns','seasons')}))
        all_p.append(p)
        all_y.append(result)
    pp, yy = np.concatenate(all_p), np.concatenate(all_y)
    summary = dict(n=len(yy), rps=rps(pp, yy), ece=ece(pp, yy), draw_pred=float(pp[:,1].mean()),
                   draw_actual=float((yy == 1).mean()), draw_argmax=int((pp.argmax(axis=1) == 1).sum()))
    for key, samples in all_returns.items():
        flat = np.concatenate(samples) if any(len(s) for s in samples) else np.array([])
        # Resample whole seasons, preserving within-season clustering; 4 seasons means broad intervals.
        rng = np.random.default_rng(20260929)
        boot = []
        for _ in range(10000):
            draw = rng.integers(0, len(samples), len(samples))
            combined = np.concatenate([samples[i] for i in draw])
            if len(combined):
                boot.append(float(np.mean(combined)))
        summary[key+'_edge5'] = dict(n=len(flat), roi=float(flat.mean()) if len(flat) else None,
                                    profitable_seasons=sum(sum(s)>0 for s in samples),
                                    ci95=[float(v) for v in np.quantile(boot, [.025, .975])] if boot else None)
    report['models'][name] = dict(summary=summary, yearly=yearly)

out = Path('docs/research/football_draw_five_leagues_results.json')
out.write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
for model, value in report['models'].items():
    print(model, value['summary'])
    for season in value['yearly']:
        print(season['season'], season['n'], 'rps', round(season['rps'], 5), 'market', round(season['market_rps'], 5),
              'B365 all', season['all_edge5'], 'draw', season['draw_edge5'])