import { KeyRound, Mail, Store, User } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { kayitOl } from '../services/api';
import { useMerchantStore } from '../store/useMerchantStore';
import type { MerchantRestaurantType } from '../types';
import { useMerchantI18n } from '../utils/i18n';

const restaurantTypeOptions: Array<{ value: MerchantRestaurantType; label: string }> = [
  { value: 'restaurants', label: 'Restaurant' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'pide', label: 'Pide' },
  { value: 'desserts', label: 'Desserts' },
  { value: 'market', label: 'Market' },
  { value: 'pharmacy', label: 'Pharmacy' }
];

export const Register = () => {
  const navigate = useNavigate();
  const { t } = useMerchantI18n();
  const language = useMerchantStore((state) => state.language);
  const setLanguage = useMerchantStore((state) => state.setLanguage);
  const setLogin = useMerchantStore((state) => state.girisYap);
  const [name, setName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantType, setRestaurantType] = useState<MerchantRestaurantType>('restaurants');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const session = await kayitOl({ name, email, password, restaurantName, restaurantType });
      setLogin({
        email,
        restaurantId: session.restaurantId,
        restaurantName: session.restaurantName,
        restaurantImageUrl: session.restaurantImageUrl,
        restaurantType: session.restaurantType
      });
      navigate('/dashboard', { replace: true });
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : t.login.loginFailed;
      if (message.toLocaleLowerCase('en-US').includes('already exists')) {
        window.alert('You already have an account.');
        navigate('/', { replace: true, state: { email } });
        return;
      }
      setError(message);
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
              <h1 className="mt-4 text-5xl font-extrabold leading-none">Create account</h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-white/85">
                Create your merchant account, then sign in to start receiving orders.
              </p>
            </div>
          </section>

          <form onSubmit={handleSubmit} className="rounded-[32px] bg-surface p-8 shadow-soft">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Merchant registration
              </p>
              <h2 className="text-4xl font-extrabold text-ink">Sign Up</h2>
            </div>

            <label className="mt-8 block">
              <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
                <User className="h-4 w-4 text-accent" />
                Full name
              </span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 text-ink outline-none transition focus:border-accent"
                placeholder="Cabuk Merchant"
              />
            </label>

            <label className="mt-5 block">
              <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
                <Store className="h-4 w-4 text-accent" />
                Restaurant name
              </span>
              <input
                value={restaurantName}
                onChange={(event) => setRestaurantName(event.target.value)}
                className="w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 text-ink outline-none transition focus:border-accent"
                placeholder="Maman Bistro"
              />
            </label>

            <label className="mt-5 block">
              <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
                <Store className="h-4 w-4 text-accent" />
                Restaurant type
              </span>
              <select
                value={restaurantType}
                onChange={(event) => setRestaurantType(event.target.value as MerchantRestaurantType)}
                className="w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 text-ink outline-none transition focus:border-accent"
              >
                {restaurantTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-5 block">
              <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
                <Mail className="h-4 w-4 text-accent" />
                Email
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
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 text-ink outline-none transition focus:border-accent"
                placeholder="••••••••"
              />
            </label>

            {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-8 w-full rounded-xl bg-accent px-4 py-4 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/', { replace: true })}
              className="mt-4 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-4 text-sm font-bold text-ink transition hover:bg-[#F8FAFC]"
            >
              Back to Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
