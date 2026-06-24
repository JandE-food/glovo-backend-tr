import { describe, expect, it } from 'vitest';

import { hesaplaFinansalOzet } from './merchant';

describe('hesaplaFinansalOzet', () => {
  it('calculates daily revenue, order count, and net earnings with a 10 percent commission', () => {
    const sonuc = hesaplaFinansalOzet([
      {
        id: '1',
        userId: 'u1',
        musteriAdi: 'Jessica',
        items: [{ ad: 'Pide', adet: 1, fiyat: 45 }],
        adres: 'Brooklyn',
        total: 45,
        durum: 'received',
        olusturmaSaati: '12:05'
      },
      {
        id: '2',
        userId: 'u2',
        musteriAdi: 'Sarah',
        items: [{ ad: 'Kunefe', adet: 1, fiyat: 60 }],
        adres: 'Queens',
        total: 60,
        durum: 'preparing',
        olusturmaSaati: '12:07'
      }
    ]);

    expect(sonuc.gunlukCiro).toBe(105);
    expect(sonuc.siparisSayisi).toBe(2);
    expect(sonuc.netKazanc).toBe(94.5);
    expect(sonuc.komisyonOrani).toBe(0.1);
  });
});
