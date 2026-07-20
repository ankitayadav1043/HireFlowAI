const MatchScoreBadge = ({ score, compact = false }) => {
  const value = Math.min(100, Math.max(0, Math.round(Number(score) || 0)));
  const color = value >= 85 ? 'text-emerald-300 bg-emerald-500/10' : value >= 70 ? 'text-cyan-300 bg-cyan-500/10' : value >= 55 ? 'text-amber-300 bg-amber-500/10' : 'text-rose-300 bg-rose-500/10';
  return <span className={`inline-flex items-center justify-center rounded-lg font-semibold ${color} ${compact ? 'px-2 py-1 text-xs' : 'h-12 min-w-16 px-3 text-lg'}`}>{value}%</span>;
};
export default MatchScoreBadge;
