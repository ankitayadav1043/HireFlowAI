import { Search, SlidersHorizontal, X } from 'lucide-react';

const JobFilters = ({ filters, options, onChange, onClear }) => {
  const fieldClass = 'h-10 min-w-0 rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-slate-300 outline-none transition focus:border-cyan-500/40';

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-4" aria-label="Job filters">
      <div className="flex flex-col gap-3 lg:flex-row">
        <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-3 focus-within:border-cyan-500/40"><Search size={17} className="shrink-0 text-slate-500" /><span className="sr-only">Search jobs</span><input value={filters.search} onChange={(event) => onChange('search', event.target.value)} placeholder="Search title, department, location or skill" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600" /></label>
        <select aria-label="Sort jobs" value={filters.sort} onChange={(event) => onChange('sort', event.target.value)} className={fieldClass}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="most-applicants">Most applicants</option><option value="fewest-applicants">Fewest applicants</option><option value="openings">Highest openings</option><option value="deadline">Deadline nearest</option><option value="title">Job title A–Z</option></select>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[['department', 'All departments', options.departments], ['location', 'All locations', options.locations], ['employmentType', 'All employment types', options.employmentTypes], ['status', 'All statuses', options.statuses]].map(([name, label, values]) => <select key={name} aria-label={label} value={filters[name]} onChange={(event) => onChange(name, event.target.value)} className={fieldClass}><option value="">{label}</option>{values.map((value) => <option key={value} value={value}>{value}</option>)}</select>)}
        <label className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-3 text-xs text-slate-500"><SlidersHorizontal size={15} /><span className="shrink-0">Min score</span><input type="number" min="0" max="100" value={filters.minimumScore} onChange={(event) => onChange('minimumScore', event.target.value)} className="min-w-0 flex-1 bg-transparent text-right text-sm text-white outline-none" /></label>
      </div>
      <button type="button" onClick={onClear} className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-200"><X size={14} />Clear filters</button>
    </section>
  );
};

export default JobFilters;
