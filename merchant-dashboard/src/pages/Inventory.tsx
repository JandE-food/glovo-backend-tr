import { Boxes, ImagePlus, Leaf, PlusCircle, Search, ShieldCheck, Store } from 'lucide-react';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';

import { InventoryItemCard } from '../components/InventoryItemCard';
import { StatCard } from '../components/StatCard';
import { restoranMenusunuKaydet, restoranProfiliniGetir } from '../services/api';
import { useMerchantStore } from '../store/useMerchantStore';
import type { InventoryItem } from '../types';
import { readFileAsDataUrl } from '../utils/files';
import { useMerchantI18n } from '../utils/i18n';

export const Inventory = () => {
  const { t } = useMerchantI18n();
  const inventory = useMerchantStore((state) => state.inventory);
  const setInventory = useMerchantStore((state) => state.setInventory);
  const setRestaurantProfile = useMerchantStore((state) => state.setRestaurantProfile);
  const merchantEmail = useMerchantStore((state) => state.merchantEmail);
  const merchantRestaurantId = useMerchantStore((state) => state.merchantRestaurantId);
  const merchantRestaurantName = useMerchantStore((state) => state.merchantRestaurantName);
  const merchantRestaurantType = useMerchantStore((state) => state.merchantRestaurantType);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in' | 'out'>('all');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!merchantEmail) {
      return;
    }

    let isMounted = true;

    const loadRestaurantProfile = async () => {
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
        setInventory(profile.menu);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setLoadError(error instanceof Error ? error.message : 'Failed to load menu management.');
      }
    };

    void loadRestaurantProfile();

    return () => {
      isMounted = false;
    };
  }, [
    merchantEmail,
    merchantRestaurantName,
    merchantRestaurantType,
    setInventory,
    setRestaurantProfile
  ]);

  const filteredInventory = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase('en-US');

    return inventory.filter((item) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [item.ad, item.kategori, item.aciklama ?? '', String(item.fiyat ?? '')]
          .join(' ')
          .toLocaleLowerCase('en-US')
          .includes(normalizedQuery);

      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'in' && item.stoktaVar) ||
        (stockFilter === 'out' && !item.stoktaVar);

      return matchesQuery && matchesStock;
    });
  }, [inventory, searchQuery, stockFilter]);

  const resetForm = () => {
    setName('');
    setCategory('');
    setPrice('');
    setDescription('');
    setImageUrl('');
    setEditingItemId(null);
  };

  const saveMenu = async (nextMenu: InventoryItem[]) => {
    if (!merchantEmail) {
      return false;
    }

    setIsSaving(true);
    setLoadError('');

    try {
      const profile = await restoranMenusunuKaydet({
        restaurantId: merchantRestaurantId,
        ownerEmail: merchantEmail,
        menu: nextMenu
      });

      setInventory(profile.menu);
      setRestaurantProfile({
        restaurantId: profile.id,
        restaurantName: profile.ad,
        restaurantImageUrl: profile.imageUrl,
        restaurantType: profile.kategori
      });
      return true;
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to save menu.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddItem = async () => {
    if (!name.trim() || !category.trim() || !merchantEmail) {
      return;
    }

    const parsedPrice = price.trim().length > 0 ? Number(price) : undefined;

    const payload: InventoryItem = {
      id: editingItemId ?? `menu-${Date.now()}`,
      ad: name,
      kategori: category,
      stoktaVar: true,
      fiyat: typeof parsedPrice === 'number' && Number.isFinite(parsedPrice) ? parsedPrice : undefined,
      aciklama: description,
      imageUrl: imageUrl.trim(),
      isCustom: true
    };

    let nextMenu: InventoryItem[];
    if (editingItemId) {
      nextMenu = inventory.map((item) =>
        item.id === editingItemId
          ? {
              ...item,
              ...payload,
              stoktaVar: item.stoktaVar
            }
          : item
      );
    } else {
      nextMenu = [payload, ...inventory];
    }

    const wasSaved = await saveMenu(nextMenu);
    if (wasSaved) {
      resetForm();
    }
  };

  const handleEditItem = (itemId: string) => {
    const item = inventory.find((entry) => entry.id === itemId);
    if (!item) {
      return;
    }

    setEditingItemId(item.id);
    setName(item.ad);
    setCategory(item.kategori);
    setPrice(typeof item.fiyat === 'number' ? String(item.fiyat) : '');
    setDescription(item.aciklama ?? '');
    setImageUrl(item.imageUrl ?? '');
  };

  const handleDeleteItem = async (itemId: string) => {
    await saveMenu(inventory.filter((entry) => entry.id !== itemId));

    if (editingItemId === itemId) {
      resetForm();
    }
  };

  const handleToggleStock = async (itemId: string) => {
    await saveMenu(
      inventory.map((item) =>
        item.id === itemId ? { ...item, stoktaVar: !item.stoktaVar } : item
      )
    );
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const nextImageUrl = await readFileAsDataUrl(file);
    setImageUrl(nextImageUrl);
    event.target.value = '';
  };

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_420px]">
        <div className="rounded-[34px] bg-[#191A1F] px-6 pb-6 pt-8 text-white shadow-shell">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#FF6B4A] text-white shadow-lg shadow-[#FF6B4A]/25">
                <Store className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{merchantRestaurantName}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/55">{t.inventory.section}</p>
                <h2 className="mt-2 text-4xl font-extrabold tracking-[-0.03em] text-white">{t.inventory.title}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
                  Search the menu, filter stock status, and register new menu items directly from the website dashboard.
                </p>
              </div>
            </div>
            <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">
              {t.inventory.badge}
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-[22px] bg-white/10 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">{t.inventory.totalItems}</p>
              <p className="mt-3 text-2xl font-extrabold">{inventory.length}</p>
            </div>
            <div className="rounded-[22px] bg-white/10 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">{t.inventory.inStock}</p>
              <p className="mt-3 text-2xl font-extrabold">{inventory.filter((item) => item.stoktaVar).length}</p>
            </div>
            <div className="rounded-[22px] bg-white/10 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">{t.inventory.outOfStock}</p>
              <p className="mt-3 text-2xl font-extrabold">{inventory.filter((item) => !item.stoktaVar).length}</p>
            </div>
          </div>
        </div>

        <aside className="rounded-[34px] border border-[#EAE7E1] bg-white/85 p-6 shadow-soft backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF1EC] text-accent">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                {editingItemId ? 'Edit Menu Item' : 'Add Menu Item'}
              </p>
              <h3 className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-ink">
                {editingItemId ? 'Update menu listing' : 'Create a new listing'}
              </h3>
            </div>
          </div>

          <div className="mt-6 space-y-4 border-t border-[#EAE7E1] pt-6">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-muted">Item name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="House Burger"
                className="w-full rounded-[18px] border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-muted">Category</span>
              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Main Dish"
                className="w-full rounded-[18px] border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-muted">Price</span>
              <input
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="450"
                inputMode="numeric"
                className="w-full rounded-[18px] border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
              />
            </label>

            <div className="block">
              <span className="mb-2 block text-sm font-semibold text-muted">Item photo</span>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-[18px] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-4 text-sm font-semibold text-ink transition hover:bg-white">
                <ImagePlus className="h-4 w-4" />
                Upload photo
                <input type="file" accept="image/*" className="hidden" onChange={(event) => void handleImageUpload(event)} />
              </label>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Menu preview"
                  className="mt-3 h-28 w-full rounded-[18px] object-cover ring-1 ring-[#E5E7EB]"
                />
              ) : null}
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-muted">Description</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Short kitchen description for the merchant team."
                rows={4}
                className="w-full rounded-[18px] border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
              />
            </label>

            <button
              type="button"
              onClick={() => void handleAddItem()}
              disabled={isSaving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[18px] bg-accent px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <PlusCircle className="h-4 w-4" />
              {isSaving ? 'Saving...' : editingItemId ? 'Save changes' : 'Add to menu management'}
            </button>
            {editingItemId ? (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex w-full items-center justify-center rounded-[18px] border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-bold text-ink transition hover:bg-[#F8FAFC]"
              >
                Cancel editing
              </button>
            ) : null}
            {loadError ? <p className="text-sm text-red-500">{loadError}</p> : null}
          </div>
        </aside>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <StatCard
          title={t.inventory.totalItems}
          value={String(inventory.length)}
          hint={t.inventory.totalItemsHint}
          icon={<Boxes className="h-5 w-5" />}
        />
        <StatCard
          title={t.inventory.inStock}
          value={String(inventory.filter((item) => item.stoktaVar).length)}
          hint={t.inventory.inStockHint}
          icon={<ShieldCheck className="h-5 w-5" />}
        />
        <StatCard
          title={t.inventory.outOfStock}
          value={String(inventory.filter((item) => !item.stoktaVar).length)}
          hint={t.inventory.outOfStockHint}
          icon={<Leaf className="h-5 w-5" />}
        />
      </div>

      <div className="rounded-[34px] border border-[#EAE7E1] bg-white/85 p-5 shadow-soft backdrop-blur md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Menu Management</p>
            <h3 className="mt-2 text-3xl font-extrabold tracking-[-0.03em] text-ink">Desktop inventory list</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              Filter by availability and search across item name, category, description, and price.
            </p>
          </div>
          <div className="rounded-full bg-[#1A1A1A] px-4 py-2 text-sm font-semibold text-white">
            {filteredInventory.length} visible items
          </div>
        </div>

        <div className="mt-6 grid gap-4 border-t border-[#EAE7E1] pt-6 xl:grid-cols-[minmax(0,1fr)_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search menu items, categories, or descriptions"
              className="w-full rounded-[18px] border border-[#E5E7EB] bg-white px-11 py-3 text-sm text-ink outline-none transition focus:border-accent"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All items' },
              { value: 'in', label: 'In stock' },
              { value: 'out', label: 'Out of stock' }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStockFilter(option.value as typeof stockFilter)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  stockFilter === option.value
                    ? 'bg-[#191A1F] text-white'
                    : 'border border-[#E5E7EB] bg-white text-ink hover:bg-[#F8FAFC]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[24px] border border-[#EEF2F7] bg-white">
          <div className="hidden border-b border-[#EEF2F7] bg-[#F8FAFC] px-4 py-3 lg:grid lg:grid-cols-[minmax(0,1.6fr)_180px_120px_140px_320px] lg:gap-4">
            {['Item', 'Category', 'Price', 'Availability', 'Action'].map((label) => (
              <p key={label} className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                {label}
              </p>
            ))}
          </div>

          <div className="divide-y divide-transparent">
            {filteredInventory.map((item) => (
              <InventoryItemCard
                key={item.id}
                item={item}
                onToggle={(itemId) => void handleToggleStock(itemId)}
                onEdit={handleEditItem}
                onDelete={(itemId) => void handleDeleteItem(itemId)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
