import { Languages } from 'lucide-react';

import { useMerchantStore } from '../store/useMerchantStore';
import { type AppLanguage, useMerchantI18n } from '../utils/i18n';

const languageOptions: AppLanguage[] = ['en', 'sq', 'sr'];

export const Settings = () => {
  const { language, t } = useMerchantI18n();
  const setLanguage = useMerchantStore((state) => state.setLanguage);
  const languageLabel =
    language === 'en'
      ? t.settings.english
      : language === 'sr'
        ? t.settings.serbian
        : t.settings.albanian;

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{t.nav.settings}</p>
          <h2 className="mt-3 text-5xl font-extrabold text-ink">{t.settings.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{t.settings.description}</p>
        </div>
        <div className="rounded-full bg-[#1A1A1A] px-4 py-2 text-sm font-semibold text-white">
          {t.settings.currentLanguage}: {languageLabel}
        </div>
      </div>

      <div className="mt-6 rounded-[28px] border border-[#F3D1C8] bg-surface p-6 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accentSoft text-accent">
            <Languages className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              {t.settings.languageTitle}
            </p>
            <h3 className="mt-2 text-3xl font-extrabold text-ink">{t.settings.wholeDashboard}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              {t.settings.languageDescription}
            </p>
          </div>
        </div>

        <div className="mt-6 max-w-xl">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            {t.settings.languageTitle}
          </label>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value as AppLanguage)}
            className="mt-3 w-full rounded-[20px] border border-[#F3D1C8] bg-white px-4 py-4 text-sm font-semibold text-ink shadow-soft focus:outline-none"
          >
            {languageOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'en'
                  ? t.settings.english
                  : option === 'sr'
                    ? t.settings.serbian
                    : t.settings.albanian}
              </option>
            ))}
          </select>
          <p className="mt-3 text-sm leading-6 text-muted">
            {language === 'en'
              ? t.settings.englishDescription
              : language === 'sr'
                ? t.settings.serbianDescription
                : t.settings.albanianDescription}
          </p>
        </div>
      </div>
    </section>
  );
};
