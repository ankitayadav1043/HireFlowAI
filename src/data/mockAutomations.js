export const mockAutomations = [
  {
    id: 'AUT-001', name: 'AI Resume Screening', trigger: 'New application received',
    actions: ['Parse resume', 'Calculate match score', 'Assign screening status'], status: 'Active',
    totalRuns: 238, successfulRuns: 231, failedRuns: 7, lastRun: '2026-07-20T09:15:00+05:30',
  },
  {
    id: 'AUT-002', name: 'Interview Reminder', trigger: 'Interview scheduled within 24 hours',
    actions: ['Email candidate', 'Notify interviewer', 'Update reminder status'], status: 'Active',
    totalRuns: 124, successfulRuns: 122, failedRuns: 2, lastRun: '2026-07-20T08:30:00+05:30',
  },
  {
    id: 'AUT-003', name: 'Shortlist Notification', trigger: 'Candidate moved to Shortlisted',
    actions: ['Send candidate email', 'Notify hiring manager'], status: 'Active',
    totalRuns: 86, successfulRuns: 85, failedRuns: 1, lastRun: '2026-07-19T17:45:00+05:30',
  },
  {
    id: 'AUT-004', name: 'Rejection Follow-up', trigger: 'Candidate moved to Rejected',
    actions: ['Generate personalised email', 'Send rejection email', 'Archive application'], status: 'Paused',
    totalRuns: 54, successfulRuns: 51, failedRuns: 3, lastRun: '2026-07-18T16:20:00+05:30',
  },
  {
    id: 'AUT-005', name: 'Weekly Hiring Digest', trigger: 'Every Monday at 09:00',
    actions: ['Aggregate pipeline metrics', 'Generate digest', 'Email recruiting team'], status: 'Draft',
    totalRuns: 18, successfulRuns: 18, failedRuns: 0, lastRun: '2026-07-14T09:00:00+05:30',
  },
];

export default mockAutomations;
