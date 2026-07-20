import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const funnelOrder = ['Applied', 'Screening', 'Shortlisted', 'Interview Scheduled', 'Interview Completed', 'Selected', 'Offer Sent', 'Hired', 'Rejected'];

const JobScoreDistribution = ({ candidates }) => {
  const { distribution, funnel } = useMemo(() => {
    const buckets = [{ range: '90–100', min: 90, max: 100 }, { range: '80–89', min: 80, max: 89 }, { range: '70–79', min: 70, max: 79 }, { range: '60–69', min: 60, max: 69 }, { range: 'Below 60', min: -Infinity, max: 59 }];
    const distributionData = buckets.map((bucket) => ({ range: bucket.range, candidates: candidates.filter((candidate) => { const score = Number(candidate.matchScore); return Number.isFinite(score) && score >= bucket.min && score <= bucket.max; }).length }));
    const counts = candidates.reduce((result, candidate) => { const status = candidate.status || 'Unknown'; result[status] = (result[status] || 0) + 1; return result; }, {});
    return { distribution: distributionData, funnel: funnelOrder.map((stage) => ({ stage, candidates: counts[stage] || 0 })).filter((item) => item.candidates > 0) };
  }, [candidates]);

  if (!candidates.length) return null;
  const tooltipStyle = { background: '#0f172a', border: '1px solid #334155', borderRadius: 12 };

  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-2">
      <section className="min-w-0 rounded-2xl border border-white/10 bg-slate-900/70 p-5" aria-labelledby="score-distribution-title"><h2 id="score-distribution-title" className="text-lg font-semibold text-white">Match-score distribution</h2><p className="mt-1 text-xs text-slate-500">Applicants grouped by AI match score</p><div className="mt-4 h-64" role="img" aria-label="Bar chart showing match score distribution"><ResponsiveContainer width="100%" height="100%"><BarChart data={distribution} margin={{ left: -20, right: 8 }}><CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="range" stroke="#64748b" axisLine={false} tickLine={false} fontSize={11} /><YAxis allowDecimals={false} stroke="#64748b" axisLine={false} tickLine={false} fontSize={11} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="candidates" fill="#22d3ee" radius={[7, 7, 0, 0]} /></BarChart></ResponsiveContainer></div></section>
      <section className="min-w-0 rounded-2xl border border-white/10 bg-slate-900/70 p-5" aria-labelledby="job-funnel-title"><h2 id="job-funnel-title" className="text-lg font-semibold text-white">Recruitment funnel</h2><p className="mt-1 text-xs text-slate-500">Current applicant stage progression</p><div className="mt-4 h-64" role="img" aria-label="Bar chart showing recruitment funnel for this job"><ResponsiveContainer width="100%" height="100%"><BarChart data={funnel} layout="vertical" margin={{ left: 24, right: 8 }}><CartesianGrid stroke="#1e293b" strokeDasharray="3 3" horizontal={false} /><XAxis type="number" allowDecimals={false} stroke="#64748b" axisLine={false} tickLine={false} fontSize={11} /><YAxis type="category" dataKey="stage" width={105} stroke="#64748b" axisLine={false} tickLine={false} fontSize={10} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="candidates" fill="#8b5cf6" radius={[0, 7, 7, 0]} /></BarChart></ResponsiveContainer></div></section>
    </div>
  );
};

export default JobScoreDistribution;
