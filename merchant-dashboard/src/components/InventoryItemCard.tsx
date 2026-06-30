import { CheckCircle2, PencilLine, Trash2, XCircle } from 'lucide-react';

import type { InventoryItem } from '../types';
import { translateCatalogValue, useMerchantI18n } from '../utils/i18n';
import { formatLira } from '../utils/merchant';

type InventoryItemCardProps = {
  item: InventoryItem;
  onToggle: (itemId: string) => void;
  onEdit: (itemId: string) => void;
  onDelete: (itemId: string) => void;
};

export const InventoryItemCard = ({ item, onToggle, onEdit, onDelete }: InventoryItemCardProps) => {
  const { language, t } = useMerchantI18n();

  return (
    <article className="grid gap-4 border-t border-[#EEF2F7] px-4 py-4 first:border-t-0 lg:grid-cols-[minmax(0,1.8fr)_180px_120px_140px_320px] lg:items-center">
      <div className="flex min-w-0 items-start gap-4">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.ad}
            className="h-16 w-16 flex-none rounded-2xl object-cover ring-1 ring-[#E5E7EB]"
          />
        ) : null}
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
            {translateCatalogValue(item.kategori, language)}
          </p>
          <h3 className="mt-1 text-lg font-extrabold text-ink">
            {translateCatalogValue(item.ad, language)}
          </h3>
          <p className="mt-1 text-sm leading-6 text-muted">
            {item.aciklama?.trim() || 'Visible in the merchant menu management list.'}
          </p>
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted lg:hidden">Category</p>
        <p className="text-sm font-semibold text-ink">{translateCatalogValue(item.kategori, language)}</p>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted lg:hidden">Price</p>
        <p className="text-sm font-semibold text-ink">
          {typeof item.fiyat === 'number' ? formatLira(item.fiyat, language) : 'Price pending'}
        </p>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted lg:hidden">Availability</p>
        <div
          className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
            item.stoktaVar ? 'bg-[#E8F7EF] text-success' : 'bg-[#F3F4F6] text-muted'
          }`}
        >
          {item.stoktaVar ? t.inventory.inStock : t.inventory.outOfStock}
        </div>
      </div>

      <div className="flex flex-col gap-2 lg:flex-row lg:justify-end">
        <button
          type="button"
          onClick={() => onEdit(item.id)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:bg-[#F8FAFC] lg:w-auto lg:min-w-[120px]"
        >
          <PencilLine className="h-4 w-4" />
          Edit
        </button>
        {item.isCustom ? (
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm font-semibold text-[#B91C1C] transition hover:bg-[#FEE2E2] lg:w-auto lg:min-w-[120px]"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => onToggle(item.id)}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition lg:w-auto lg:min-w-[190px] ${
            item.stoktaVar
              ? 'bg-[#1A1A1A] text-white hover:bg-black'
              : 'bg-accent text-white hover:opacity-90'
          }`}
        >
          {item.stoktaVar ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          {item.stoktaVar ? t.inventory.markOutOfStock : t.inventory.markInStock}
        </button>
      </div>
    </article>
  );
};
