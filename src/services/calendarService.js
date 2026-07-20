const wait = () => new Promise((resolve) => window.setTimeout(resolve, 700 + Math.floor(Math.random() * 701)));
const token = () => Math.random().toString(36).slice(2, 10);
export const generateMockMeetingLink = async (mode = 'Google Meet') => { await wait(); const providers = { 'Google Meet': `https://meet.google.com/${token().slice(0, 3)}-${token().slice(0, 4)}-${token().slice(0, 3)}`, 'Microsoft Teams': `https://teams.microsoft.com/l/meetup-join/${token()}`, Zoom: `https://zoom.us/j/${Math.floor(100000000 + Math.random() * 900000000)}`, Phone: '', 'In-person': '' }; return providers[mode] ?? `https://meet.example.com/${token()}`; };
export const createMockCalendarEvent = async (interview) => { await wait(); return { eventId: `CAL-${token().toUpperCase()}`, status: 'created', interviewId: interview.id, calendarUrl: `https://calendar.example.com/event/${token()}` }; };
export const updateMockCalendarEvent = async (eventId, interview) => { await wait(); return { eventId: eventId || `CAL-${token().toUpperCase()}`, status: 'updated', interviewId: interview.id }; };
export const cancelMockCalendarEvent = async (eventId) => { await wait(); return { eventId, status: 'cancelled' }; };
