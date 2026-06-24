import { CheckCheck, CookingPot, PackageCheck } from 'lucide-react';

import type { MerchantOrder, SiparisDurumu } from '../types';
import { formatLira, siparisDurumuRenkleri } from '../utils/merchant';
import { translateCatalogValue, useMerchantI18n } from '../utils/i18n';

type OrderCardProps = {
  order: MerchantOrder;
  onUpdate: (orderId: string, userId: string, durum: SiparisDurumu) => void;
};

export const OrderCard = ({ order, onUpdate }: OrderCardProps) => {
  const { language, t } = useMerchantI18n();
  const renk = siparisDurumuRenkleri[order.durum];
  const ikonlar = [CheckCheck, CookingPot, PackageCheck];
  const durumButonlari = [
    { etiket: t.actions.accept, sonrakiDurum: 'received' as const },
    { etiket: t.actions.startPrep, sonrakiDurum: 'preparing' as const },
    { etiket: t.actions.ready, sonrakiDurum: 'ready' as const }
  ];
  const siparisDurumuEtiketleri: Record<SiparisDurumu, string> = {
    received: t.statuses.orderReceived,
    preparing: t.statuses.preparing,
    ready: t.statuses.ready,
    approaching: t.statuses.approaching,
    at_door: t.statuses.atTheDoor
  };

  return (
    <article className="rounded-[24px] border border-[#FFC3B8] bg-surface p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{order.id}</p>
          <h3 className="mt-2 text-2xl font-extrabold text-ink">{order.musteriAdi}</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#FFF0ED] px-3 py-1 text-xs font-semibold text-accent">
            {order.olusturmaSaati}
          </span>
          <span className={`rounded-full px-4 py-2 text-sm font-semibold ${renk.zemin} ${renk.metin}`}>
            {siparisDurumuEtiketleri[order.durum]}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_1fr_auto]">
        <div className="rounded-2xl bg-[#F9FAFB] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{t.orderCard.items}</p>
          <ul className="mt-3 space-y-3 text-sm text-ink">
            {order.items.map((item) => (
              <li key={`${order.id}-${item.ad}`} className="flex items-center justify-between gap-4">
                <span>
                  {translateCatalogValue(item.ad, language)} <span className="text-muted">x{item.adet}</span>
                </span>
                <span className="font-semibold text-accent">{formatLira(item.fiyat * item.adet, language)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-[#F9FAFB] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{t.orderCard.address}</p>
          <p className="mt-3 text-sm leading-6 text-ink">{order.adres}</p>
        </div>

        <div className="rounded-2xl bg-[#1A1A1A] px-5 py-4 text-right text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">{t.orderCard.total}</p>
          <p className="mt-3 text-3xl font-extrabold">{formatLira(order.total, language)}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {durumButonlari.map((aksiyon, index) => {
          const Icon = ikonlar[index];

          return (
            <button
              key={aksiyon.etiket}
              type="button"
              onClick={() => onUpdate(order.id, order.userId, aksiyon.sonrakiDurum)}
              className="flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <Icon className="h-4 w-4" />
              {aksiyon.etiket}
            </button>
          );
        })}
      </div>
    </article>
  );
};
