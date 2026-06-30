import { ImagePlus, Languages, Store } from 'lucide-react';
import { ChangeEvent, useEffect, useState } from 'react';

import { restoranProfiliniGetir, restoranProfiliniGuncelle } from '../services/api';
import { useMerchantStore } from '../store/useMerchantStore';
import { readFileAsDataUrl } from '../utils/files';
import { type AppLanguage, useMerchantI18n } from '../utils/i18n';

const languageOptions: AppLanguage[] = ['en', 'sq', 'sr'];

export const Settings = () => {
  const { language, t } = useMerchantI18n();
  const setLanguage = useMerchantStore((state) => state.setLanguage);
  const merchantEmail = useMerchantStore((state) => state.merchantEmail);
  const merchantRestaurantId = useMerchantStore((state) => state.merchantRestaurantId);
  const merchantRestaurantName = useMerchantStore((state) => state.merchantRestaurantName);
  const merchantRestaurantImageUrl = useMerchantStore((state) => state.merchantRestaurantImageUrl);
  const merchantRestaurantType = useMerchantStore((state) => state.merchantRestaurantType);
  const setRestaurantProfile = useMerchantStore((state) => state.setRestaurantProfile);
  const [restaurantName, setRestaurantName] = useState(merchantRestaurantName);
  const [restaurantImageUrl, setRestaurantImageUrl] = useState(merchantRestaurantImageUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [error, setError] = useState('');
  const languageLabel =
    language === 'en'
      ? t.settings.english
      : language === 'sr'
        ? t.settings.serbian
        : t.settings.albanian;

  useEffect(() => {
    setRestaurantName(merchantRestaurantName);
    setRestaurantImageUrl(merchantRestaurantImageUrl);
  }, [merchantRestaurantImageUrl, merchantRestaurantName]);

  useEffect(() => {
    if (!merchantEmail) {
      return;
    }

    let isMounted = true;

    const loadRestaurantProfile = async () => {
      setIsLoadingProfile(true);

      try {
        const profile = await restoranProfiliniGetir(merchantEmail, {
          restaurantName: merchantRestaurantName,
          restaurantType: merchantRestaurantType
        });

        if (!isMounted) {
          return;
        }

        setRestaurantProfile({
          restaurantId: profile.id,
          restaurantName: profile.ad,
          restaurantImageUrl: profile.imageUrl,
          restaurantType: profile.kategori
        });
        setRestaurantName(profile.ad);
        setRestaurantImageUrl(profile.imageUrl ?? '');
        setError('');
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        if (!merchantRestaurantId) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Failed to load restaurant profile.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    };

    void loadRestaurantProfile();

    return () => {
      isMounted = false;
    };
  }, [
    merchantEmail,
    merchantRestaurantId,
    merchantRestaurantName,
    merchantRestaurantType,
    setRestaurantProfile
  ]);

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const nextImageUrl = await readFileAsDataUrl(file);
    setRestaurantImageUrl(nextImageUrl);
    event.target.value = '';
  };

  const handleSaveProfile = async () => {
    if (!merchantEmail) {
      setError('Merchant session is missing. Please sign in again.');
      return;
    }

    if (!restaurantName.trim()) {
      setError('Restaurant name is required.');
      return;
    }

    let targetRestaurantId = merchantRestaurantId.trim();

    if (!targetRestaurantId) {
      try {
        const profile = await restoranProfiliniGetir(merchantEmail, {
          restaurantName: merchantRestaurantName,
          restaurantType: merchantRestaurantType
        });
        targetRestaurantId = profile.id;
        setRestaurantProfile({
          restaurantId: profile.id,
          restaurantName: profile.ad,
          restaurantImageUrl: profile.imageUrl,
          restaurantType: profile.kategori
        });
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Failed to load restaurant profile.'
        );
        return;
      }
    }

    if (!targetRestaurantId) {
      setError('Restaurant profile is still loading. Please try again.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const profile = await restoranProfiliniGuncelle({
        restaurantId: targetRestaurantId,
        ownerEmail: merchantEmail,
        ad: restaurantName.trim(),
        imageUrl: restaurantImageUrl
      });

      setRestaurantProfile({
        restaurantId: profile.id,
        restaurantName: profile.ad,
        restaurantImageUrl: profile.imageUrl,
        restaurantType: profile.kategori
      });
      setRestaurantName(profile.ad);
      setRestaurantImageUrl(profile.imageUrl ?? '');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to update restaurant profile.');
    } finally {
      setIsSaving(false);
    }
  };

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
            <Store className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Restaurant profile
            </p>
            <h3 className="mt-2 text-3xl font-extrabold text-ink">Customer-facing identity</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Update the restaurant name and cover photo shown in the customer app.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 border-t border-[#F3D1C8] pt-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-muted">Restaurant name</span>
              <input
                value={restaurantName}
                onChange={(event) => setRestaurantName(event.target.value)}
                className="w-full rounded-[20px] border border-[#F3D1C8] bg-white px-4 py-4 text-sm font-semibold text-ink shadow-soft focus:outline-none"
                placeholder="Maman Bistro"
              />
            </label>
            <div>
              <span className="mb-2 block text-sm font-semibold text-muted">Restaurant photo</span>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-[20px] border border-dashed border-[#F3D1C8] bg-white px-4 py-4 text-sm font-semibold text-ink shadow-soft transition hover:bg-[#FFF8F5]">
                <ImagePlus className="h-4 w-4" />
                Upload restaurant image
                <input type="file" accept="image/*" className="hidden" onChange={(event) => void handleImageUpload(event)} />
              </label>
            </div>
            <button
              type="button"
              disabled={isSaving || isLoadingProfile}
              onClick={() => void handleSaveProfile()}
              className="inline-flex rounded-[18px] bg-accent px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving
                ? 'Saving profile...'
                : isLoadingProfile
                  ? 'Loading profile...'
                  : 'Save restaurant profile'}
            </button>
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
          </div>

          <div className="rounded-[24px] border border-[#F3D1C8] bg-white p-4 shadow-soft">
            {restaurantImageUrl ? (
              <img
                src={restaurantImageUrl}
                alt={restaurantName || 'Restaurant'}
                className="h-48 w-full rounded-[20px] object-cover"
              />
            ) : (
              <div className="flex h-48 items-center justify-center rounded-[20px] bg-[#FFF8F5] text-sm font-semibold text-muted">
                Upload a restaurant image
              </div>
            )}
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Customer app preview
            </p>
            <h4 className="mt-2 text-2xl font-extrabold text-ink">{restaurantName || merchantRestaurantName}</h4>
            <p className="mt-2 text-sm leading-6 text-muted">
              This is the identity shoppers see in the restaurant list and menu page.
            </p>
          </div>
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
