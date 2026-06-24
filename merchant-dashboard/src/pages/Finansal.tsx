import { BadgePercent, Banknote, ReceiptText } from 'lucide-react';

import { StatCard } from '../components/StatCard';
import { useFinansalOzet, useMerchantStore } from '../store/useMerchantStore';
import { formatLira } from '../utils/merchant';
import { useMerchantI18n } from '../utils/i18n';

export const Finansal = () => {
  const { language, t } = useMerchantI18n();
  const summary = useFinansalOzet();
  const orders = useMerchantStore((state) => state.orders);
  const statusLabels = {
    received: t.statuses.orderReceived,
    preparing: t.statuses.preparing,
    ready: t.statuses.ready,
    approaching: t.statuses.approaching,
    at_door: t.statuses.atTheDoor
  };

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{t.financials.section}</p>
          <h2 className="mt-3 text-5xl font-extrabold text-ink">{t.financials.title}</h2>
        </div>
        <div className="rounded-full bg-[#E8F7EF] px-4 py-2 text-sm font-semibold text-success">
          {t.financials.summaryBadge}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard
          title={t.financials.dailyRevenue}
          value={formatLira(summary.gunlukCiro, language)}
          hint={t.financials.dailyRevenueHint}
          icon={<Banknote className="h-5 w-5" />}
        />
        <StatCard
          title={t.financials.orderCount}
          value={String(summary.siparisSayisi)}
          hint={t.financials.orderCountHint}
          icon={<ReceiptText className="h-5 w-5" />}
        />
        <StatCard
          title={t.financials.netEarnings}
          value={formatLira(summary.netKazanc, language)}
          hint={t.financials.netEarningsHint}
          icon={<BadgePercent className="h-5 w-5" />}
        />
      </div>

      <div className="mt-6 rounded-[28px] border border-[#F3D1C8] bg-surface p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{t.financials.dailySummary}</p>
            <h3 className="mt-3 text-4xl font-extrabold text-ink">{t.financials.performanceOverview}</h3>
          </div>
          <div className="rounded-2xl bg-[#F9FAFB] px-4 py-3 text-sm font-semibold text-muted">
            {t.financials.commissionRate}: %{summary.komisyonOrani * 100}
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-3xl bg-[#F9FAFB] p-5">
            <p className="text-sm text-muted">
              {t.financials.formula}: <span className="font-semibold text-ink">{t.financials.dailyRevenue} x 0.90</span>
            </p>
            <div className="mt-5 space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-2xl border border-[#F3D1C8] bg-surface px-4 py-4"
                >
                  <div>
                    <p className="font-semibold text-ink">{order.musteriAdi}</p>
                    <p className="mt-1 text-sm text-muted">{statusLabels[order.durum]}</p>
                  </div>
                  <p className="font-semibold text-accent">{formatLira(order.total, language)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-[#1A1A1A] p-6 text-white">
            <p className="text-xs uppercase tracking-[0.24em] text-white/60">{t.financials.todayNet}</p>
            <h4 className="mt-3 text-5xl font-extrabold">{formatLira(summary.netKazanc, language)}</h4>
            <p className="mt-4 text-sm leading-7">
              {t.financials.note}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
