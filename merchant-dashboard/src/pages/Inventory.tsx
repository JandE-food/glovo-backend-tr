import { Boxes, Leaf, ShieldCheck } from 'lucide-react';

import { InventoryItemCard } from '../components/InventoryItemCard';
import { StatCard } from '../components/StatCard';
import { useMerchantStore } from '../store/useMerchantStore';
import { useMerchantI18n } from '../utils/i18n';

export const Inventory = () => {
  const { t } = useMerchantI18n();
  const inventory = useMerchantStore((state) => state.inventory);
  const toggleStock = useMerchantStore((state) => state.stokDurumuDegistir);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{t.inventory.section}</p>
          <h2 className="mt-3 text-5xl font-extrabold text-ink">{t.inventory.title}</h2>
        </div>
        <div className="rounded-full bg-[#1A1A1A] px-4 py-2 text-sm font-semibold text-white">
          {t.inventory.badge}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
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

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {inventory.map((item) => (
          <InventoryItemCard key={item.id} item={item} onToggle={toggleStock} />
        ))}
      </div>
    </section>
  );
};
