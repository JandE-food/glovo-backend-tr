import { BellRing } from 'lucide-react';

import { useMerchantStore } from '../store/useMerchantStore';

export const Notifications = () => {
  const notifications = useMerchantStore((state) => state.notifications);
  const markAllNotificationsRead = useMerchantStore((state) => state.markAllNotificationsRead);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Notifications</p>
          <h2 className="mt-3 text-5xl font-extrabold text-ink">Order Activity</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Incoming orders and status changes from the merchant workflow appear here.
          </p>
        </div>
        <button
          type="button"
          onClick={markAllNotificationsRead}
          className="rounded-full bg-[#1A1A1A] px-4 py-2 text-sm font-semibold text-white"
        >
          Mark all as read
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {notifications.length === 0 ? (
          <div className="rounded-[28px] border border-[#F3D1C8] bg-surface p-8 text-sm text-muted shadow-soft">
            No notifications yet.
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-[28px] border p-6 shadow-soft ${
                notification.read ? 'border-[#F3D1C8] bg-surface' : 'border-[#FFC3B8] bg-[#FFF0ED]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accentSoft text-accent">
                  <BellRing className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-lg font-bold text-ink">{notification.title}</p>
                    <span className="text-sm font-medium text-muted">{notification.createdAt}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">{notification.message}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
