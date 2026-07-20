import { ArrowUpRight, CheckCircle2 } from 'lucide-react';

const JobApplicantsTable = ({ candidates, threshold, onViewCandidate }) => {
  if (!candidates.length) return <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-6 text-center"><div><p className="font-medium text-slate-200">No candidates have applied</p><p className="mt-1 text-sm text-slate-500">Applicants will appear here once they are linked to this job.</p></div></div>;

  return (
    <div className="max-w-full overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/70">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="border-b border-white/10 bg-slate-950/40 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3 font-medium">Rank</th><th className="px-4 py-3 font-medium">Candidate</th><th className="px-4 py-3 font-medium">Skills</th><th className="px-4 py-3 font-medium">Experience</th><th className="px-4 py-3 font-medium">Match score</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Applied</th><th className="px-4 py-3 text-right font-medium">Action</th></tr></thead>
        <tbody className="divide-y divide-white/[0.07]">{candidates.map((candidate, index) => {
          const score = Number(candidate.matchScore) || 0;
          const aboveThreshold = score >= threshold;
          return <tr key={candidate.id} className={aboveThreshold ? 'bg-emerald-500/[0.025]' : ''}><td className="px-4 py-4"><span className={`grid h-7 w-7 place-items-center rounded-lg text-xs font-semibold ${index < 3 ? 'bg-amber-500/10 text-amber-300' : 'bg-slate-800 text-slate-500'}`}>{index + 1}</span></td><td className="px-4 py-4"><p className="font-medium text-white">{candidate.name || 'Unknown candidate'}</p><p className="text-xs text-slate-500">{candidate.location || candidate.email || 'Details unavailable'}</p></td><td className="max-w-72 px-4 py-4"><div className="flex flex-wrap gap-1">{(candidate.skills || []).slice(0, 3).map((skill) => <span key={skill} className="rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] text-slate-400">{skill}</span>)}</div>{candidate.matchedSkills?.length > 0 && <p className="mt-1 text-[11px] text-emerald-400">Matched: {candidate.matchedSkills.slice(0, 3).join(', ')}</p>}{candidate.missingSkills?.length > 0 && <p className="text-[11px] text-amber-400">Missing: {candidate.missingSkills.slice(0, 2).join(', ')}</p>}</td><td className="px-4 py-4 text-slate-400">{Number(candidate.experienceYears) || 0} years</td><td className="px-4 py-4"><span className={`inline-flex items-center gap-1 font-semibold ${aboveThreshold ? 'text-emerald-300' : 'text-amber-300'}`}>{aboveThreshold && <CheckCircle2 size={13} />}{score}%</span></td><td className="px-4 py-4"><span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">{candidate.status || 'Unknown'}</span></td><td className="px-4 py-4 text-slate-400">{candidate.applicationDate || '—'}</td><td className="px-4 py-4 text-right"><button type="button" onClick={() => onViewCandidate(candidate)} className="inline-flex items-center gap-1 text-xs font-medium text-cyan-300 hover:text-cyan-200">View <ArrowUpRight size={13} /></button></td></tr>;
        })}</tbody>
      </table>
    </div>
  );
};

export default JobApplicantsTable;
