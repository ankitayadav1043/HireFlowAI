const styles = {
  Open: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
  Closed: 'border-slate-500/25 bg-slate-500/10 text-slate-300',
  Draft: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
  Paused: 'border-violet-500/25 bg-violet-500/10 text-violet-300',
};

const JobStatusBadge = ({ status }) => {
  const safeStatus = typeof status === 'string' && status.trim() ? status.trim() : 'Unknown';
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles[safeStatus] || 'border-slate-500/25 bg-slate-500/10 text-slate-400'}`}>{safeStatus}</span>;
};

export default JobStatusBadge;
