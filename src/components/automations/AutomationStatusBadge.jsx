const styles = { Active: 'bg-emerald-500/15 text-emerald-300', Paused: 'bg-amber-500/15 text-amber-300', Draft: 'bg-slate-500/15 text-slate-300', Archived: 'bg-violet-500/15 text-violet-300' };
export default function AutomationStatusBadge({ status }) { return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] || styles.Draft}`}>{status || 'Unknown'}</span>; }
