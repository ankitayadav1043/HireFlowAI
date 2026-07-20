import { BriefcaseBusiness, CalendarDays, Copy, Eye, MapPin, Pencil, Trash2, Users } from 'lucide-react';
import JobStatusBadge from './JobStatusBadge';

const formatDate = (value) => {
  const date = value ? new Date(`${value}T00:00:00`) : null;
  return date && !Number.isNaN(date.getTime()) ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date) : 'No deadline';
};

const JobCard = ({ job, applicantCount, highlighted, onView, onEdit, onDelete, onCopy, onDuplicate, onStatusChange }) => (
  <article className={`flex min-w-0 flex-col rounded-2xl border bg-slate-900/70 p-5 transition ${highlighted ? 'border-cyan-400/60 ring-2 ring-cyan-500/15' : 'border-white/10 hover:border-white/20'}`}>
    <div className="flex min-w-0 items-start justify-between gap-3">
      <div className="min-w-0"><p className="text-xs font-medium uppercase tracking-[0.15em] text-cyan-400">{job.department || 'Unassigned department'}</p><h2 className="mt-1 truncate text-lg font-semibold text-white">{job.title || 'Untitled job'}</h2></div>
      <JobStatusBadge status={job.status} />
    </div>
    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400"><span className="inline-flex items-center gap-1.5"><MapPin size={14} />{job.location || 'Location unavailable'}</span><span className="inline-flex items-center gap-1.5"><BriefcaseBusiness size={14} />{job.employmentType || 'Type unavailable'}</span><span className="inline-flex items-center gap-1.5"><CalendarDays size={14} />{formatDate(job.deadline)}</span></div>
    <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-white/[0.03] p-3 text-xs"><div><p className="text-slate-500">Experience</p><p className="mt-1 font-medium text-slate-200">{job.experienceRequired || 'Not specified'}</p></div><div><p className="text-slate-500">Salary</p><p className="mt-1 font-medium text-slate-200">{job.salaryRange || 'Not disclosed'}</p></div><div><p className="text-slate-500">Applicants</p><p className="mt-1 inline-flex items-center gap-1 font-medium text-slate-200"><Users size={13} />{applicantCount}</p></div><div><p className="text-slate-500">Openings / Threshold</p><p className="mt-1 font-medium text-slate-200">{job.openings || 0} · {Number(job.minimumMatchScore) || 0}%</p></div></div>
    <div className="mt-4"><p className="text-xs text-slate-500">Required skills</p><div className="mt-2 flex flex-wrap gap-1.5">{job.requiredSkills?.length ? job.requiredSkills.slice(0, 5).map((skill) => <span key={skill} className="rounded-lg bg-cyan-500/10 px-2 py-1 text-[11px] text-cyan-200">{skill}</span>) : <span className="text-xs text-slate-600">No skills specified</span>}{job.requiredSkills?.length > 5 && <span className="rounded-lg bg-white/5 px-2 py-1 text-[11px] text-slate-400">+{job.requiredSkills.length - 5}</span>}</div></div>
    <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
      <button type="button" onClick={onView} className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400"><Eye size={14} />Details</button>
      <button type="button" onClick={onEdit} className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white" aria-label={`Edit ${job.title}`}><Pencil size={14} /></button>
      <button type="button" onClick={onCopy} className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white" aria-label={`Copy ${job.title} details`}><Copy size={14} /></button>
      <button type="button" onClick={onDuplicate} className="rounded-lg border border-white/10 px-2.5 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-white">Duplicate</button>
      <button type="button" onClick={() => onStatusChange(job.status === 'Open' ? 'Closed' : 'Open')} className="rounded-lg border border-white/10 px-2.5 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-white">{job.status === 'Open' ? 'Close' : 'Open'}</button>
      <button type="button" onClick={onDelete} className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-rose-500/10 hover:text-rose-300" aria-label={`Delete ${job.title}`}><Trash2 size={14} /></button>
    </div>
  </article>
);

export default JobCard;
