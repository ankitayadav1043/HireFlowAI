import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const funnelStages = ['Applied', 'Screening', 'Shortlisted', 'Interview Scheduled', 'Interview Completed', 'Selected', 'Offer Sent', 'Hired'];

const RecruitmentFunnelChart = ({ candidates }) => {
  const data = useMemo(() => {
    const counts = candidates.reduce((result, candidate) => {
      const status = typeof candidate.status === 'string' && candidate.status.trim() ? candidate.status.trim() : 'Unknown';
      result[status] = (result[status] || 0) + 1;
      return result;
    }, {});
    return funnelStages.map((stage) => ({ stage, candidates: counts[stage] || 0 })).filter((item) => item.candidates > 0);
  }, [candidates]);

  return (
    <section className="min-w-0 rounded-2xl border border-white/10 bg-slate-900/70 p-5" aria-labelledby="funnel-title">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-violet-400">Stage health</p>
      <h2 id="funnel-title" className="mt-1 text-lg font-semibold text-white">Recruitment funnel</h2>
      {data.length ? (
        <div className="mt-5 h-72 min-w-0" role="img" aria-label="Horizontal bar chart showing candidates across recruitment stages">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, left: 18, bottom: 0 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} stroke="#64748b" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis type="category" dataKey="stage" width={112} stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={11} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12 }} />
              <Bar dataKey="candidates" name="Candidates" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : <p className="grid h-72 place-items-center text-sm text-slate-500">No data available</p>}
    </section>
  );
};

export default RecruitmentFunnelChart;
