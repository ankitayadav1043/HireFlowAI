import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const DeleteJobModal = ({ job, applicantCount, onClose, onDelete }) => {
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!job) return undefined;
    const handleKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [job, onClose]);

  if (!job) return null;
  const requiresForce = applicantCount > 0;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="delete-job-title">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-rose-500/10 text-rose-300"><AlertTriangle size={21} /></span>
          <div className="min-w-0 flex-1"><h2 id="delete-job-title" className="text-xl font-semibold text-white">Delete {job.title}?</h2><p className="mt-2 text-sm leading-6 text-slate-400">This removes the job and cannot be undone.</p></div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-white/5 hover:text-white" aria-label="Cancel deletion"><X size={18} /></button>
        </div>

        {requiresForce ? (
          <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
            <p className="font-medium">{applicantCount} candidate{applicantCount === 1 ? '' : 's'} currently reference this job.</p>
            <p className="mt-1 leading-5 text-amber-200/70">Force deletion will keep every candidate but detach their job reference. Candidate records will not be deleted.</p>
            <label className="mt-4 flex cursor-pointer items-start gap-3"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-1 accent-rose-500" /><span>I understand and want to force delete this job.</span></label>
          </div>
        ) : <p className="mt-5 rounded-2xl bg-slate-800/60 p-4 text-sm text-slate-400">No candidates are attached, so this job can be deleted normally.</p>}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5">Keep job</button>
          <button type="button" disabled={requiresForce && !confirmed} onClick={() => onDelete(requiresForce)} className="rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-40">{requiresForce ? 'Force delete and detach' : 'Delete job'}</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteJobModal;
