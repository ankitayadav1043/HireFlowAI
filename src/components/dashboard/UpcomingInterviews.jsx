import { useMemo } from 'react';
import { CalendarClock, Clock3, Video } from 'lucide-react';

const UpcomingInterviews = ({ interviews }) => {
  const upcoming = useMemo(() => interviews
    .filter((interview) => interview.status === 'Scheduled')
    .map((interview) => ({ ...interview, startsAt: new Date(`${interview.date}T${interview.time || '00:00'}`) }))
    .filter((interview) => !Number.isNaN(interview.startsAt.getTime()))
    .sort((first, second) => first.startsAt - second.startsAt)
    .slice(0, 4), [interviews]);

  const dateFormatter = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', weekday: 'short' });

  return (
    <section className="min-w-0 rounded-2xl border border-white/10 bg-slate-900/70 p-5" aria-labelledby="upcoming-interviews-title">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-400">Calendar</p><h2 id="upcoming-interviews-title" className="mt-1 text-lg font-semibold text-white">Upcoming interviews</h2></div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-500/10 text-cyan-300"><CalendarClock size={19} /></span>
      </div>
      {upcoming.length ? (
        <ul className="mt-5 space-y-3">
          {upcoming.map((interview) => (
            <li key={interview.id} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3.5">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0"><p className="truncate text-sm font-medium text-white">{interview.candidateName || 'Unknown candidate'}</p><p className="truncate text-xs text-slate-500">{interview.jobTitle || 'Unassigned role'}</p></div>
                <span className="shrink-0 rounded-lg bg-slate-800 px-2 py-1 text-[11px] text-slate-300">{interview.interviewType || 'Interview'}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5"><Clock3 size={13} />{dateFormatter.format(interview.startsAt)} · {interview.time}</span>
                {interview.meetingLink && <span className="inline-flex items-center gap-1.5 text-cyan-400"><Video size={13} />Online</span>}
              </div>
            </li>
          ))}
        </ul>
      ) : <p className="grid min-h-48 place-items-center text-sm text-slate-500">No upcoming interviews</p>}
    </section>
  );
};

export default UpcomingInterviews;
