import { lazy, Suspense, useMemo } from 'react';
import { BriefcaseBusiness, CalendarClock, CheckCircle2, Gauge, Target, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ActiveAutomations from '../components/dashboard/ActiveAutomations';
import MetricCard from '../components/dashboard/MetricCard';
import QuickActions from '../components/dashboard/QuickActions';
import RecentActivities from '../components/dashboard/RecentActivities';
import TopCandidates from '../components/dashboard/TopCandidates';
import UpcomingInterviews from '../components/dashboard/UpcomingInterviews';
import PageHeader from '../components/common/PageHeader';
import RouteLoader from '../components/common/RouteLoader';
import { useRecruitment } from '../context/RecruitmentContext';

const ApplicationsTrendChart=lazy(()=>import('../components/dashboard/ApplicationsTrendChart'));
const RecruitmentFunnelChart=lazy(()=>import('../components/dashboard/RecruitmentFunnelChart'));
const CandidateStatusChart=lazy(()=>import('../components/dashboard/CandidateStatusChart'));
const CandidatesByJobChart=lazy(()=>import('../components/dashboard/CandidatesByJobChart'));

const DashboardSkeleton = () => (
  <div className="animate-pulse space-y-6" aria-label="Loading recruitment dashboard">
    <div className="h-16 max-w-xl rounded-2xl bg-slate-900/70" />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-36 rounded-2xl bg-slate-900/70" />)}</div>
    <div className="grid gap-5 xl:grid-cols-2"><div className="h-80 rounded-2xl bg-slate-900/70" /><div className="h-80 rounded-2xl bg-slate-900/70" /></div>
  </div>
);

const DashboardPage = () => {
  const { jobs, candidates, interviews, automations, activities, loading, runAutomation } = useRecruitment();
  const navigate = useNavigate();

  const metrics = useMemo(() => {
    const normalizedStatus = (value) => typeof value === 'string' ? value.trim().toLowerCase() : 'unknown';
    const openJobs = jobs.filter((job) => normalizedStatus(job.status) === 'open').length;
    const scheduledInterviews = interviews.filter((interview) => normalizedStatus(interview.status) === 'scheduled').length;
    const selectedStatuses = new Set(['selected', 'offer sent', 'hired']);
    const selectedCandidates = candidates.filter((candidate) => selectedStatuses.has(normalizedStatus(candidate.status))).length;
    const validScores = candidates.map((candidate) => Number(candidate.matchScore)).filter(Number.isFinite);
    const averageMatchScore = validScores.length ? validScores.reduce((total, score) => total + score, 0) / validScores.length : 0;
    const hiredCandidates = candidates.filter((candidate) => normalizedStatus(candidate.status) === 'hired').length;
    const conversionRate = candidates.length ? (hiredCandidates / candidates.length) * 100 : 0;
    const formatPercent = (value) => `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)}%`;

    return [
      { title: 'Total Candidates', value: candidates.length.toLocaleString('en-IN'), description: 'Profiles across the recruitment pipeline', icon: Users, accent: 'cyan' },
      { title: 'Open Jobs', value: openJobs.toLocaleString('en-IN'), description: `${jobs.length.toLocaleString('en-IN')} total requisitions`, icon: BriefcaseBusiness, accent: 'violet' },
      { title: 'Interviews Scheduled', value: scheduledInterviews.toLocaleString('en-IN'), description: 'Upcoming confirmed interview rounds', icon: CalendarClock, accent: 'blue' },
      { title: 'Selected Candidates', value: selectedCandidates.toLocaleString('en-IN'), description: 'Selected, offered, or hired talent', icon: CheckCircle2, accent: 'emerald' },
      { title: 'Average Match Score', value: formatPercent(averageMatchScore), description: 'Average AI fit across scored candidates', icon: Gauge, accent: 'amber' },
      { title: 'Hiring Conversion Rate', value: formatPercent(conversionRate), description: `${hiredCandidates.toLocaleString('en-IN')} hired from ${candidates.length.toLocaleString('en-IN')} candidates`, icon: Target, accent: 'rose' },
    ];
  }, [jobs, candidates, interviews]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="min-w-0 space-y-7 overflow-hidden">
      <PageHeader
        eyebrow="Recruitment command center"
        title="Good morning, Ankit"
        description="Monitor hiring performance, surface top talent, and keep every recruiting workflow moving."
        actions={<button type="button" onClick={() => navigate('/reports')} className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10">View reports</button>}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Recruitment metrics">
        {metrics.map((metric) => <MetricCard key={metric.title} {...metric} />)}
      </section>

      <QuickActions automations={automations} runAutomation={runAutomation} />

      <Suspense fallback={<RouteLoader compact />}><div className="grid min-w-0 gap-5 xl:grid-cols-2">
        <ApplicationsTrendChart candidates={candidates} />
        <RecruitmentFunnelChart candidates={candidates} />
        <CandidateStatusChart candidates={candidates} />
        <CandidatesByJobChart candidates={candidates} jobs={jobs} />
      </div></Suspense>

      <div className="grid min-w-0 gap-5 xl:grid-cols-2">
        <UpcomingInterviews interviews={interviews} />
        <TopCandidates candidates={candidates} />
      </div>

      <div className="grid min-w-0 gap-5 xl:grid-cols-2">
        <RecentActivities activities={activities} />
        <ActiveAutomations automations={automations} onRun={runAutomation} />
      </div>
    </div>
  );
};

export default DashboardPage;