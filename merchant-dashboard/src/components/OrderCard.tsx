import { Bike, CheckCheck, PackageCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { MerchantOrder, SiparisDurumu } from '../types';
import { formatLira, siparisDurumuRenkleri } from '../utils/merchant';
import { translateCatalogValue, useMerchantI18n } from '../utils/i18n';

type OrderCardProps = {
  order: MerchantOrder;
  onUpdate: (orderId: string, userId: string, durum: SiparisDurumu) => void;
};

export const OrderCard = ({ order, onUpdate }: OrderCardProps) => {
  const { language, t } = useMerchantI18n();
  const [clock, setClock] = useState(() => Date.now());
  const renk = siparisDurumuRenkleri[order.durum];
  const stageAccent =
    order.durum === 'received'
      ? {
          rail: 'bg-[#FF7B5A]',
          badge: 'bg-[#FFF0EA] text-[#D9481B]',
          cardBorder: 'border-[#FFD4C7]',
          button: 'bg-[#FFF1EC] text-[#D9481B] border-[#FFD8CC]'
        }
      : order.durum === 'preparing'
        ? {
            rail: 'bg-[#3B82F6]',
            badge: 'bg-[#EEF5FF] text-[#2563EB]',
            cardBorder: 'border-[#D7E6FF]',
            button: 'bg-[#EDF4FF] text-[#2D5BDB] border-[#D7E6FF]'
          }
        : {
            rail: 'bg-[#22C55E]',
            badge: 'bg-[#ECFDF3] text-[#15803D]',
            cardBorder: 'border-[#CFF3DB]',
            button: 'bg-[#ECFDF3] text-[#15803D] border-[#CFF3DB]'
          };

  useEffect(() => {
    const intervalId = window.setInterval(() => setClock(Date.now()), 60000);
    return () => window.clearInterval(intervalId);
  }, []);

  const getElapsedLabel = () => {
    if (!order.createdAt) {
      return order.olusturmaSaati;
    }

    const createdAt = new Date(order.createdAt).getTime();
    if (Number.isNaN(createdAt)) {
      return order.olusturmaSaati;
    }

    const elapsedMinutes = Math.max(1, Math.round((clock - createdAt) / 60000));
    return `${elapsedMinutes} min ago`;
  };

  const durumButonlari =
    order.durum === 'received'
      ? [{ etiket: t.actions.accept, sonrakiDurum: 'preparing' as const, Icon: CheckCheck }]
      : order.durum === 'preparing'
        ? [{ etiket: t.actions.ready, sonrakiDurum: 'ready' as const, Icon: PackageCheck }]
        : [];
  const siparisDurumuEtiketleri: Record<SiparisDurumu, string> = {
    received: t.statuses.orderReceived,
    preparing: t.statuses.preparing,
    ready: t.statuses.ready,
    approaching: t.statuses.approaching,
    at_door: t.statuses.atTheDoor
  };
  const courierStatusLabel =
    order.durum === 'approaching'
      ? 'Driver on the way'
      : order.durum === 'ready'
        ? 'Ready for pickup'
        : order.assignedDriverName
          ? 'Courier assigned'
          : '';

  return (
    <article
      className={`relative overflow-hidden rounded-[28px] border bg-white p-5 shadow-soft ${stageAccent.cardBorder}`}
    >
      <div className={`absolute inset-y-5 left-0 w-1 rounded-full ${stageAccent.rail}`} />

      <div className="ml-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xl font-extrabold tracking-[-0.02em] text-ink">{order.id}</p>
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${stageAccent.badge}`}>
              {siparisDurumuEtiketleri[order.durum]}
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-muted">{order.musteriAdi}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#F6F8FB] px-3 py-1 text-xs font-semibold text-[#537089]">
            {getElapsedLabel()}
          </span>
          <span className={`h-2.5 w-2.5 rounded-full ${renk.zemin.replace('bg-', 'bg-')}`} />
        </div>
      </div>

      <div className="ml-3 mt-5 space-y-4">
        <div className="rounded-[22px] border border-[#EEF2F7] bg-[#FCFDFE] p-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">{t.orderCard.items}</p>
            <p className="text-sm font-extrabold text-ink">{formatLira(order.total, language)}</p>
          </div>
          <ul className="mt-3 space-y-3 text-sm text-ink">
            {order.items.map((item) => (
              <li
                key={`${order.id}-${item.ad}`}
                className="flex items-center justify-between gap-4 border-b border-[#F1F5F9] pb-3 last:border-b-0 last:pb-0"
              >
                <span>
                  {translateCatalogValue(item.ad, language)} <span className="text-muted">x{item.adet}</span>
                </span>
                <span className="font-semibold text-[#506070]">{formatLira(item.fiyat * item.adet, language)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[22px] border border-[#EEF2F7] bg-[#FCFDFE] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">{t.orderCard.address}</p>
          <p className="mt-3 text-sm leading-6 text-ink">{order.adres}</p>
        </div>
      </div>

      {order.assignedDriverName ? (
        <div className="ml-3 mt-5 flex items-center justify-between gap-4 rounded-[22px] border border-[#DCF3E4] bg-[#F3FBF6] p-4">
          <div className="flex items-center gap-3">
            {order.assignedDriverAvatar ? (
              <img
                src={order.assignedDriverAvatar}
                alt={order.assignedDriverName}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#DCFCE7] text-sm font-extrabold text-[#15803D]">
                {order.assignedDriverName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Courier Assigned</p>
              <p className="mt-1 text-base font-extrabold text-ink">{order.assignedDriverName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-[#15803D] shadow-sm">
            <Bike className="h-4 w-4 text-[#16A34A]" />
            {courierStatusLabel}
          </div>
        </div>
      ) : null}

      {durumButonlari.length > 0 ? (
        <div className="ml-3 mt-5 grid gap-3">
          {durumButonlari.map((aksiyon) => {
            const Icon = aksiyon.Icon;

            return (
              <button
                key={aksiyon.etiket}
                type="button"
                onClick={() => onUpdate(order.id, order.userId, aksiyon.sonrakiDurum)}
                className={`flex items-center justify-center gap-2 rounded-[18px] border px-4 py-3 text-sm font-semibold transition hover:brightness-[0.98] ${stageAccent.button}`}
              >
                <Icon className="h-4 w-4" />
                {aksiyon.etiket}
              </button>
            );
          })}
        </div>
      ) : null}
    </article>
  );
};
