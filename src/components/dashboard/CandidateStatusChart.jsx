import { useMemo } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const colors = ['#22d3ee', '#8b5cf6', '#34d399', '#f59e0b', '#60a5fa', '#fb7185', '#a3e635', '#f472b6', '#94a3b8'];

const CandidateStatusChart = ({ candidates }) => {
  const data = useMemo(() => {
    const totals = new Map();
    candidates.forEach((candidate) => {
      const status = typeof candidate.status === 'string' && candidate.status.trim() ? candidate.status.trim() : 'Unknown';
      totals.set(status, (totals.get(status) || 0) + 1);
    });
    return [...totals.entries()].map(([name, value]) => ({ name, value }));
  }, [candidates]);

  return (
    <section className="min-w-0 rounded-2xl border border-white/10 bg-slate-900/70 p-5" aria-labelledby="status-chart-title">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-400">Pipeline mix</p>
      <h2 id="status-chart-title" className="mt-1 text-lg font-semibold text-white">Candidate status distribution</h2>
      {data.length ? (
        <div className="mt-4 h-72 min-w-0" role="img" aria-label="Donut chart showing candidate status distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="43%" innerRadius={54} outerRadius={82} paddingAngle={3}>
                {data.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : <p className="grid h-72 place-items-center text-sm text-slate-500">No data available</p>}
    </section>
  );
};

export default CandidateStatusChart;
