import { KeyRound, Mail } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { girisYap as girisIste } from '../services/api';
import { useMerchantStore } from '../store/useMerchantStore';
import { useMerchantI18n } from '../utils/i18n';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setLogin = useMerchantStore((state) => state.girisYap);
  const setLanguage = useMerchantStore((state) => state.setLanguage);
  const { t } = useMerchantI18n();
  const language = useMerchantStore((state) => state.language);
  const [email, setEmail] = useState('merchant@cabuk.al');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const state = location.state as { email?: string } | null;
    if (state?.email) {
      setEmail(state.email);
    }
  }, [location.state]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await girisIste(email, password);
      setLogin(email);
      navigate('/dashboard');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t.login.loginFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-page px-4 py-6 text-ink md:px-6">
      <div className="mx-auto max-w-6xl rounded-[40px] bg-shell p-3 shadow-shell">
        <div className="grid min-h-[calc(100vh-3rem)] items-center gap-3 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[32px] bg-shell px-6 pb-8 pt-10 text-white md:px-8">
            <div className="rounded-[28px] bg-accent px-6 py-8">
              <div className="flex items-start justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/75">
                {t.login.brandTitle}
              </p>
                <button
                  type="button"
                  onClick={() => setLanguage(language === 'en' ? 'sq' : 'en')}
                  className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-white/25"
                  aria-label={t.settings.languageTitle}
                >
                  {language === 'en' ? 'SQ' : 'EN'}
                </button>
              </div>
              <h1 className="mt-4 text-5xl font-extrabold leading-none">{t.login.title}</h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-white/85">{t.login.description}</p>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {[
                [t.login.liveOperations, t.login.incomingOrderFlow],
                [t.login.prepView, t.login.kitchenPace],
                [t.login.netEarnings, t.login.dailySummary]
              ].map(([title, value]) => (
                <div key={title} className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">{title}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <form
            onSubmit={handleSubmit}
            className="rounded-[32px] bg-surface p-8 shadow-soft"
          >
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                {t.login.merchantLogin}
              </p>
              <h2 className="text-4xl font-extrabold text-ink">{t.login.signIn}</h2>
            </div>

            <label className="mt-8 block">
              <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
                <Mail className="h-4 w-4 text-accent" />
                {t.login.email}
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 text-ink outline-none transition focus:border-accent"
                placeholder="merchant@cabuk.al"
              />
            </label>

            <label className="mt-5 block">
              <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
                <KeyRound className="h-4 w-4 text-accent" />
                {t.login.password}
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 text-ink outline-none transition focus:border-accent"
                placeholder={t.login.passwordPlaceholder}
              />
            </label>

            {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-8 w-full rounded-xl bg-accent px-4 py-4 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? t.login.signingIn : t.login.signIn}
            </button>

            <button
              type="button"
              onClick={() => navigate('/register')}
              className="mt-4 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-4 text-sm font-bold text-ink transition hover:bg-[#F8FAFC]"
            >
              Create account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
