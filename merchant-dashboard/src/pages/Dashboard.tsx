import { ArrowRight, BellDot, BellRing, Clock3, Flame, PackageCheck, PackageSearch, Search, Store } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
  const updateOrder = useMerchantStore((state) => state.updateOrder);
  const updateStatus = useMerchantStore((state) => state.siparisDurumuGuncelle);
  const addNotification = useMerchantStore((state) => state.addNotification);
  const notifications = useMerchantStore((state) => state.notifications);
  const merchantRestaurantId = useMerchantStore((state) => state.merchantRestaurantId);
  const merchantRestaurantName = useMerchantStore((state) => state.merchantRestaurantName);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const matchesOrderSearch = (order: (typeof orders)[number]) => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase('en-US');
    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      order.id,
      order.musteriAdi,
      order.adres,
      order.assignedDriverName ?? '',
      ...order.items.map((item) => item.ad)
    ]
      .join(' ')
      .toLocaleLowerCase('en-US');

    return haystack.includes(normalizedQuery);
  };

  const matchesAssignmentFilter = (order: (typeof orders)[number]) => {
    if (assignmentFilter === 'assigned') {
      return Boolean(order.assignedDriverName);
    }

    if (assignmentFilter === 'unassigned') {
      return !order.assignedDriverName;
    }

    return true;
  };

  const filteredOrders = useMemo(
    () => orders.filter((order) => matchesOrderSearch(order) && matchesAssignmentFilter(order)),
    [orders, searchQuery, assignmentFilter]
  );
  const yeniBolum = filteredOrders.filter((order) => order.durum === 'received');
  const prepBolum = filteredOrders.filter((order) => order.durum === 'preparing');
  const readyBolum = filteredOrders.filter((order) => order.durum === 'ready' || order.durum === 'approaching');

  useEffect(() => {
    void siparisleriGetir(merchantRestaurantId).then(setOrders);
  }, [merchantRestaurantId, setOrders]);

  useEffect(() => {
    if (!merchantRestaurantId) {
      return undefined;
    }

    const temizle = magazaSoketiniBaslat(
      merchantRestaurantId,
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
        updateOrder(order);
        addNotification({
          id: `status-${order.id}-${order.durum}`,
          title: 'Order status updated',
          message:
            order.durum === 'approaching' && order.assignedDriverName
              ? `${order.assignedDriverName} is on the way for ${order.musteriAdi}.`
              : order.durum === 'ready'
                ? `${order.musteriAdi}'s order is ready for pickup.`
                : `${order.musteriAdi}'s order moved to ${order.durum}.`,
          createdAt: order.olusturmaSaati,
          read: false
        });
      }
    );
    return temizle;
  }, [addNotification, language, merchantRestaurantId, pushOrder, updateOrder]);

  const handleUpdate = async (orderId: string, _userId: string, durum: SiparisDurumu) => {
    updateStatus(orderId, durum);
    const updatedOrder = await siparisDurumuIstegi(orderId, durum);
    if (updatedOrder) {
      updateOrder(updatedOrder);
    }
  };

  const columns = [
    {
      key: 'new',
      title: 'New',
      count: yeniBolum.length,
      hint: 'New orders waiting for confirmation',
      badge: 'Accepting Orders',
      badgeClass: 'bg-[#FFF0EA] text-[#D9481B]',
      panelClass: 'border-[#FFD8CC] bg-[#FFF7F3]',
      iconWrapClass: 'bg-[#FFF0EA] text-[#D9481B]',
      Icon: PackageSearch,
      orders: yeniBolum
    },
    {
      key: 'prep',
      title: 'Prep',
      count: prepBolum.length,
      hint: 'Blue action cards keep prep work moving',
      badge: 'Mark Ready For Pickup',
      badgeClass: 'bg-[#EAF3FF] text-[#2D5BDB]',
      panelClass: 'border-[#D7E6FF] bg-[#F7FAFF]',
      iconWrapClass: 'bg-[#EAF3FF] text-[#2D5BDB]',
      Icon: Flame,
      orders: prepBolum
    },
    {
      key: 'ready',
      title: 'Ready',
      count: readyBolum.length,
      hint: 'Assigned courier stays visible on each card',
      badge: 'Courier Assigned',
      badgeClass: 'bg-[#ECFDF3] text-[#15803D]',
      panelClass: 'border-[#D9F5E4] bg-[#F6FDF9]',
      iconWrapClass: 'bg-[#ECFDF3] text-[#15803D]',
      Icon: PackageCheck,
      orders: readyBolum
    }
  ] as const;

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_360px]">
        <div className="rounded-[34px] bg-[#191A1F] px-6 pb-6 pt-8 text-white shadow-shell">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#FF6B4A] text-white shadow-lg shadow-[#FF6B4A]/25">
                <Store className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{merchantRestaurantName}</p>
                <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.03em]">{t.dashboard.title}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">{t.dashboard.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                {t.dashboard.acceptingOrders}
              </div>
              <Link
                to="/notifications"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/15"
              >
                <span className="relative">
                  <BellDot className="h-5 w-5" />
                  <span className="absolute -right-2 -top-2 flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[#FF6B4A] px-1 text-[10px] font-extrabold text-white">
                    {notifications.filter((notification) => !notification.read).length}
                  </span>
                </span>
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-[22px] bg-white/10 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">{t.dashboard.dailyRevenue}</p>
              <p className="mt-3 text-2xl font-extrabold">{formatLira(3240, language)}</p>
            </div>
            <div className="rounded-[22px] bg-white/10 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">{t.dashboard.activeOrders}</p>
              <p className="mt-3 text-2xl font-extrabold">{orders.length}</p>
            </div>
            <div className="rounded-[22px] bg-white/10 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">{t.dashboard.averagePrep}</p>
              <p className="mt-3 text-2xl font-extrabold">{t.dashboard.averagePrepValue}</p>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] bg-white/8 p-2">
            <div className="grid grid-cols-3 gap-2 text-sm">
              {columns.map((column, index) => (
                <div
                  key={column.key}
                  className={`rounded-[18px] px-4 py-3 text-center font-semibold ${
                    index === 0 ? 'bg-white text-ink' : 'text-white/72'
                  }`}
                >
                  {column.title}
                  <div className={`mt-1 text-base font-extrabold ${index === 0 ? 'text-ink' : 'text-white'}`}>
                    {column.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="rounded-[34px] border border-[#EAE7E1] bg-white/85 p-6 shadow-soft backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Operations Summary</p>
          <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.03em] text-ink">Today at a glance</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Keep the kitchen, pickup queue, and courier handoff visible from one website dashboard.
          </p>

          <div className="mt-6 space-y-4">
            {columns.map((column) => (
              <div key={column.key} className={`rounded-[24px] border p-4 ${column.panelClass}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">{column.title}</p>
                    <p className="mt-2 text-3xl font-extrabold text-ink">{column.count}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${column.badgeClass}`}>
                    {column.badge}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">{column.hint}</p>
              </div>
            ))}
          </div>

          <Link
            to="/notifications"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:opacity-80"
          >
            Open notifications
            <ArrowRight className="h-4 w-4" />
          </Link>
        </aside>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <StatCard
            title={t.dashboard.liveOrders}
            value={String(orders.length)}
            hint={t.dashboard.liveOrdersHint}
            icon={<BellRing className="h-5 w-5" />}
          />
        </div>
        <div className="lg:col-span-1">
          <StatCard
            title={t.dashboard.inPrep}
            value={String(orders.filter((order) => order.durum === 'preparing').length)}
            hint={t.dashboard.inPrepHint}
            icon={<Flame className="h-5 w-5" />}
          />
        </div>
        <div className="lg:col-span-1">
          <StatCard
            title={t.dashboard.firstResponse}
            value={t.dashboard.firstResponseValue}
            hint={t.dashboard.firstResponseHint}
            icon={<Clock3 className="h-5 w-5" />}
          />
        </div>
        <div className="lg:col-span-1">
          <StatCard
            title="Unread Alerts"
            value={String(notifications.filter((notification) => !notification.read).length)}
            hint="Keep the merchant workflow responsive throughout the day."
            icon={<BellDot className="h-5 w-5" />}
          />
        </div>
      </div>

      <div className="rounded-[34px] border border-[#EAE7E1] bg-white/85 p-5 shadow-soft backdrop-blur md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Order Pipeline</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.03em] text-ink">Website workflow board</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Review incoming orders, move them into prep, and track ready pickups with courier visibility.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {columns.map((column) => (
              <div
                key={column.key}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${column.badgeClass}`}
              >
                {column.title}: {column.count}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 border-t border-[#EAE7E1] pt-6 xl:grid-cols-[minmax(0,1fr)_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by order ID, customer, item, address, or courier"
              className="w-full rounded-[18px] border border-[#E5E7EB] bg-white px-11 py-3 text-sm text-ink outline-none transition focus:border-accent"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All orders' },
              { value: 'assigned', label: 'Courier assigned' },
              { value: 'unassigned', label: 'Needs courier' }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setAssignmentFilter(option.value as typeof assignmentFilter)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  assignmentFilter === option.value
                    ? 'bg-[#191A1F] text-white'
                    : 'border border-[#E5E7EB] bg-white text-ink hover:bg-[#F8FAFC]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          {columns.map((column) => {
            const Icon = column.Icon;

            return (
              <section
                key={column.key}
                className={`rounded-[30px] border p-4 shadow-soft ${column.panelClass}`}
              >
                <div className="rounded-[24px] bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${column.iconWrapClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                          {column.title}
                        </p>
                        <h3 className="mt-1 text-2xl font-extrabold text-ink">{column.count}</h3>
                        <p className="mt-1 text-sm text-muted">{column.hint}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${column.badgeClass}`}>
                      {column.badge}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  {column.orders.length > 0 ? (
                    column.orders.map((order) => (
                      <OrderCard key={order.id} order={order} onUpdate={handleUpdate} />
                    ))
                  ) : (
                    <div className="rounded-[24px] border border-dashed border-[#D9E2EC] bg-white/80 px-5 py-10 text-center">
                      <p className="text-sm font-semibold text-ink">No {column.title.toLowerCase()} orders yet</p>
                      <p className="mt-2 text-sm text-muted">
                        Incoming activity will appear here in the main website order board.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
};
