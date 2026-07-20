import { useEffect, useState } from 'react';
import { BriefcaseBusiness, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

const splitSkills = (value = '') => {
  const seen = new Set();
  return value.split(',').map((skill) => skill.trim()).filter((skill) => {
    const key = skill.toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const toFormValues = (job) => ({
  title: job?.title || '', department: job?.department || '', location: job?.location || '',
  employmentType: job?.employmentType || '', experienceRequired: job?.experienceRequired || '',
  salaryRange: job?.salaryRange || '', requiredSkills: job?.requiredSkills?.join(', ') || '',
  preferredSkills: job?.preferredSkills?.join(', ') || '', description: job?.description || '',
  minimumMatchScore: job?.minimumMatchScore ?? 75, openings: job?.openings ?? 1,
  deadline: job?.deadline || '', status: job?.status || 'Draft',
});

const JobFormModal = ({ open, job, onClose, onSave }) => {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: toFormValues(job) });

  useEffect(() => { if (open) reset(toFormValues(job)); }, [open, job, reset]);
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => { if (event.key === 'Escape' && !saving) onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, saving]);

  if (!open) return null;

  const submit = async (values) => {
    if (saving) return;
    setSaving(true);
    const payload = {
      ...values,
      requiredSkills: splitSkills(values.requiredSkills),
      preferredSkills: splitSkills(values.preferredSkills),
      minimumMatchScore: Number(values.minimumMatchScore),
      openings: Number(values.openings),
    };
    const saved = await Promise.resolve(onSave(payload));
    setSaving(false);
    if (saved) onClose();
  };

  const inputClass = 'mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/40';
  const labelClass = 'text-xs font-medium text-slate-400';
  const errorText = (name) => errors[name] && <p className="mt-1 text-xs text-rose-300">{errors[name].message}</p>;

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/80 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-labelledby="job-form-title">
      <div className="mx-auto my-3 w-full max-w-3xl rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b border-white/10 bg-slate-900/95 px-5 py-4 backdrop-blur-xl sm:px-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-500/10 text-cyan-300"><BriefcaseBusiness size={19} /></span><div><p className="text-xs text-cyan-300">Job management</p><h2 id="job-form-title" className="text-lg font-semibold text-white">{job?.id ? 'Edit job' : 'Create job'}</h2></div></div><button type="button" onClick={onClose} disabled={saving} className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-white/5 hover:text-white" aria-label="Close job form"><X size={18} /></button></div>
        <form onSubmit={handleSubmit(submit)} className="space-y-5 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>Job title<input className={inputClass} {...register('title', { required: 'Job title is required' })} />{errorText('title')}</label>
            <label className={labelClass}>Department<input className={inputClass} {...register('department', { required: 'Department is required' })} />{errorText('department')}</label>
            <label className={labelClass}>Location<input className={inputClass} {...register('location', { required: 'Location is required' })} />{errorText('location')}</label>
            <label className={labelClass}>Employment type<select className={inputClass} {...register('employmentType', { required: 'Employment type is required' })}><option value="">Select type</option><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Hybrid</option><option>Remote</option><option>Internship</option></select>{errorText('employmentType')}</label>
            <label className={labelClass}>Experience required<input className={inputClass} placeholder="e.g. 3-5 years" {...register('experienceRequired', { validate: (value) => !/(^|\s)-\d/.test(value) || 'Experience cannot be negative' })} />{errorText('experienceRequired')}</label>
            <label className={labelClass}>Salary range<input className={inputClass} placeholder="e.g. ₹18-24 LPA" {...register('salaryRange')} /></label>
            <label className={labelClass}>Openings<input type="number" min="1" className={inputClass} {...register('openings', { required: 'Openings are required', min: { value: 1, message: 'Openings must be at least 1' } })} />{errorText('openings')}</label>
            <label className={labelClass}>Minimum match score<input type="number" min="0" max="100" className={inputClass} {...register('minimumMatchScore', { min: { value: 0, message: 'Score cannot be below 0' }, max: { value: 100, message: 'Score cannot exceed 100' } })} />{errorText('minimumMatchScore')}</label>
            <label className={labelClass}>Deadline<input type="date" className={inputClass} {...register('deadline', { validate: (value) => !value || !Number.isNaN(new Date(`${value}T00:00:00`).getTime()) || 'Enter a valid deadline' })} />{errorText('deadline')}</label>
            <label className={labelClass}>Status<select className={inputClass} {...register('status')}><option>Open</option><option>Closed</option><option>Draft</option><option>Paused</option></select></label>
          </div>
          <label className={`block ${labelClass}`}>Required skills<input className={inputClass} placeholder="React, TypeScript, REST APIs" {...register('requiredSkills', { validate: (value) => splitSkills(value).length > 0 || 'Add at least one required skill' })} />{errorText('requiredSkills')}<span className="mt-1 block text-[11px] font-normal text-slate-600">Separate skills with commas. Duplicates are removed automatically.</span></label>
          <label className={`block ${labelClass}`}>Preferred skills<input className={inputClass} placeholder="AWS, GraphQL, Design Systems" {...register('preferredSkills')} /></label>
          <label className={`block ${labelClass}`}>Description<textarea rows="5" className={`${inputClass} resize-y`} {...register('description', { required: 'Description is required', minLength: { value: 30, message: 'Description must contain at least 30 characters' } })} />{errorText('description')}</label>
          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} disabled={saving} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5">Cancel</button><button type="submit" disabled={saving} className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-wait disabled:opacity-60">{saving ? 'Saving…' : job?.id ? 'Save changes' : 'Create job'}</button></div>
        </form>
      </div>
    </div>
  );
};

export default JobFormModal;
