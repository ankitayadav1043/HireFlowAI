import { createElement } from 'react';

const MetricCard = ({ title, value, description, icon, accent = 'cyan' }) => {
  const accents = {
    cyan: 'bg-cyan-500/10 text-cyan-300 ring-cyan-500/20',
    violet: 'bg-violet-500/10 text-violet-300 ring-violet-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-300 ring-amber-500/20',
    blue: 'bg-blue-500/10 text-blue-300 ring-blue-500/20',
    rose: 'bg-rose-500/10 text-rose-300 ring-rose-500/20',
  };

  return (
    <article className="min-w-0 rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-black/5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{value}</p>
        </div>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ${accents[accent] || accents.cyan}`}>
          {createElement(icon, { size: 19, 'aria-hidden': true })}
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">{description}</p>
    </article>
  );
};

export default MetricCard;
