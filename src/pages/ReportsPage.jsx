import { BarChart3, Download, TrendingUp } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';

const ReportsPage = () => (
  <div className="space-y-6">
    <PageHeader
      eyebrow="Analytics"
      title="Hiring reports"
      description="Track pipeline health, recruiting velocity, and hiring outcomes across every open role."
      actions={(
        <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
          <Download size={16} /> Export report
        </button>
      )}
    />
    <section className="grid gap-4 md:grid-cols-2">
      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
        <BarChart3 className="text-cyan-300" size={22} />
        <h2 className="mt-5 text-lg font-semibold text-white">Pipeline performance</h2>
        <p className="mt-2 text-sm text-slate-400">Conversion and stage-performance reporting is ready for your hiring data.</p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
        <TrendingUp className="text-emerald-300" size={22} />
        <h2 className="mt-5 text-lg font-semibold text-white">Hiring trends</h2>
        <p className="mt-2 text-sm text-slate-400">Compare time-to-hire, source quality, and offer acceptance over time.</p>
      </div>
    </section>
  </div>
);

export default ReportsPage;
