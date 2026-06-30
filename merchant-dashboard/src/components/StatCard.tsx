import type { ReactNode } from 'react';

type StatCardProps = {
  title: string;
  value: string;
  hint: string;
  icon: ReactNode;
};

export const StatCard = ({ title, value, hint, icon }: StatCardProps) => (
  <article className="h-full rounded-[28px] border border-[#EAE7E1] bg-white/85 p-5 shadow-soft backdrop-blur">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF1EC] text-accent">
      {icon}
    </div>
    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">{title}</p>
    <h3 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-ink">{value}</h3>
    <p className="mt-2 text-sm leading-6 text-muted">{hint}</p>
  </article>
);
