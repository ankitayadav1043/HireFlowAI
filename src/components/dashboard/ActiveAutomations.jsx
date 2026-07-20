import { useMemo } from 'react';
import { Bot, CheckCircle2, Play } from 'lucide-react';

const ActiveAutomations = ({ automations, onRun }) => {
  const active = useMemo(() => automations.filter((automation) => automation.status === 'Active').slice(0, 5), [automations]);

  return (
    <section className="min-w-0 rounded-2xl border border-white/10 bg-slate-900/70 p-5" aria-labelledby="active-automations-title">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-400">Workflow health</p><h2 id="active-automations-title" className="mt-1 text-lg font-semibold text-white">Active automations</h2></div>
        <Bot size={19} className="text-emerald-300" />
      </div>
      {active.length ? (
        <ul className="mt-5 space-y-3">
          {active.map((automation) => {
            const successRate = automation.totalRuns > 0 ? (automation.successfulRuns / automation.totalRuns) * 100 : 0;
            return (
              <li key={automation.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-300"><CheckCircle2 size={17} /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-white">{automation.name || 'Unnamed workflow'}</p><p className="text-xs text-slate-500">{automation.totalRuns || 0} runs · {successRate.toFixed(0)}% successful</p></div>
                <button type="button" onClick={() => onRun(automation.id)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 text-slate-400 transition hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-300" aria-label={`Run ${automation.name}`}><Play size={14} fill="currentColor" /></button>
              </li>
            );
          })}
        </ul>
      ) : <p className="grid min-h-48 place-items-center text-sm text-slate-500">No active automations</p>}
    </section>
  );
};

export default ActiveAutomations;
