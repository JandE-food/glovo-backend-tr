import { BellRing, Clock3, Flame } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { OrderCard } from '../components/OrderCard';
import { StatCard } from '../components/StatCard';
import {
  magazaSoketiniBaslat,
  siparisleriGetir,
  siparisDurumuGuncelle as siparisDurumuIstegi
} from '../services/api';
import { useMerchantStore } from '../store/useMerchantStore';
import type { SiparisDurumu } from '../types';
import { useMerchantI18n } from '../utils/i18n';
import { formatLira } from '../utils/merchant';

export const Dashboard = () => {
  const { language, t } = useMerchantI18n();
  const orders = useMerchantStore((state) => state.orders);
  const setOrders = useMerchantStore((state) => state.setOrders);
  const pushOrder = useMerchantStore((state) => state.yeniSiparisEkle);
  const updateStatus = useMerchantStore((state) => state.siparisDurumuGuncelle);
  const addNotification = useMerchantStore((state) => state.addNotification);
  const notifications = useMerchantStore((state) => state.notifications);
  const yeniSiparisler = orders.filter((order) => order.durum === 'received').length;
  const hazirlikta = orders.filter((order) => order.durum === 'preparing').length;
  const hazir = orders.filter((order) => order.durum === 'ready').length;

  useEffect(() => {
    void siparisleriGetir().then(setOrders);
  }, [setOrders]);

  useEffect(() => {
    const temizle = magazaSoketiniBaslat(
      (order) => {
        pushOrder(order);
        addNotification({
          id: `new-${order.id}`,
          title: 'New order received',
          message: `${order.musteriAdi} placed a new order worth ${formatLira(order.total, language)}.`,
          createdAt: order.olusturmaSaati,
          read: false
        });
      },
      (order) => {
        updateStatus(order.id, order.durum);
        addNotification({
          id: `status-${order.id}-${order.durum}`,
          title: 'Order status updated',
          message: `${order.musteriAdi}'s order moved to ${order.durum}.`,
          createdAt: order.olusturmaSaati,
          read: false
        });
      }
    );
    return temizle;
  }, [addNotification, language, pushOrder, updateStatus]);

  const handleUpdate = async (orderId: string, _userId: string, durum: SiparisDurumu) => {
    updateStatus(orderId, durum);
    await siparisDurumuIstegi(orderId, durum);
  };

  return (
    <section>
      <div className="rounded-[32px] bg-[#1A1A1A] px-6 pb-6 pt-10 text-white shadow-shell">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white/70">Cabuk Merchant Hub</p>
            <h2 className="mt-2 text-4xl font-extrabold">{t.dashboard.title}</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">{t.dashboard.description}</p>
          </div>
          <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">
            {t.dashboard.acceptingOrders}
          </div>
          <Link
            to="/notifications"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink"
          >
            Notifications ({notifications.filter((notification) => !notification.read).length})
          </Link>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">{t.dashboard.dailyRevenue}</p>
            <p className="mt-2 text-2xl font-extrabold">{formatLira(3240, language)}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">{t.dashboard.activeOrders}</p>
            <p className="mt-2 text-2xl font-extrabold">{orders.length}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">{t.dashboard.averagePrep}</p>
            <p className="mt-2 text-2xl font-extrabold">{t.dashboard.averagePrepValue}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-white/10 p-1 text-sm">
          <div className="rounded-xl bg-white px-4 py-3 text-center font-semibold text-ink">
            {t.dashboard.new}
            <div className="text-base font-extrabold">{yeniSiparisler}</div>
          </div>
          <div className="rounded-xl px-4 py-3 text-center font-semibold text-white/70">
            {t.dashboard.prep}
            <div className="text-base font-extrabold text-white">{hazirlikta}</div>
          </div>
          <div className="rounded-xl px-4 py-3 text-center font-semibold text-white/70">
            {t.dashboard.ready}
            <div className="text-base font-extrabold text-white">{hazir}</div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard
          title={t.dashboard.liveOrders}
          value={String(orders.length)}
          hint={t.dashboard.liveOrdersHint}
          icon={<BellRing className="h-5 w-5" />}
        />
        <StatCard
          title={t.dashboard.inPrep}
          value={String(orders.filter((order) => order.durum === 'preparing').length)}
          hint={t.dashboard.inPrepHint}
          icon={<Flame className="h-5 w-5" />}
        />
        <StatCard
          title={t.dashboard.firstResponse}
          value={t.dashboard.firstResponseValue}
          hint={t.dashboard.firstResponseHint}
          icon={<Clock3 className="h-5 w-5" />}
        />
      </div>

      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} onUpdate={handleUpdate} />
        ))}
      </div>
    </section>
  );
};
