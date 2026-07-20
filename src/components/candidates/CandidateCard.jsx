import { createElement } from 'react';
import { Copy, Download, Eye, MapPin, Pencil, Trash2 } from 'lucide-react';
import CandidateStatusBadge from './CandidateStatusBadge';
import MatchScoreBadge from './MatchScoreBadge';

const CandidateCard = ({ candidate, statuses, onView, onEdit, onDelete, onCopyEmail, onDownload, onStatusChange }) => (
  <article className="flex min-w-0 flex-col rounded-2xl border border-white/10 bg-slate-900/70 p-5 hover:border-white/20">
    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="truncate text-lg font-semibold text-white">{candidate.name || 'Unknown candidate'}</h2><p className="truncate text-sm text-cyan-300">{candidate.appliedJob || 'Unassigned role'}</p></div><MatchScoreBadge score={candidate.matchScore} compact /></div>
    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500"><MapPin size={13} />{candidate.location || 'Location unavailable'} · {Number(candidate.experienceYears) || 0} years</div>
    <div className="mt-4 flex flex-wrap gap-1.5">{candidate.skills?.length ? candidate.skills.slice(0, 5).map((skill) => <span key={skill} className="rounded-lg bg-white/5 px-2 py-1 text-[11px] text-slate-300">{skill}</span>) : <span className="text-xs text-slate-600">No skills provided</span>}</div>
    <div className="mt-4 rounded-xl bg-white/[0.03] p-3"><p className="text-xs text-slate-500">AI recommendation</p><p className="mt-1 text-sm font-medium text-slate-200">{candidate.aiRecommendation || 'Manual Review'}</p></div>
    <div className="mt-4 flex items-center justify-between"><CandidateStatusBadge status={candidate.status} /><span className="text-xs text-slate-500">{candidate.source || 'Unknown source'}</span></div>
    <select aria-label={`Move ${candidate.name} to another status`} value={candidate.status || ''} onChange={(event) => onStatusChange(event.target.value)} className="mt-4 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-300 outline-none">{statuses.map((status) => <option key={status}>{status}</option>)}</select>
    <div className="mt-auto flex items-center gap-1.5 border-t border-white/10 pt-4"><button type="button" onClick={onView} className="inline-flex items-center gap-1 rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950"><Eye size={13} />View</button>{[[onEdit, Pencil, 'Edit'], [onCopyEmail, Copy, 'Copy email'], [onDownload, Download, 'Download resume'], [onDelete, Trash2, 'Delete']].map(([handler, icon, label]) => <button key={label} type="button" onClick={handler} className={`grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-white/5 hover:text-white ${label === 'Delete' ? 'ml-auto hover:text-rose-300' : ''}`} aria-label={`${label} ${candidate.name}`}>{createElement(icon, { size: 14 })}</button>)}</div>
  </article>
);
export default CandidateCard;
