import type { FinancialSummary, MerchantOrder, SiparisDurumu } from '../types';

export const siparisDurumuRenkleri: Record<
  SiparisDurumu,
  { zemin: string; metin: string }
> = {
  received: { zemin: 'bg-[#FFF0ED]', metin: 'text-[#E64527]' },
  preparing: { zemin: 'bg-[#FFF0D8]', metin: 'text-[#D97706]' },
  ready: { zemin: 'bg-[#E8F7EF]', metin: 'text-[#1F9D55]' },
  approaching: { zemin: 'bg-[#E8F7EF]', metin: 'text-[#1F9D55]' },
  at_door: { zemin: 'bg-[#E8F7EF]', metin: 'text-[#1F9D55]' }
};

export const hesaplaFinansalOzet = (orders: MerchantOrder[]): FinancialSummary => {
  const gunlukCiro = orders.reduce((toplam, siparis) => toplam + siparis.total, 0);
  const komisyonOrani = 0.1;

  return {
    gunlukCiro,
    siparisSayisi: orders.length,
    netKazanc: Number((gunlukCiro * (1 - komisyonOrani)).toFixed(2)),
    komisyonOrani
  };
};

export const formatLira = (tutar: number, language: 'en' | 'sq' = 'en') =>
  new Intl.NumberFormat(language === 'sq' ? 'sq-AL' : 'en-US', {
    style: 'currency',
    currency: 'ALL',
    maximumFractionDigits: 0
  }).format(tutar);
