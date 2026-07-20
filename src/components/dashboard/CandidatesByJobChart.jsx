import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const CandidatesByJobChart = ({ candidates, jobs }) => {
  const data = useMemo(() => {
    const counts = candidates.reduce((result, candidate) => {
      if (candidate.appliedJobId) result[candidate.appliedJobId] = (result[candidate.appliedJobId] || 0) + 1;
      return result;
    }, {});
    return jobs
      .map((job) => ({ id: job.id, job: job.title || 'Untitled job', candidates: counts[job.id] || 0 }))
      .filter((item) => item.candidates > 0);
  }, [candidates, jobs]);

  return (
    <section className="min-w-0 rounded-2xl border border-white/10 bg-slate-900/70 p-5" aria-labelledby="candidates-job-title">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-400">Role demand</p>
      <h2 id="candidates-job-title" className="mt-1 text-lg font-semibold text-white">Candidates by job</h2>
      {data.length ? (
        <div className="mt-5 h-72 min-w-0" role="img" aria-label="Bar chart showing candidate count for each job">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 8, left: -20, bottom: 45 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="job" stroke="#64748b" tickLine={false} axisLine={false} fontSize={10} angle={-25} textAnchor="end" interval={0} height={70} />
              <YAxis allowDecimals={false} stroke="#64748b" tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12 }} />
              <Bar dataKey="candidates" name="Candidates" fill="#60a5fa" radius={[8, 8, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : <p className="grid h-72 place-items-center text-sm text-slate-500">No data available</p>}
    </section>
  );
};

export default CandidatesByJobChart;
