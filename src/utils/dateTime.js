export const combineDateAndTime = (date, time = '00:00') => {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const value = new Date(`${date}T${time}:00`);
  return Number.isNaN(value.getTime()) ? null : value;
};

export const formatInterviewDate = (date) => { const value = combineDateAndTime(date); return value ? new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(value) : 'Invalid date'; };
export const formatInterviewTime = (time) => { const value = combineDateAndTime('2000-01-01', time); return value ? new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(value) : 'Invalid time'; };
export const isPastInterview = (date, time, now = new Date()) => { const value = combineDateAndTime(date, time); return !value || value.getTime() < now.getTime(); };
export const detectOverlap = (first, second) => {
  const firstStart = combineDateAndTime(first.date, first.time); const secondStart = combineDateAndTime(second.date, second.time);
  if (!firstStart || !secondStart) return false;
  const firstEnd = firstStart.getTime() + (Number(first.duration) || 0) * 60000; const secondEnd = secondStart.getTime() + (Number(second.duration) || 0) * 60000;
  return firstStart.getTime() < secondEnd && secondStart.getTime() < firstEnd;
};
export const sortInterviewsByDateTime = (interviews, direction = 'asc') => [...interviews].sort((first, second) => { const a = combineDateAndTime(first.date, first.time)?.getTime() ?? (direction === 'asc' ? Infinity : -Infinity); const b = combineDateAndTime(second.date, second.time)?.getTime() ?? (direction === 'asc' ? Infinity : -Infinity); return direction === 'asc' ? a - b : b - a; });
export const getTodayISODate = () => { const now = new Date(); const offset = now.getTimezoneOffset() * 60000; return new Date(now.getTime() - offset).toISOString().slice(0, 10); };
