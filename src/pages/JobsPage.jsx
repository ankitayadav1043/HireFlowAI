import { useMemo, useState } from 'react';
import { Grid2X2, List, Plus, SearchX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DeleteJobModal from '../components/jobs/DeleteJobModal';
import JobCard from '../components/jobs/JobCard';
import JobFilters from '../components/jobs/JobFilters';
import JobFormModal from '../components/jobs/JobFormModal';
import JobTable from '../components/jobs/JobTable';
import PageHeader from '../components/common/PageHeader';
import { useRecruitment } from '../context/RecruitmentContext';
import { useToast } from '../context/ToastContext';

const defaultFilters = { search: '', department: '', location: '', employmentType: '', status: '', minimumScore: '', sort: 'newest' };
const safeTime = (value, fallback) => { const time = value ? new Date(`${value}T00:00:00`).getTime() : Number.NaN; return Number.isNaN(time) ? fallback : time; };

const JobsPage = () => {
  const { jobs, candidates, loading, addJob, updateJob, deleteJob, changeJobStatus } = useRecruitment();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [view, setView] = useState('cards');
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [formJob, setFormJob] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [highlightedId, setHighlightedId] = useState(null);

  const applicantCounts = useMemo(() => candidates.reduce((counts, candidate) => {
    if (candidate.appliedJobId) counts[candidate.appliedJobId] = (counts[candidate.appliedJobId] || 0) + 1;
    return counts;
  }, {}), [candidates]);

  const options = useMemo(() => ({
    departments: [...new Set(jobs.map((job) => job.department).filter(Boolean))].sort(),
    locations: [...new Set(jobs.map((job) => job.location).filter(Boolean))].sort(),
    employmentTypes: [...new Set(jobs.map((job) => job.employmentType).filter(Boolean))].sort(),
    statuses: [...new Set(jobs.map((job) => job.status).filter(Boolean))].sort(),
  }), [jobs]);

  const filteredJobs = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const minimumScore = filters.minimumScore === '' ? null : Number(filters.minimumScore);
    return jobs.filter((job) => {
      const searchable = [job.title, job.department, job.location, ...(job.requiredSkills || [])].filter(Boolean).join(' ').toLowerCase();
      return (!search || searchable.includes(search)) && (!filters.department || job.department === filters.department) && (!filters.location || job.location === filters.location) && (!filters.employmentType || job.employmentType === filters.employmentType) && (!filters.status || job.status === filters.status) && (minimumScore == null || Number(job.minimumMatchScore) >= minimumScore);
    }).sort((first, second) => {
      if (filters.sort === 'oldest') return safeTime(first.createdAt, Number.MAX_SAFE_INTEGER) - safeTime(second.createdAt, Number.MAX_SAFE_INTEGER);
      if (filters.sort === 'most-applicants') return (applicantCounts[second.id] || 0) - (applicantCounts[first.id] || 0);
      if (filters.sort === 'fewest-applicants') return (applicantCounts[first.id] || 0) - (applicantCounts[second.id] || 0);
      if (filters.sort === 'openings') return Number(second.openings || 0) - Number(first.openings || 0);
      if (filters.sort === 'deadline') return safeTime(first.deadline, Number.MAX_SAFE_INTEGER) - safeTime(second.deadline, Number.MAX_SAFE_INTEGER);
      if (filters.sort === 'title') return (first.title || '').localeCompare(second.title || '');
      return safeTime(second.createdAt, 0) - safeTime(first.createdAt, 0);
    });
  }, [jobs, filters, applicantCounts]);

  const pageSize = view === 'cards' ? 6 : 10;
  const pageCount = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleJobs = filteredJobs.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const changeFilter = (name, value) => { setFilters((current) => ({ ...current, [name]: value })); setPage(1); };
  const clearFilters = () => { setFilters(defaultFilters); setPage(1); };
  const changeView = (nextView) => { setView(nextView); setPage(1); };

  const openCreate = () => { setFormJob(null); setFormOpen(true); };
  const openEdit = (job) => { setFormJob(job); setFormOpen(true); };
  const duplicate = (job) => { setFormJob({ ...job, id: undefined, title: `${job.title} Copy`, status: 'Draft', applicants: 0, createdAt: new Date().toISOString().slice(0, 10) }); setFormOpen(true); };
  const saveJob = (payload) => {
    if (formJob?.id) return updateJob(formJob.id, payload);
    const created = addJob(payload);
    if (created) { setHighlightedId(created.id); setFilters(defaultFilters); setView('cards'); setPage(1); }
    return created;
  };
  const confirmDelete = (force) => { const deleted = deleteJob(deleteTarget.id, { force }); if (deleted) setDeleteTarget(null); };
  const copyDetails = async (job) => {
    const details = `${job.title}\n${job.department || ''} / ${job.location || ''}\n${job.employmentType || ''} / ${job.experienceRequired || ''}\nRequired skills: ${(job.requiredSkills || []).join(', ')}\n${job.description || ''}`;
    try { await navigator.clipboard.writeText(details); success(`${job.title} details copied.`, 'Copied'); } catch { error('Clipboard access is unavailable.'); }
  };

  if (loading) return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-80 animate-pulse rounded-2xl bg-slate-900/70" />)}</div>;

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader eyebrow="Job management" title="Jobs" description="Create, organise, and monitor every open requisition from one workspace." actions={<button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"><Plus size={17} />Create job</button>} />
      <JobFilters filters={filters} options={options} onChange={changeFilter} onClear={clearFilters} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-slate-500">Showing <span className="font-medium text-slate-300">{filteredJobs.length}</span> of {jobs.length} jobs</p><div className="inline-flex self-start rounded-xl border border-white/10 bg-slate-900/60 p-1"><button type="button" onClick={() => changeView('cards')} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${view === 'cards' ? 'bg-cyan-500/15 text-cyan-300' : 'text-slate-500 hover:text-white'}`} aria-pressed={view === 'cards'}><Grid2X2 size={14} />Cards</button><button type="button" onClick={() => changeView('table')} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${view === 'table' ? 'bg-cyan-500/15 text-cyan-300' : 'text-slate-500 hover:text-white'}`} aria-pressed={view === 'table'}><List size={15} />Table</button></div></div>

      {!jobs.length ? <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-6 text-center"><div><SearchX className="mx-auto text-slate-600" /><h2 className="mt-4 font-semibold text-white">No jobs available</h2><p className="mt-1 text-sm text-slate-500">Create your first requisition to start hiring.</p><button type="button" onClick={openCreate} className="mt-4 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">Create job</button></div></div>
        : !filteredJobs.length ? <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-white/10 bg-slate-900/40 text-center"><div><SearchX className="mx-auto text-slate-600" /><h2 className="mt-3 font-semibold text-white">No jobs match current filters</h2><button type="button" onClick={clearFilters} className="mt-3 text-sm text-cyan-300">Clear all filters</button></div></div>
          : view === 'cards' ? <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{visibleJobs.map((job) => <JobCard key={job.id} job={job} applicantCount={applicantCounts[job.id] || 0} highlighted={highlightedId === job.id} onView={() => navigate(`/jobs/${job.id}`)} onEdit={() => openEdit(job)} onDelete={() => setDeleteTarget(job)} onCopy={() => copyDetails(job)} onDuplicate={() => duplicate(job)} onStatusChange={(status) => changeJobStatus(job.id, status)} />)}</div>
            : <JobTable jobs={visibleJobs} applicantCounts={applicantCounts} onView={(job) => navigate(`/jobs/${job.id}`)} onEdit={openEdit} onDelete={setDeleteTarget} onCopy={copyDetails} onDuplicate={duplicate} onStatusChange={(job, status) => changeJobStatus(job.id, status)} />}

      {filteredJobs.length > pageSize && <nav className="flex items-center justify-between" aria-label="Job pagination"><button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-400 disabled:opacity-30">Previous</button><p className="text-xs text-slate-500">Page {currentPage} of {pageCount}</p><button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-400 disabled:opacity-30">Next</button></nav>}

      <JobFormModal open={formOpen} job={formJob} onClose={() => setFormOpen(false)} onSave={saveJob} />
      <DeleteJobModal job={deleteTarget} applicantCount={deleteTarget ? applicantCounts[deleteTarget.id] || 0 : 0} onClose={() => setDeleteTarget(null)} onDelete={confirmDelete} />
    </div>
  );
};

export default JobsPage;