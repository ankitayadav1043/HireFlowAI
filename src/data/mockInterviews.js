export const mockInterviews = [
  {
    id: 'INT-001', candidateId: 'CAN-004', candidateName: 'Sneha Reddy', jobTitle: 'Data Analyst',
    interviewer: 'Rohan Mehta', interviewType: 'Technical', date: '2026-07-22', time: '10:30', duration: 60,
    meetingLink: 'https://meet.example.com/int-001', status: 'Scheduled', rating: null, feedback: '', reminderSent: true,
  },
  {
    id: 'INT-002', candidateId: 'CAN-005', candidateName: 'Rahul Banerjee', jobTitle: 'Senior Frontend Engineer',
    interviewer: 'Rohan Mehta', interviewType: 'Technical', date: '2026-07-18', time: '14:00', duration: 75,
    meetingLink: 'https://meet.example.com/int-002', status: 'Completed', rating: 4, feedback: 'Strong React fundamentals; TypeScript depth needs improvement.', reminderSent: true,
  },
  {
    id: 'INT-003', candidateId: 'CAN-006', candidateName: 'Ishita Desai', jobTitle: 'Product Manager - AI Platform',
    interviewer: 'Kavya Iyer', interviewType: 'Leadership', date: '2026-07-23', time: '11:00', duration: 60,
    meetingLink: 'https://meet.example.com/int-003', status: 'Scheduled', rating: null, feedback: '', reminderSent: false,
  },
  {
    id: 'INT-004', candidateId: 'CAN-003', candidateName: 'Vikram Singh', jobTitle: 'Talent Acquisition Specialist',
    interviewer: 'Ananya Sharma', interviewType: 'Hiring Manager', date: '2026-07-24', time: '15:30', duration: 45,
    meetingLink: 'https://meet.example.com/int-004', status: 'Scheduled', rating: null, feedback: '', reminderSent: true,
  },
  {
    id: 'INT-005', candidateId: 'CAN-008', candidateName: 'Divya Krishnan', jobTitle: 'Data Analyst',
    interviewer: 'Rohan Mehta', interviewType: 'Final', date: '2026-07-15', time: '16:00', duration: 45,
    meetingLink: 'https://meet.example.com/int-005', status: 'Completed', rating: 5, feedback: 'Excellent analytical reasoning and highly relevant people analytics experience.', reminderSent: true,
  },
];

export default mockInterviews;
