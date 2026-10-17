import { describe, expect, it } from 'vitest';
import { ELO } from './model-spec';

describe('公開 v12 原設計參數', () => {
  it('按馬／騎師／練馬師採用 28／18／11', () => {
    expect(ELO.k).toEqual({ horse: 28, jockey: 18, trainer: 11 });
  });
  it('時間衰減常數為 548／730／1095 日', () => {
    expect(ELO.tau).toEqual({ horse: 548, jockey: 730, trainer: 1095 });
  });
  it('少於六仗的變動乘 1.5', () => {
    expect(ELO.provisionalGames).toBe(6);
    expect(ELO.provisionalMultiplier).toBe(1.5);
  });
});