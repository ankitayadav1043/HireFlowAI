const styles = {
  Applied: 'bg-blue-500/10 text-blue-300 border-blue-500/20', Screening: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  Shortlisted: 'bg-violet-500/10 text-violet-300 border-violet-500/20', 'Interview Scheduled': 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  'Interview Completed': 'bg-orange-500/10 text-orange-300 border-orange-500/20', Selected: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  'Offer Sent': 'bg-teal-500/10 text-teal-300 border-teal-500/20', Hired: 'bg-green-500/10 text-green-300 border-green-500/20',
  Rejected: 'bg-rose-500/10 text-rose-300 border-rose-500/20', 'On Hold': 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  Withdrawn: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};
const CandidateStatusBadge = ({ status }) => { const safe = status?.trim() || 'Unknown'; return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles[safe] || 'border-slate-500/20 bg-slate-500/10 text-slate-400'}`}>{safe}</span>; };
export default CandidateStatusBadge;
