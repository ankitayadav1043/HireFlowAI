import { lazy, Suspense, useMemo, useState } from 'react';
import { ArrowLeft, BriefcaseBusiness, CalendarDays, MapPin, Pencil, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import DeleteJobModal from '../components/jobs/DeleteJobModal';
import JobApplicantsTable from '../components/jobs/JobApplicantsTable';
import JobFormModal from '../components/jobs/JobFormModal';
import JobStatusBadge from '../components/jobs/JobStatusBadge';
import PageHeader from '../components/common/PageHeader';
import RouteLoader from '../components/common/RouteLoader';
import { useRecruitment } from '../context/RecruitmentContext';

const JobScoreDistribution=lazy(()=>import('../components/jobs/JobScoreDistribution'));
const formatDate = (value) => {
  const date = value ? new Date(`${value}T00:00:00`) : null;
  return date && !Number.isNaN(date.getTime()) ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).format(date) : 'Not specified';
};

const JobDetailsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { jobs, candidates, loading, updateJob, deleteJob, changeJobStatus } = useRecruitment();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const job = jobs.find((item) => item.id === jobId);

  const applicants = useMemo(() => candidates
    .filter((candidate) => candidate.appliedJobId === jobId)
    .sort((first, second) => Number(second.matchScore || 0) - Number(first.matchScore || 0)), [candidates, jobId]);

  const statistics = useMemo(() => {
    const normalized = (status) => typeof status === 'string' ? status.trim().toLowerCase() : 'unknown';
    const count = (...statuses) => applicants.filter((candidate) => statuses.includes(normalized(candidate.status))).length;
    const scores = applicants.map((candidate) => Number(candidate.matchScore)).filter(Number.isFinite);
    return [
      ['Total applicants', applicants.length], ['Shortlisted', count('shortlisted')],
      ['Interviews', count('interview scheduled', 'interview completed')], ['Selected', count('selected', 'offer sent')],
      ['Hired', count('hired')], ['Rejected', count('rejected')],
      ['Average match', `${scores.length ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(0) : 0}%`],
    ];
  }, [applicants]);

  if (loading) return <div className="h-96 animate-pulse rounded-3xl bg-slate-900/70" />;
  if (!job) return <div className="grid min-h-[60vh] place-items-center text-center"><div><BriefcaseBusiness size={38} className="mx-auto text-slate-600" /><h1 className="mt-4 text-2xl font-semibold text-white">Job not found</h1><p className="mt-2 text-sm text-slate-500">This job may have been deleted or the link is invalid.</p><button type="button" onClick={() => navigate('/jobs')} className="mt-5 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950">Back to jobs</button></div></div>;

  const confirmDelete = (force) => { if (deleteJob(job.id, { force })) navigate('/jobs'); };
  const details = [
    ['Location', job.location || 'Not specified'], ['Employment type', job.employmentType || 'Not specified'],
    ['Experience required', job.experienceRequired || 'Not specified'], ['Salary range', job.salaryRange || 'Not disclosed'],
    ['Openings', job.openings || 0], ['Deadline', formatDate(job.deadline)],
    ['Created', formatDate(job.createdAt)], ['Minimum match score', `${Number(job.minimumMatchScore) || 0}%`],
  ];

  return (
    <div className="min-w-0 space-y-6">
      <button type="button" onClick={() => navigate('/jobs')} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white"><ArrowLeft size={16} />Back to jobs</button>
      <PageHeader eyebrow={job.department || 'Job details'} title={job.title || 'Untitled job'} description={`Review role requirements, applicant quality, and recruitment progress for this position.`} actions={<div className="flex flex-wrap gap-2"><JobStatusBadge status={job.status} /><button type="button" onClick={() => setEditOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/5"><Pencil size={15} />Edit</button><button type="button" onClick={() => changeJobStatus(job.id, job.status === 'Open' ? 'Closed' : 'Open')} className="rounded-xl bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950">{job.status === 'Open' ? 'Close job' : 'Open job'}</button><button type="button" onClick={() => setDeleteOpen(true)} className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-rose-500/10 hover:text-rose-300" aria-label="Delete job"><Trash2 size={16} /></button></div>} />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Job overview">{details.map(([label, value], index) => <div key={label} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4"><p className="flex items-center gap-1.5 text-xs text-slate-500">{index === 0 ? <MapPin size={13} /> : index === 5 || index === 6 ? <CalendarDays size={13} /> : <BriefcaseBusiness size={13} />}{label}</p><p className="mt-2 text-sm font-medium text-slate-200">{value}</p></div>)}</section>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
        <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-5"><h2 className="text-lg font-semibold text-white">Job description</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-400">{job.description || 'No description available.'}</p></section>
        <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-5"><h2 className="text-lg font-semibold text-white">Skills</h2><p className="mt-4 text-xs font-medium text-slate-500">Required</p><div className="mt-2 flex flex-wrap gap-2">{job.requiredSkills?.length ? job.requiredSkills.map((skill) => <span key={skill} className="rounded-lg bg-cyan-500/10 px-2.5 py-1.5 text-xs text-cyan-200">{skill}</span>) : <span className="text-sm text-slate-600">None specified</span>}</div><p className="mt-5 text-xs font-medium text-slate-500">Preferred</p><div className="mt-2 flex flex-wrap gap-2">{job.preferredSkills?.length ? job.preferredSkills.map((skill) => <span key={skill} className="rounded-lg bg-violet-500/10 px-2.5 py-1.5 text-xs text-violet-200">{skill}</span>) : <span className="text-sm text-slate-600">None specified</span>}</div></section>
      </div>

      <section><h2 className="mb-3 text-lg font-semibold text-white">Applicant statistics</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">{statistics.map(([label, value]) => <div key={label} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{value}</p></div>)}</div></section>

      <Suspense fallback={<RouteLoader compact />}><JobScoreDistribution candidates={applicants} /></Suspense>
      <section><div className="mb-3"><h2 className="text-lg font-semibold text-white">Candidate ranking</h2><p className="mt-1 text-xs text-slate-500">Ranked by match score. Candidates at or above {Number(job.minimumMatchScore) || 0}% are highlighted.</p></div><JobApplicantsTable candidates={applicants} threshold={Number(job.minimumMatchScore) || 0} onViewCandidate={(candidate) => navigate(`/candidates/${candidate.id}`)} /></section>

      <JobFormModal open={editOpen} job={job} onClose={() => setEditOpen(false)} onSave={(payload) => updateJob(job.id, payload)} />
      <DeleteJobModal job={deleteOpen ? job : null} applicantCount={applicants.length} onClose={() => setDeleteOpen(false)} onDelete={confirmDelete} />
    </div>
  );
};

export default JobDetailsPage;
