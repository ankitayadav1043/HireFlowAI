import { useMemo } from 'react';
import { Award, MapPin } from 'lucide-react';

const TopCandidates = ({ candidates }) => {
  const ranked = useMemo(() => candidates
    .filter((candidate) => Number.isFinite(Number(candidate.matchScore)))
    .sort((first, second) => Number(second.matchScore) - Number(first.matchScore))
    .slice(0, 5), [candidates]);

  return (
    <section className="min-w-0 rounded-2xl border border-white/10 bg-slate-900/70 p-5" aria-labelledby="top-candidates-title">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-400">AI ranking</p><h2 id="top-candidates-title" className="mt-1 text-lg font-semibold text-white">Top ranked candidates</h2></div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 text-amber-300"><Award size={19} /></span>
      </div>
      {ranked.length ? (
        <ol className="mt-5 space-y-2">
          {ranked.map((candidate, index) => (
            <li key={candidate.id} className="flex min-w-0 items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-white/[0.03]">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-800 text-xs font-semibold text-slate-400">{index + 1}</span>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-white">{candidate.name || 'Unknown candidate'}</p><p className="flex items-center gap-1 truncate text-xs text-slate-500"><MapPin size={11} />{candidate.location || 'Location unavailable'}</p></div>
              <div className="shrink-0 text-right"><p className="text-sm font-semibold text-emerald-300">{Number(candidate.matchScore).toFixed(0)}%</p><p className="max-w-28 truncate text-[11px] text-slate-500">{candidate.appliedJob || 'Unassigned'}</p></div>
            </li>
          ))}
        </ol>
      ) : <p className="grid min-h-48 place-items-center text-sm text-slate-500">No ranked candidates</p>}
    </section>
  );
};

export default TopCandidates;
