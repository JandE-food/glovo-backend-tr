import type { ReactNode } from 'react';

type StatCardProps = {
  title: string;
  value: string;
  hint: string;
  icon: ReactNode;
};

export const StatCard = ({ title, value, hint, icon }: StatCardProps) => (
  <article className="rounded-2xl border border-[#F3D1C8] bg-surface p-5 shadow-soft">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accentSoft text-accent">
      {icon}
    </div>
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{title}</p>
    <h3 className="mt-3 text-3xl font-extrabold text-ink">{value}</h3>
    <p className="mt-2 text-sm text-muted">{hint}</p>
  </article>
);
