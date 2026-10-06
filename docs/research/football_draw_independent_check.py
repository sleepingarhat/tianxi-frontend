"""Independent exploratory EPL draw study; never writes production forecasts.

Fetch season CSVs from football-data.co.uk into /tmp/tianxi-draw/ before running.
Requires pandas, numpy and scipy. Odds are excluded from model features.
"""
import pandas as pd, numpy as np
from scipy.optimize import minimize
from scipy.special import softmax
from pathlib import Path
seasons=['1920','2021','2122','2223','2324','2425']
rows=[]; elo={}; goals={}
for si,season in enumerate(seasons):
 d=pd.read_csv(f'/tmp/tianxi-draw/{season}.csv');d=d[d.FTR.isin(['H','D','A'])].copy()
 for _,r in d.iterrows():
  h,a=r.HomeTeam,r.AwayTeam
  eh,ea=elo.get(h,1500),elo.get(a,1500)
  gh,ga=goals.get(h,[0,0,0]),goals.get(a,[0,0,0])
  # All signals known BEFORE match. Bayesian shrinkage avoids early-season noise.
  hrate=(gh[0]+1.4*8)/(gh[2]+8); arate=(ga[0]+1.1*8)/(ga[2]+8)
  hcon=(gh[1]+1.1*8)/(gh[2]+8); acon=(ga[1]+1.4*8)/(ga[2]+8)
  lamh=max(.2,(hrate+acon)/2); lama=max(.2,(arate+hcon)/2)
  odds=np.array([r.get('AvgH'),r.get('AvgD'),r.get('AvgA')],float)
  rows.append([season,(eh-ea+65)/400,abs(eh-ea+65)/400,lamh,lama,abs(lamh-lama),lamh+lama, {'H':0,'D':1,'A':2}[r.FTR],*odds])
  outcome={'H':1,'D':.5,'A':0}[r.FTR]; exp=1/(1+10**((ea-eh-65)/400));delta=20*(outcome-exp)
  elo[h]=eh+delta;elo[a]=ea-delta
  for team,gf,gc in [(h,r.FTHG,r.FTAG),(a,r.FTAG,r.FTHG)]:
   z=goals.setdefault(team,[0,0,0]);z[0]+=gf;z[1]+=gc;z[2]+=1
f=pd.DataFrame(rows,columns=['season','elo','abselo','lh','la','abslam','total','y','oh','od','oa'])
# Fixed chronological hold-out; do not optimize candidates on hold-out.
train=f.season.isin(seasons[:3]);test=~train
X=f[['elo','abselo','lh','la','abslam','total']].to_numpy();y=f.y.to_numpy()
# regularized multinomial model with independent ex ante strength and goals; second candidate checks nonlinear closeness / total.
candidates={'strength+goals':[0,2,3], 'draw proximity + total':[0,1,2,3,4,5]}
def rps(p,y):
 o=np.eye(3)[y];return np.mean(np.sum((np.cumsum(p,axis=1)[:,:2]-np.cumsum(o,axis=1)[:,:2])**2,axis=1)/2)
def ece(p,y):
 # 10 bins per class, classwise weighted
 return sum(sum(abs((y[(p[:,k]>=b/10)&(p[:,k]<(b+1)/10)]==k).mean()-p[(p[:,k]>=b/10)&(p[:,k]<(b+1)/10),k].mean())*((p[:,k]>=b/10)&(p[:,k]<(b+1)/10)).mean() for b in range(10) if ((p[:,k]>=b/10)&(p[:,k]<(b+1)/10)).any()) for k in range(3))/3
for name,cols in candidates.items():
 xt=X[train][:,cols]; xv=X[test][:,cols];mu=xt.mean(axis=0);sd=xt.std(axis=0)+1e-8;xt=(xt-mu)/sd;xv=(xv-mu)/sd
 xt=np.c_[np.ones(len(xt)),xt];xv=np.c_[np.ones(len(xv)),xv];one=np.eye(3)[y[train]]
 def objective(flat):
  w=flat.reshape(xt.shape[1],3);pr=softmax(xt@w,axis=1);loss=-np.mean(np.log(pr[np.arange(len(pr)),y[train]]+1e-12))+.01*np.sum(w[1:]**2)
  grad=xt.T@(pr-one)/len(xt)+np.r_[np.zeros((1,3)),.02*w[1:]]
  return loss,grad.ravel()
 opt=minimize(objective,np.zeros(xt.shape[1]*3),jac=True,method='L-BFGS-B');p=softmax(xv@opt.x.reshape(xt.shape[1],3),axis=1);t=f[test].copy();t[['ph','pd','pa']]=p
 print('\nMODEL',name,'train',train.sum(),'test',test.sum(),'RPS',round(rps(p,y[test]),5),'ECE',round(ece(p,y[test]),5),'draw-frequency',round((y[test]==1).mean(),4),'draw-prob',round(p[:,1].mean(),4),'draw-argmax',round((p.argmax(axis=1)==1).mean(),4))
 for season,g in t.groupby('season',sort=False):
  gp=g[['ph','pd','pa']].to_numpy();yy=g.y.to_numpy();od=g[['oh','od','oa']].to_numpy();valid=np.isfinite(od).all(axis=1)&(od>1).all(axis=1);o=od[valid];q=(1/o);q/=q.sum(axis=1,keepdims=True)
  print(season,'n',len(g),'rps',round(rps(gp,yy),5),'draw',round((yy==1).mean(),3),'pred draw',round(gp[:,1].mean(),3),'market RPS',round(rps(q,yy[valid]),5),'odds n',len(o))
  for threshold in (.02,.05,.10):
   # value bets: odds only enter selection and payout, never features
   edge=gp[valid]-q;pick=np.argmax(edge,axis=1);sel=edge[np.arange(len(o)),pick]>=threshold;won=(yy[valid][sel]==pick[sel]);profit=np.where(won,o[np.arange(len(o))[sel],pick[sel]]-1,-1)
   print(' edge',threshold,'bets',sum(sel),'ROI',round(profit.mean(),4) if len(profit) else None)
 drawsel=valid & ((gp[:,1]-1/g.od.to_numpy())>=.05);dw=g[drawsel];dp=np.where(dw.y.to_numpy()==1,dw.od.to_numpy()-1,-1);print(' draw-only 5pp',len(dp),'ROI',round(dp.mean(),4) if len(dp) else None)
 # draw-only hypothesis: explicitly isolate without cherry-picked threshold
 valid=np.isfinite(t.od.to_numpy())&(t.od.to_numpy()>1);d=t[valid];edge=d.pd.to_numpy()-1/d.od.to_numpy();sel=edge>=.05;win=(d.y.to_numpy()[sel]==1);profit=np.where(win,d.od.to_numpy()[sel]-1,-1);print(' draw-only edge 5pp',len(profit),'ROI',round(profit.mean(),4) if len(profit) else None)
