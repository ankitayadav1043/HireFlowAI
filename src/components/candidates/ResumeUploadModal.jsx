import { useEffect, useMemo, useRef, useState } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { parseResume } from '../../services/aiService';
import { calculateMatchScore } from '../../utils/calculateMatchScore';
import { normalizeSkills } from '../../utils/normalizeSkills';
import { useToast } from '../../context/ToastContext';
import MatchScoreBadge from './MatchScoreBadge';

const stages = ['Uploading', 'Extracting text', 'Parsing profile', 'Matching job', 'Generating recommendation', 'Saving candidate'];
const wait = () => new Promise((resolve) => window.setTimeout(resolve, 700 + Math.floor(Math.random() * 701)));

const ResumeUploadModal = ({ open, jobs, onClose, onSave }) => {
  const { error } = useToast();
  const requestRef = useRef(0);
  const [file, setFile] = useState(null); const [jobId, setJobId] = useState(''); const [stage, setStage] = useState(-1); const [parsed, setParsed] = useState(null); const [saving, setSaving] = useState(false);
  const resetAndClose = () => { requestRef.current += 1; setStage(-1); setParsed(null); setFile(null); setJobId(''); onClose(); };
  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => { if (event.key === 'Escape') { requestRef.current += 1; setStage(-1); setParsed(null); setFile(null); setJobId(''); onClose(); } };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open, onClose]);
  const selectedJob = jobs.find((job) => job.id === jobId);
  const analysis = useMemo(() => parsed && selectedJob ? calculateMatchScore({ ...parsed, skills: normalizeSkills(parsed.skills), projects: normalizeSkills(parsed.projects) }, selectedJob) : null, [parsed, selectedJob]);
  if (!open) return null;

  const chooseFile = (selected) => {
    if (!selected) return;
    if (!/\.(pdf|docx)$/i.test(selected.name)) { error('Only PDF and DOCX files are supported.'); return; }
    if (selected.size > 5 * 1024 * 1024) { error('Resume files must be 5 MB or smaller.'); return; }
    setFile(selected); setParsed(null);
  };
  const process = async () => {
    if (!file || !selectedJob) { error('Select a valid resume and job first.'); return; }
    const token = ++requestRef.current;
    for (let index = 0; index < 5; index += 1) { if (requestRef.current !== token) return; setStage(index); await wait(); }
    const result = await parseResume(file, selectedJob);
    if (requestRef.current !== token) return;
    setParsed(result); setStage(-1);
  };
  const confirm = async () => {
    if (!parsed || !analysis || saving) return;
    const token = ++requestRef.current; setSaving(true); setStage(5);
    await wait();
    if (requestRef.current !== token) return;
    const profile = { ...parsed, skills: normalizeSkills(parsed.skills), projects: normalizeSkills(parsed.projects), ...analysis, appliedJobId: selectedJob.id, appliedJob: selectedJob.title, applicationDate: new Date().toISOString().slice(0, 10) };
    const saved = onSave(profile); setSaving(false); setStage(-1); if (saved) resetAndClose();
  };
  const field = 'rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none';

  return <div className="fixed inset-0 z-[75] overflow-y-auto bg-slate-950/85 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="resume-upload-title"><div className="mx-auto my-5 w-full max-w-3xl rounded-3xl border border-white/10 bg-slate-900 p-5 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-xs text-cyan-300">Mock AI parser</p><h2 id="resume-upload-title" className="text-xl font-semibold text-white">Upload resume</h2></div><button type="button" onClick={resetAndClose} aria-label="Close resume upload"><X className="text-slate-500" /></button></div>
    {!parsed ? <><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="grid min-h-40 cursor-pointer place-items-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-center"><div><Upload className="mx-auto text-cyan-300" /><p className="mt-3 text-sm font-medium text-white">{file?.name || 'Choose PDF or DOCX'}</p><p className="mt-1 text-xs text-slate-500">{file ? `${(file.size / 1024).toFixed(1)} KB` : 'Maximum file size: 5 MB'}</p></div><input type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => chooseFile(event.target.files?.[0])} className="sr-only" /></label><label className="text-xs font-medium text-slate-400">Match against job<select value={jobId} onChange={(event) => setJobId(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-3 text-sm text-white"><option value="">Select job</option>{jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}</select><div className="mt-4 rounded-xl bg-white/[0.03] p-4 text-xs leading-5 text-slate-500">The parser creates realistic editable profile data from the filename and selected role. No file is uploaded to an external service.</div></label></div>{stage >= 0 && <div className="mt-6"><div className="h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-cyan-400 transition-all" style={{ width: `${((stage + 1) / stages.length) * 100}%` }} /></div><p className="mt-3 text-center text-sm text-cyan-300">{stages[stage]}…</p></div>}<div className="mt-6 flex justify-end gap-3"><button type="button" onClick={resetAndClose} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300">Cancel</button><button type="button" onClick={process} disabled={!file || !selectedJob || stage >= 0} className="rounded-xl bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 disabled:opacity-40">Parse resume</button></div></>
      : <><div className="mt-6 flex items-center justify-between rounded-2xl bg-cyan-500/5 p-4"><div className="flex items-center gap-3"><FileText className="text-cyan-300" /><div><p className="font-medium text-white">Parsed candidate preview</p><p className="text-xs text-slate-500">Edit fields before final confirmation</p></div></div><MatchScoreBadge score={analysis?.matchScore} /></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><input aria-label="Candidate name" value={parsed.name} onChange={(event) => setParsed((value) => ({ ...value, name: event.target.value }))} className={field} /><input aria-label="Candidate email" value={parsed.email} onChange={(event) => setParsed((value) => ({ ...value, email: event.target.value }))} className={field} /><input aria-label="Candidate location" value={parsed.location} onChange={(event) => setParsed((value) => ({ ...value, location: event.target.value }))} className={field} /><input aria-label="Experience years" type="number" min="0" value={parsed.experienceYears} onChange={(event) => setParsed((value) => ({ ...value, experienceYears: Number(event.target.value) }))} className={field} /><input aria-label="Education" value={parsed.education} onChange={(event) => setParsed((value) => ({ ...value, education: event.target.value }))} className={field} /><input aria-label="College" value={parsed.college} onChange={(event) => setParsed((value) => ({ ...value, college: event.target.value }))} className={field} /><textarea aria-label="Skills" value={Array.isArray(parsed.skills) ? parsed.skills.join(', ') : parsed.skills} onChange={(event) => setParsed((value) => ({ ...value, skills: event.target.value }))} className={`${field} sm:col-span-2`} /><textarea aria-label="Projects" value={Array.isArray(parsed.projects) ? parsed.projects.join(', ') : parsed.projects} onChange={(event) => setParsed((value) => ({ ...value, projects: event.target.value }))} className={`${field} sm:col-span-2`} /></div><div className="mt-4 rounded-xl bg-white/[0.03] p-4 text-sm text-slate-400"><p><span className="text-slate-500">Recommendation:</span> {analysis?.aiRecommendation}</p><p className="mt-1"><span className="text-slate-500">Matched:</span> {analysis?.matchedSkills.join(', ') || 'None'}</p></div><div className="mt-6 flex justify-between"><button type="button" onClick={() => setParsed(null)} className="text-sm text-slate-400">Back</button><button type="button" onClick={confirm} disabled={saving} className="rounded-xl bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50">{saving ? stages[5] + '…' : 'Confirm and save'}</button></div></>}
  </div></div>;
};
export default ResumeUploadModal;
