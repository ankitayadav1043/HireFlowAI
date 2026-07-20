import { useEffect, useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { calculateMatchScore } from '../../utils/calculateMatchScore';
import { normalizeSkills } from '../../utils/normalizeSkills';

const statuses = ['Applied', 'Screening', 'Shortlisted', 'Interview Scheduled', 'Interview Completed', 'Selected', 'Offer Sent', 'Hired', 'Rejected', 'On Hold', 'Withdrawn'];
const valuesFor = (candidate) => ({ name: candidate?.name || '', email: candidate?.email || '', phone: candidate?.phone || '', location: candidate?.location || '', appliedJobId: candidate?.appliedJobId || '', skills: candidate?.skills?.join(', ') || '', experienceYears: candidate?.experienceYears ?? 0, education: candidate?.education || '', college: candidate?.college || '', graduationYear: candidate?.graduationYear || '', certifications: candidate?.certifications?.join(', ') || '', projects: candidate?.projects?.join(', ') || '', source: candidate?.source || 'Manual', status: candidate?.status || 'Applied' });

const AddCandidateModal = ({ open, candidate, candidates, jobs, onClose, onSave }) => {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: valuesFor(candidate) });
  useEffect(() => { if (open) reset(valuesFor(candidate)); }, [open, candidate, reset]);
  useEffect(() => { if (!open) return undefined; const key = (event) => { if (event.key === 'Escape' && !saving) onClose(); }; window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key); }, [open, onClose, saving]);
  if (!open) return null;

  const submit = async (values) => {
    if (saving) return;
    setSaving(true);
    const job = jobs.find((item) => item.id === values.appliedJobId);
    const profile = { ...values, appliedJob: job.title, skills: normalizeSkills(values.skills), certifications: normalizeSkills(values.certifications), projects: normalizeSkills(values.projects), experienceYears: Number(values.experienceYears), graduationYear: values.graduationYear ? Number(values.graduationYear) : null };
    const analysis = calculateMatchScore(profile, job);
    const payload = { ...profile, ...analysis, summary: `${profile.name} has ${profile.experienceYears} years of experience and aligns with ${analysis.matchedSkills.length} required skills for ${job.title}.`, applicationDate: candidate?.applicationDate || new Date().toISOString().slice(0, 10), resumeFile: candidate?.resumeFile || `${profile.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-resume.pdf` };
    const saved = await Promise.resolve(onSave(payload)); setSaving(false); if (saved) onClose();
  };
  const field = 'mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/40';
  const label = 'text-xs font-medium text-slate-400';
  const error = (name) => errors[name] && <p className="mt-1 text-xs text-rose-300">{errors[name].message}</p>;

  return <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/80 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="candidate-form-title"><div className="mx-auto my-4 w-full max-w-4xl rounded-3xl border border-white/10 bg-slate-900"><div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b border-white/10 bg-slate-900/95 p-5"><div className="flex items-center gap-3"><UserPlus className="text-cyan-300" /><h2 id="candidate-form-title" className="text-lg font-semibold text-white">{candidate ? 'Edit candidate' : 'Add candidate'}</h2></div><button type="button" onClick={onClose} aria-label="Close candidate form"><X className="text-slate-500" size={19} /></button></div><form onSubmit={handleSubmit(submit)} className="space-y-5 p-5 sm:p-6"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <label className={label}>Name<input className={field} {...register('name', { required: 'Name is required' })} />{error('name')}</label>
    <label className={label}>Email<input type="email" className={field} {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' }, validate: (value) => !candidates.some((item) => item.id !== candidate?.id && item.email?.toLowerCase() === value.toLowerCase()) || 'A candidate with this email already exists' })} />{error('email')}</label>
    <label className={label}>Phone<input className={field} {...register('phone', { pattern: { value: /^$|^\+?[0-9\s-]{8,16}$/, message: 'Enter a valid phone number' } })} />{error('phone')}</label>
    <label className={label}>Location<input className={field} {...register('location')} /></label>
    <label className={label}>Applied job<select className={field} {...register('appliedJobId', { required: 'Applied job is required' })}><option value="">Select job</option>{jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}</select>{error('appliedJobId')}</label>
    <label className={label}>Experience years<input type="number" min="0" step="0.5" className={field} {...register('experienceYears', { min: { value: 0, message: 'Experience cannot be negative' } })} />{error('experienceYears')}</label>
    <label className={label}>Education<input className={field} {...register('education')} /></label><label className={label}>College<input className={field} {...register('college')} /></label>
    <label className={label}>Graduation year<input type="number" className={field} {...register('graduationYear', { min: { value: 1950, message: 'Enter a reasonable year' }, max: { value: new Date().getFullYear() + 6, message: 'Enter a reasonable year' } })} />{error('graduationYear')}</label>
    <label className={label}>Source<input className={field} {...register('source')} /></label><label className={label}>Status<select className={field} {...register('status')}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
  </div><label className={`block ${label}`}>Skills<input className={field} placeholder="React, TypeScript, SQL" {...register('skills', { validate: (value) => normalizeSkills(value).length > 0 || 'Add at least one skill' })} />{error('skills')}</label><label className={`block ${label}`}>Certifications<input className={field} {...register('certifications')} /></label><label className={`block ${label}`}>Projects<input className={field} {...register('projects')} /></label><p className="text-xs text-slate-500">AI match scores and recommendations are recalculated automatically when saved.</p><div className="flex justify-end gap-3 border-t border-white/10 pt-5"><button type="button" onClick={onClose} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300">Cancel</button><button disabled={saving} className="rounded-xl bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50">{saving ? 'Saving…' : candidate ? 'Save changes' : 'Add candidate'}</button></div></form></div></div>;
};
export default AddCandidateModal;
