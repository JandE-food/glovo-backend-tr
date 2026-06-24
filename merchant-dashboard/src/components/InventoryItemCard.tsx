import { CheckCircle2, XCircle } from 'lucide-react';

import type { InventoryItem } from '../types';
import { translateCatalogValue, useMerchantI18n } from '../utils/i18n';

type InventoryItemCardProps = {
  item: InventoryItem;
  onToggle: (itemId: string) => void;
};

export const InventoryItemCard = ({ item, onToggle }: InventoryItemCardProps) => {
  const { language, t } = useMerchantI18n();

  return (
    <article className="rounded-[24px] border border-[#F3D1C8] bg-surface p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            {translateCatalogValue(item.kategori, language)}
          </p>
          <h3 className="mt-2 text-3xl font-extrabold text-ink">
            {translateCatalogValue(item.ad, language)}
          </h3>
        </div>
        <div
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            item.stoktaVar ? 'bg-[#E8F7EF] text-success' : 'bg-[#F3F4F6] text-muted'
          }`}
        >
          {item.stoktaVar ? t.inventory.inStock : t.inventory.outOfStock}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onToggle(item.id)}
        className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
          item.stoktaVar
            ? 'bg-[#1A1A1A] text-white hover:bg-black'
            : 'bg-accent text-white hover:opacity-90'
        }`}
      >
        {item.stoktaVar ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
        {item.stoktaVar ? t.inventory.markOutOfStock : t.inventory.markInStock}
      </button>
    </article>
  );
};
