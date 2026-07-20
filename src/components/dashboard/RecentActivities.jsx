import { createElement, useMemo } from 'react';
import { Activity, Bot, BriefcaseBusiness, CalendarDays, UserRound } from 'lucide-react';

const typeIcons = { candidate: UserRound, interview: CalendarDays, automation: Bot, job: BriefcaseBusiness };

const RecentActivities = ({ activities }) => {
  const recent = useMemo(() => activities
    .map((item) => ({ ...item, occurredAt: new Date(item.timestamp) }))
    .filter((item) => !Number.isNaN(item.occurredAt.getTime()))
    .sort((first, second) => second.occurredAt - first.occurredAt)
    .slice(0, 6), [activities]);

  const formatter = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

  return (
    <section className="min-w-0 rounded-2xl border border-white/10 bg-slate-900/70 p-5" aria-labelledby="recent-activities-title">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-400">Live updates</p><h2 id="recent-activities-title" className="mt-1 text-lg font-semibold text-white">Recent activities</h2></div>
        <Activity size={19} className="text-blue-300" />
      </div>
      {recent.length ? (
        <ol className="mt-5 space-y-4">
          {recent.map((item) => (
            <li key={item.id} className="flex min-w-0 gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-slate-400">{createElement(typeIcons[item.type] || Activity, { size: 16 })}</span>
              <div className="min-w-0 flex-1"><div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3"><p className="truncate text-sm font-medium text-slate-200">{item.title || 'Activity update'}</p><time className="shrink-0 text-[11px] text-slate-600">{formatter.format(item.occurredAt)}</time></div><p className="mt-0.5 line-clamp-2 text-xs leading-5 text-slate-500">{item.description || 'No details available'}</p></div>
            </li>
          ))}
        </ol>
      ) : <p className="grid min-h-48 place-items-center text-sm text-slate-500">No recent activity</p>}
    </section>
  );
};

export default RecentActivities;
