import { useMemo } from 'react';
import { Activity, CalendarDays } from 'lucide-react';

const CandidateTimeline = ({ candidate, activities, interviews }) => {
  const events = useMemo(() => {
    const activityEvents = activities.filter((item) => item.relatedId === candidate.id).map((item) => ({ id: item.id, title: item.title, description: item.description, timestamp: item.timestamp, type: 'activity' }));
    const interviewEvents = interviews.filter((item) => item.candidateId === candidate.id).map((item) => ({ id: item.id, title: `${item.interviewType || 'Interview'} · ${item.status || 'Unknown'}`, description: `${item.interviewer || 'Interviewer unavailable'}${item.feedback ? ` — ${item.feedback}` : ''}`, timestamp: item.date ? `${item.date}T${item.time || '00:00'}` : null, type: 'interview' }));
    return [...activityEvents, ...interviewEvents].map((event) => ({ ...event, time: event.timestamp ? new Date(event.timestamp) : null })).sort((a, b) => (b.time && !Number.isNaN(b.time.getTime()) ? b.time.getTime() : 0) - (a.time && !Number.isNaN(a.time.getTime()) ? a.time.getTime() : 0));
  }, [candidate.id, activities, interviews]);
  return <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-5"><h2 className="text-lg font-semibold text-white">Recruitment timeline</h2><ol className="mt-5 space-y-4">{events.map((event) => <li key={`${event.type}-${event.id}`} className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5 text-slate-400">{event.type === 'interview' ? <CalendarDays size={16} /> : <Activity size={16} />}</span><div><p className="text-sm font-medium text-white">{event.title || 'Timeline update'}</p><p className="mt-0.5 text-xs leading-5 text-slate-500">{event.description || 'No details available'}</p><time className="text-[11px] text-slate-600">{event.time && !Number.isNaN(event.time.getTime()) ? event.time.toLocaleString('en-IN') : 'Timestamp unavailable'}</time></div></li>)}{!events.length && <li className="py-8 text-center text-sm text-slate-600">No timeline events available</li>}</ol></section>;
};
export default CandidateTimeline;
