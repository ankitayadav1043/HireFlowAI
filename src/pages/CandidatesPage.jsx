import { createElement, lazy, Suspense, useMemo, useState } from 'react';
import { Columns3, Grid2X2, List, Plus, Trophy, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AddCandidateModal from '../components/candidates/AddCandidateModal';
import CandidateCard from '../components/candidates/CandidateCard';
import CandidateFilters from '../components/candidates/CandidateFilters';
import CandidateTable from '../components/candidates/CandidateTable';
import DeleteCandidateModal from '../components/candidates/DeleteCandidateModal';
import ResumeUploadModal from '../components/candidates/ResumeUploadModal';
import PageHeader from '../components/common/PageHeader';
import RouteLoader from '../components/common/RouteLoader';
import { useRecruitment } from '../context/RecruitmentContext';
import { useToast } from '../context/ToastContext';

const CandidateRanking=lazy(()=>import('../components/candidates/CandidateRanking'));
const RecruitmentPipeline=lazy(()=>import('../components/candidates/RecruitmentPipeline'));
const pipelineStatuses=['Applied','Screening','Shortlisted','Interview Scheduled','Interview Completed','Selected','Offer Sent','Hired','Rejected'];
const defaults = { search: '', job: '', status: '', score: '', experience: '', source: '', skill: '', recommendation: '', sort: 'score-high' };
const safeTime = (value, fallback) => { const time = value ? new Date(`${value}T00:00:00`).getTime() : Number.NaN; return Number.isNaN(time) ? fallback : time; };
const recommendationLabel = (candidate) => { const score = Number(candidate.matchScore) || 0; return score >= 85 ? 'Highly Recommended' : score >= 70 ? 'Recommended' : score >= 55 ? 'Manual Review' : 'Not Recommended'; };

const CandidatesPage = () => {
  const { candidates, jobs, interviews, loading, addCandidate, updateCandidate, deleteCandidate, changeCandidateStatus, shortlistCandidate, rejectCandidate, selectCandidate } = useRecruitment();
  const { success, error } = useToast(); const navigate = useNavigate();
  const [view, setView] = useState('table'); const [filters, setFilters] = useState(defaults); const [page, setPage] = useState(1); const [formOpen, setFormOpen] = useState(false); const [resumeOpen, setResumeOpen] = useState(false); const [editing, setEditing] = useState(null); const [deleting, setDeleting] = useState(null);
  const options = useMemo(() => ({ jobs, statuses: [...new Set(candidates.map((item) => item.status).filter(Boolean))].sort(), sources: [...new Set(candidates.map((item) => item.source).filter(Boolean))].sort(), skills: [...new Set(candidates.flatMap((item) => item.skills || []))].sort() }), [jobs, candidates]);
  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const [minExp, maxExp] = filters.experience === '10+' ? [10, Infinity] : filters.experience ? filters.experience.split('-').map(Number) : [0, Infinity];
    return candidates.filter((candidate) => {
      const text = [candidate.name, candidate.email, candidate.college, candidate.appliedJob, candidate.location, ...(candidate.skills || [])].filter(Boolean).join(' ').toLowerCase();
      const experience = Number(candidate.experienceYears) || 0;
      return (!search || text.includes(search)) && (!filters.job || candidate.appliedJobId === filters.job) && (!filters.status || candidate.status === filters.status) && (!filters.score || Number(candidate.matchScore) >= Number(filters.score)) && (!filters.experience || (experience >= minExp && experience <= maxExp)) && (!filters.source || candidate.source === filters.source) && (!filters.skill || candidate.skills?.includes(filters.skill)) && (!filters.recommendation || recommendationLabel(candidate) === filters.recommendation);
    }).sort((first, second) => {
      if (filters.sort === 'score-low') return Number(first.matchScore || 0) - Number(second.matchScore || 0);
      if (filters.sort === 'newest') return safeTime(second.applicationDate, 0) - safeTime(first.applicationDate, 0);
      if (filters.sort === 'oldest') return safeTime(first.applicationDate, Number.MAX_SAFE_INTEGER) - safeTime(second.applicationDate, Number.MAX_SAFE_INTEGER);
      if (filters.sort === 'experience-high') return Number(second.experienceYears || 0) - Number(first.experienceYears || 0);
      if (filters.sort === 'experience-low') return Number(first.experienceYears || 0) - Number(second.experienceYears || 0);
      if (filters.sort === 'name') return (first.name || '').localeCompare(second.name || '');
      return Number(second.matchScore || 0) - Number(first.matchScore || 0);
    });
  }, [candidates, filters]);
  const pageSize = view === 'cards' ? 8 : 10; const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize)); const currentPage = Math.min(page, pageCount); const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const changeFilter = (name, value) => { setFilters((current) => ({ ...current, [name]: value })); setPage(1); }; const clear = () => { setFilters(defaults); setPage(1); }; const changeView = (next) => { setView(next); setPage(1); };
  const viewCandidate = (candidate) => navigate(`/candidates/${candidate.id}`); const editCandidate = (candidate) => { setEditing(candidate); setFormOpen(true); };
  const save = (payload) => editing ? updateCandidate(editing.id, payload) : addCandidate(payload);
  const saveResume = (payload) => { if (candidates.some((item) => item.email?.toLowerCase() === payload.email?.toLowerCase())) { error('A candidate with this email already exists.'); return null; } return addCandidate(payload); };
  const remove = (force) => { if (deleteCandidate(deleting.id, { force })) setDeleting(null); };
  const move = (candidate, status) => { if (status === 'Shortlisted') return shortlistCandidate(candidate.id); if (status === 'Rejected') return rejectCandidate(candidate.id); if (status === 'Selected') return selectCandidate(candidate.id); return changeCandidateStatus(candidate.id, status); };
  const copyEmail = async (candidate) => { try { await navigator.clipboard.writeText(candidate.email || ''); success('Candidate email copied.', 'Copied'); } catch { error('Clipboard access is unavailable.'); } };
  const download = (candidate) => { const blob = new Blob([`Mock resume for ${candidate.name}\n${candidate.email}\nSkills: ${(candidate.skills || []).join(', ')}`], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = candidate.resumeFile || `${candidate.id}-resume.txt`; anchor.click(); URL.revokeObjectURL(url); };
  if (loading) return <div className="h-96 animate-pulse rounded-3xl bg-slate-900/70" />;

  const actions = { onView: viewCandidate, onEdit: editCandidate, onDelete: setDeleting, onCopyEmail: copyEmail, onDownload: download };
  return <div className="min-w-0 space-y-6"><PageHeader eyebrow="Talent intelligence" title="Candidates" description="Review applicants, compare AI fit, and move talent through every hiring stage." actions={<div className="flex gap-2"><button type="button" onClick={() => setResumeOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-200"><Upload size={16} />Upload resume</button><button type="button" onClick={() => { setEditing(null); setFormOpen(true); }} className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950"><Plus size={16} />Add candidate</button></div>} />
    <CandidateFilters filters={filters} options={options} onChange={changeFilter} onClear={clear} />
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-slate-500">Showing {filtered.length} of {candidates.length} candidates</p><div className="flex overflow-x-auto rounded-xl border border-white/10 bg-slate-900/60 p-1">{[['table', List, 'Table'], ['cards', Grid2X2, 'Cards'], ['ranking', Trophy, 'Ranking'], ['pipeline', Columns3, 'Pipeline']].map(([name, icon, label]) => <button key={name} type="button" onClick={() => changeView(name)} className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs ${view === name ? 'bg-cyan-500/15 text-cyan-300' : 'text-slate-500'}`}>{createElement(icon, { size: 14 })}{label}</button>)}</div></div>
    {!candidates.length ? <div className="grid min-h-64 place-items-center text-slate-500">No candidates available</div> : !filtered.length && view !== 'ranking' && view !== 'pipeline' ? <div className="grid min-h-64 place-items-center text-center"><div><p className="text-slate-400">{filters.job ? 'No candidates for selected job' : 'No candidates match filters'}</p><button type="button" onClick={clear} className="mt-2 text-sm text-cyan-300">Clear filters</button></div></div> : view === 'table' ? <CandidateTable candidates={visible} {...actions} /> : view === 'cards' ? <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">{visible.map((candidate) => <CandidateCard key={candidate.id} candidate={candidate} statuses={pipelineStatuses} onView={() => viewCandidate(candidate)} onEdit={() => editCandidate(candidate)} onDelete={() => setDeleting(candidate)} onCopyEmail={() => copyEmail(candidate)} onDownload={() => download(candidate)} onStatusChange={(status) => move(candidate, status)} />)}</div> : view === 'ranking' ? <Suspense fallback={<RouteLoader compact/>}><CandidateRanking candidates={candidates} jobs={jobs} onView={viewCandidate} onShortlist={(candidate) => shortlistCandidate(candidate.id)} onReject={(candidate) => rejectCandidate(candidate.id)} onSelect={(candidate) => selectCandidate(candidate.id)} /></Suspense> : <Suspense fallback={<RouteLoader compact/>}><RecruitmentPipeline candidates={filtered} onMove={move} onView={viewCandidate} /></Suspense>}
    {(view === 'table' || view === 'cards') && filtered.length > pageSize && <nav className="flex items-center justify-between"><button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-400 disabled:opacity-30">Previous</button><span className="text-xs text-slate-500">Page {currentPage} of {pageCount}</span><button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-400 disabled:opacity-30">Next</button></nav>}
    <AddCandidateModal open={formOpen} candidate={editing} candidates={candidates} jobs={jobs} onClose={() => setFormOpen(false)} onSave={save} /><ResumeUploadModal open={resumeOpen} jobs={jobs} onClose={() => setResumeOpen(false)} onSave={saveResume} /><DeleteCandidateModal candidate={deleting} linkedInterviews={deleting ? interviews.filter((item) => item.candidateId === deleting.id).length : 0} onClose={() => setDeleting(null)} onDelete={remove} />
  </div>;
};
export default CandidatesPage;