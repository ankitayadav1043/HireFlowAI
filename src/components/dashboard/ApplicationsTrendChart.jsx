import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const formatDate = (value) => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date(`${value}T00:00:00`));

const ApplicationsTrendChart = ({ candidates }) => {
  const data = useMemo(() => {
    const totals = new Map();
    candidates.forEach((candidate) => {
      const date = candidate.applicationDate;
      const parsed = typeof date === 'string' ? new Date(`${date}T00:00:00`) : null;
      if (!parsed || Number.isNaN(parsed.getTime())) return;
      totals.set(date, (totals.get(date) || 0) + 1);
    });
    return [...totals.entries()]
      .sort(([first], [second]) => first.localeCompare(second))
      .map(([date, applications]) => ({ date, label: formatDate(date), applications }));
  }, [candidates]);

  return (
    <section className="min-w-0 rounded-2xl border border-white/10 bg-slate-900/70 p-5" aria-labelledby="applications-trend-title">
      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-400">Pipeline velocity</p>
        <h2 id="applications-trend-title" className="mt-1 text-lg font-semibold text-white">Candidate applications trend</h2>
      </div>
      {data.length ? (
        <div className="h-72 min-w-0" role="img" aria-label="Area chart showing candidate applications by application date">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs><linearGradient id="applications-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} /><stop offset="100%" stopColor="#22d3ee" stopOpacity={0.02} /></linearGradient></defs>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" stroke="#64748b" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis allowDecimals={false} stroke="#64748b" tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12 }} labelStyle={{ color: '#cbd5e1' }} />
              <Area type="monotone" dataKey="applications" name="Applications" stroke="#22d3ee" strokeWidth={2} fill="url(#applications-fill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : <p className="grid h-72 place-items-center text-sm text-slate-500">No data available</p>}
    </section>
  );
};

export default ApplicationsTrendChart;
