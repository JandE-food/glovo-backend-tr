import { BellRing, Globe2, LayoutDashboard, LogOut, Package2, Settings, WalletCards } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

import { useMerchantStore } from '../store/useMerchantStore';
import { useMerchantI18n } from '../utils/i18n';

export const AppShell = () => {
  const merchantEmail = useMerchantStore((state) => state.merchantEmail);
  const logout = useMerchantStore((state) => state.cikisYap);
  const { language, t } = useMerchantI18n();

  const navItems = [
    { to: '/dashboard', label: t.nav.liveOrders, icon: LayoutDashboard },
    { to: '/inventory', label: t.nav.menuManagement, icon: Package2 },
    { to: '/financials', label: t.nav.dailySales, icon: WalletCards },
    { to: '/notifications', label: t.nav.notifications, icon: BellRing },
    { to: '/settings', label: t.nav.settings, icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-page px-4 py-4 font-body text-ink md:px-6 md:py-6">
      <div className="mx-auto max-w-[1500px] rounded-[40px] bg-shell p-3 shadow-shell">
        <div className="grid min-h-[calc(100vh-3rem)] gap-3 xl:grid-cols-[300px_1fr]">
          <aside className="rounded-[32px] bg-shell text-white">
            <div className="rounded-[28px] bg-accent px-6 pb-6 pt-10">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80">Cabuk</p>
              <h1 className="mt-3 text-4xl font-extrabold leading-tight text-white">
                {t.shell.title}
              </h1>
              <p className="mt-4 max-w-xs text-sm leading-6 text-white/85">
                {t.shell.description}
              </p>
            </div>

            <div className="px-3 pb-3">
              <div className="-mt-3 rounded-[28px] bg-shell p-3">
                <div className="rounded-[24px] bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/45">{t.shell.session}</p>
                  <p className="mt-3 text-sm font-medium text-white">
                    {merchantEmail || 'merchant@cabuk.tr'}
                  </p>
                </div>

                <div className="mt-3 rounded-[24px] bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/45">{t.settings.wholeDashboard}</p>
                  <div className="mt-3 flex items-center gap-3 text-sm font-medium text-white">
                    <Globe2 className="h-4 w-4 text-white/70" />
                    {language === 'en' ? t.settings.english : language === 'sr' ? t.settings.serbian : t.settings.albanian}
                  </div>
                </div>

                <nav className="mt-3 space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-semibold transition ${
                            isActive
                              ? 'bg-white text-ink shadow-soft'
                              : 'bg-white/5 text-white/72 hover:bg-white/10 hover:text-white'
                          }`
                        }
                      >
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                            item.to === '/dashboard'
                              ? 'bg-[#FFE3DB] text-accent'
                              : item.to === '/inventory'
                                ? 'bg-[#FFF0D8] text-[#D97706]'
                                : 'bg-[#E8F7EF] text-success'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        {item.label}
                      </NavLink>
                    );
                  })}
                </nav>

                <button
                  type="button"
                  onClick={logout}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-[20px] bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  <LogOut className="h-4 w-4" />
                  {t.shell.signOut}
                </button>
              </div>
            </div>
          </aside>

          <main className="rounded-[32px] bg-page p-4 md:p-6">
            <div className="rounded-[28px] bg-surface px-5 py-4 shadow-soft md:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                    {t.shell.hubTitle}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {t.shell.hubDescription}
                  </p>
                </div>
                <div className="rounded-full bg-surfaceSoft px-4 py-2 text-sm font-semibold text-accent">
                  {t.shell.liveConnectionReady}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
