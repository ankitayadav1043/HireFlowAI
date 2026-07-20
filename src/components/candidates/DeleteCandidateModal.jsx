import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const DeleteCandidateModal = ({ candidate, linkedInterviews, onClose, onDelete }) => {
  const [confirmed, setConfirmed] = useState(false);
  if (!candidate) return null;
  const force = linkedInterviews > 0;
  return <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/85 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-candidate-title"><div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6"><div className="flex gap-4"><AlertTriangle className="shrink-0 text-rose-300" /><div className="flex-1"><h2 id="delete-candidate-title" className="text-xl font-semibold text-white">Delete {candidate.name}?</h2><p className="mt-2 text-sm text-slate-400">This candidate record will be permanently removed.</p></div><button type="button" onClick={onClose} aria-label="Cancel deletion"><X className="text-slate-500" /></button></div>{force && <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100"><p>{linkedInterviews} linked interview{linkedInterviews === 1 ? '' : 's'} block normal deletion.</p><p className="mt-1 text-amber-200/70">Force deletion will also remove those linked interview records.</p><label className="mt-3 flex gap-2"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />I explicitly confirm force deletion.</label></div>}<div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300">Keep candidate</button><button type="button" disabled={force && !confirmed} onClick={() => onDelete(force)} className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">{force ? 'Force delete' : 'Delete candidate'}</button></div></div></div>;
};
export default DeleteCandidateModal;
