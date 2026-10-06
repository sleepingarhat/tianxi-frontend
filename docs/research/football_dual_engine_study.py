"""Dual-engine (A + draw engine B) season-out study. Research only; never edits S5.

Engine A = draw_structure multinomial logistic (proxy for S5, NOT the frozen matrix).
Engine B candidates (each outputs a draw probability):
  poisson  independent Poisson grid (control)
  dip      diagonal-inflated Poisson (Karlis & Ntzoufras 2003)
  dc       Dixon-Coles low-score rho correction (1997)
  bvp      bivariate Poisson, shared component lambda3 (Karlis & Ntzoufras 2003)
  ordered  ordered logit, draw band width depends on expected total goals
  binary   dedicated draw-vs-not logistic classifier
Blend: P_D <- (1-w) A_D + w B_D, H/A rescaled in A's ratio.  w, and the draw-pick
threshold, are chosen on the previous season only (inner walk-forward).
Odds (B365) are settlement only, never features.
"""
import json
from pathlib import Path

import numpy as np
from scipy.optimize import minimize, minimize_scalar
from scipy.special import expit, softmax
from scipy.stats import poisson

src = Path('docs/research/football_draw_five_leagues.py').read_text()
exec(src.split('for name, cols in variants.items():')[0])

G = 11
K = np.arange(G)
hg = games.FTHG.to_numpy(int)
ag = games.FTAG.to_numpy(int)
X = games[COLS].to_numpy(float)


def goal_rates(train, idx):
    """Poisson GLM for home/away goals on pre-match features; returns lambdas for idx."""
    out = []
    for goals, lam_col, sign in ((hg, 'lh', 1), (ag, 'la', -1)):
        z = np.c_[np.ones(len(games)), np.log(games[lam_col]), sign * games.elo]
        zt, yt = z[train], goals[train]
        f = lambda b: (np.exp(zt @ b) - yt * (zt @ b)).mean()
        g = lambda b: zt.T @ (np.exp(zt @ b) - yt) / len(yt)
        b = minimize(f, np.zeros(3), jac=g, method='L-BFGS-B').x
        out.append(np.exp(z[idx] @ b))
    return out


def grid_1x2(m):
    return np.stack([np.tril(m, -1).sum((1, 2)), np.trace(m, axis1=1, axis2=2), np.triu(m, 1).sum((1, 2))], 1)


def indep_grid(lh, la):
    return poisson.pmf(K, lh[:, None])[:, :, None] * poisson.pmf(K, la[:, None])[:, None, :]


def bvp_grid(lh, la, l3):
    l1, l2 = np.maximum(lh - l3, .05), np.maximum(la - l3, .05)
    m = np.zeros((len(lh), G, G))
    for c in range(G):
        m[:, c:, c:] += (poisson.pmf(K[:G - c], l1[:, None])[:, :, None] * poisson.pmf(K[:G - c], l2[:, None])[:, None, :]
                         * poisson.pmf(c, l3)[:, None, None])
    return m


def dc_grid(lh, la, rho):
    m = indep_grid(lh, la).copy()
    m[:, 0, 0] *= np.maximum(1 - lh * la * rho, 0)
    m[:, 0, 1] *= 1 + lh * rho
    m[:, 1, 0] *= 1 + la * rho
    m[:, 1, 1] *= 1 - rho
    return m / m.sum((1, 2), keepdims=True)


def ll(p, yy):
    return -np.mean(np.log(p[np.arange(len(yy)), yy] + 1e-12))


def engine_b(name, train, test):
    """Fit engine B on train only; return 1X2 probs for test."""
    if name == 'binary':
        cols = COLS
        xt = games.loc[train, cols].to_numpy(float); xs = games.loc[test, cols].to_numpy(float)
        mu, sd = xt.mean(0), xt.std(0) + 1e-8
        xt = np.c_[np.ones(len(xt)), (xt - mu) / sd, ((xt - mu) / sd) ** 2]
        xs = np.c_[np.ones(len(xs)), (xs - mu) / sd, ((xs - mu) / sd) ** 2]
        d = (y[train] == 1).astype(float)
        f = lambda w: -np.mean(d * np.log(expit(xt @ w) + 1e-12) + (1 - d) * np.log(1 - expit(xt @ w) + 1e-12)) + .01 * w[1:] @ w[1:]
        w = minimize(f, np.zeros(xt.shape[1]), method='L-BFGS-B').x
        pd_ = expit(xs @ w)
        return np.c_[(1 - pd_) / 2, pd_, (1 - pd_) / 2]  # H/A split supplied by A in blend
    if name == 'ordered':
        e, tot = games.elo.to_numpy(), (games.lh + games.la).to_numpy()
        def probs(t, idx):
            s = t[0] * e[idx] + t[1]
            half = np.exp(t[2] + t[3] * (tot[idx] - 2.7))
            pa = expit(-half - s); ph = 1 - expit(half - s)
            return np.c_[ph, np.clip(1 - ph - pa, 1e-6, 1), pa]
        t = minimize(lambda t: ll(probs(t, train), y[train]), np.array([4., .3, -1., 0.]), method='Nelder-Mead',
                     options=dict(maxiter=4000)).x
        return probs(t, test)
    (lh_t, la_t), (lh_s, la_s) = goal_rates(train, train), goal_rates(train, test)
    yt = y[train]
    if name == 'poisson':
        return grid_1x2(indep_grid(lh_s, la_s))
    if name == 'dc':
        r = minimize_scalar(lambda r: ll(grid_1x2(dc_grid(lh_t, la_t, r)), yt), bounds=(-.3, .3), method='bounded').x
        return grid_1x2(dc_grid(lh_s, la_s, r))
    if name == 'bvp':
        f = lambda c: ll(grid_1x2(bvp_grid(lh_t, la_t, np.full(len(lh_t), c))), yt)
        c = minimize_scalar(f, bounds=(0, .6), method='bounded').x
        return grid_1x2(bvp_grid(lh_s, la_s, np.full(len(lh_s), c)))
    if name == 'dip':
        base_t, base_s = grid_1x2(indep_grid(lh_t, la_t)), grid_1x2(indep_grid(lh_s, la_s))
        mix = lambda b, pi: b * (1 - pi) + np.array([0, pi, 0])
        pi = minimize_scalar(lambda pi: ll(mix(base_t, pi), yt), bounds=(0, .3), method='bounded').x
        return mix(base_s, pi)
    raise KeyError(name)


def blend(a, b, w):
    pd_ = (1 - w) * a[:, 1] + w * b[:, 1]
    rest = a[:, [0, 2]] / a[:, [0, 2]].sum(1, keepdims=True) * (1 - pd_)[:, None]
    return np.c_[rest[:, 0], pd_, rest[:, 1]]


def pick(p, t):
    """Three-way pick: draw when P_D >= t, otherwise higher of H/A."""
    return np.where(p[:, 1] >= t, 1, np.where(p[:, 0] >= p[:, 2], 0, 2))


def choose_t(p, yy):
    """Threshold maximizing accuracy with the draw-pick share kept in 15–35%."""
    best = None
    for t in np.arange(.22, .36, .005):
        pk = pick(p, t); share = (pk == 1).mean()
        if .15 <= share <= .35:
            acc = (pk == yy).mean()
            if best is None or acc > best[0]:
                best = (acc, float(t))
    return best[1] if best else float(np.quantile(p[:, 1], .8))


def settle(p, pk, yy, odd):
    ok = np.isfinite(odd).all(1) & (odd > 1).all(1)
    r = np.where(pk[ok] == yy[ok], odd[ok][np.arange(ok.sum()), pk[ok]] - 1, -1.)
    q = 1 / odd[ok]; q /= q.sum(1, keepdims=True)
    edge = p[ok] - q; j = edge.argmax(1); sel = edge[np.arange(len(j)), j] >= .05
    vr = np.where(yy[ok][sel] == j[sel], odd[ok][np.arange(len(j))[sel], j[sel]] - 1, -1.)
    return r, vr


ENGINES = ['poisson', 'dip', 'dc', 'bvp', 'ordered', 'binary']
TEST = SEASONS[7:]
res = {k: dict(yearly=[], p=[], y=[], flat=[], value=[], draw=[]) for k in ['A', 'A_argmax', *ENGINES]}
params = {}
for s in TEST:
    prev = SEASONS[SEASONS.index(s) - 1]
    itr, iva = (games.season < prev).to_numpy(), (games.season == prev).to_numpy()
    tr, te = (games.season < s).to_numpy(), (games.season == s).to_numpy()
    a_va, a_te = fit_predict(itr, iva, COLS), fit_predict(tr, te, COLS)
    yy, odd = y[te], games.loc[te, ['B365H', 'B365D', 'B365A']].to_numpy(float)
    cands = {'A': (a_va, a_te, None), 'A_argmax': (a_va, a_te, 'argmax')}
    for e in ENGINES:
        b_va, b_te = engine_b(e, itr, iva), engine_b(e, tr, te)
        ws = [.25, .5, .75, 1.]
        w = min(ws, key=lambda w: ll(blend(a_va, b_va, w), y[iva]))
        cands[e] = (blend(a_va, b_va, w), blend(a_te, b_te, w), w)
    for k, (pv, pt, w) in cands.items():
        t = 1.1 if w == 'argmax' else choose_t(pv, y[iva])
        pk = pick(pt, t) if w != 'argmax' else pt.argmax(1)
        flat, val = settle(pt, pk, yy, odd)
        R = res[k]
        R['p'].append(pt); R['y'].append(yy); R['flat'].append(flat); R['value'].append(val)
        R['yearly'].append(dict(season=s, n=int(len(yy)), w=w if isinstance(w, float) else None, t=None if t > 1 else round(t, 3),
                                rps=rps(pt, yy), logloss=ll(pt, yy), ece=ece(pt, yy), acc=float((pk == yy).mean()),
                                draw_picks=int((pk == 1).sum()), draw_hit=float((yy[pk == 1] == 1).mean()) if (pk == 1).any() else None,
                                flat_roi=float(flat.mean()), value_n=int(len(val)), value_roi=float(val.mean()) if len(val) else None))
    print('done', s, flush=True)

report = dict(kind='dual-engine research, proxy engine A, not frozen S5', source='football-data.co.uk 1415–2425 five leagues',
              seasons=TEST, models={})
for k, R in res.items():
    pp, yy = np.concatenate(R['p']), np.concatenate(R['y'])
    fl, va = np.concatenate(R['flat']), np.concatenate(R['value'])
    ys = R['yearly']
    report['models'][k] = dict(summary=dict(n=int(len(yy)), rps=rps(pp, yy), logloss=ll(pp, yy), ece=ece(pp, yy),
        acc=float(np.mean([v['acc'] for v in ys])), draw_picks=sum(v['draw_picks'] for v in ys),
        draw_hit=float(np.nanmean([v['draw_hit'] or np.nan for v in ys])) if any(v['draw_hit'] for v in ys) else None,
        flat_roi=float(fl.mean()), flat_pos_seasons=sum(v['flat_roi'] > 0 for v in ys),
        value_n=int(len(va)), value_roi=float(va.mean()), value_pos_seasons=sum((v['value_roi'] or -1) > 0 for v in ys)), yearly=ys)
Path('docs/research/football_dual_engine_results.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
for k, v in report['models'].items():
    s = v['summary']
    print(f"{k:9s} rps {s['rps']:.5f} ll {s['logloss']:.4f} ece {s['ece']:.4f} acc {s['acc']:.3f} draws {s['draw_picks']} hit {s['draw_hit']} "
          f"flat {s['flat_roi']:+.4f}({s['flat_pos_seasons']}/4) value {s['value_roi']:+.4f} n{s['value_n']}({s['value_pos_seasons']}/4)")
