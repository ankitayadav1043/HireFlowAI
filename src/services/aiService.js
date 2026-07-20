import { calculateMatchScore } from '../utils/calculateMatchScore.js';
import { normalizeSkills } from '../utils/normalizeSkills.js';

const delay = () => new Promise((resolve) => window.setTimeout(resolve, 700 + Math.floor(Math.random() * 701)));
const titleCase = (value) => value.replace(/[-_.]+/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase()).trim();

export const calculateCandidateMatch = async (candidate, job) => { await delay(); return calculateMatchScore(candidate, job); };
export const generateCandidateSummary = async (candidate) => { await delay(); return `${candidate.name || 'This candidate'} brings ${candidate.experienceYears || 0} years of experience with strengths in ${normalizeSkills(candidate.skills).slice(0, 4).join(', ') || 'transferable professional skills'}.`; };
export const generateRecommendation = async (candidate, job) => { await delay(); return calculateMatchScore(candidate, job).aiRecommendation; };

export const parseResume = async (file, selectedJob) => {
  await delay();
  const baseName = file.name.replace(/\.(pdf|docx)$/i, '').replace(/resume|cv/gi, '').trim() || 'Candidate Profile';
  const name = titleCase(baseName);
  const required = normalizeSkills(selectedJob.requiredSkills);
  const candidate = {
    name, email: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '') || 'candidate'}@example.com`,
    phone: '+91 98' + String(Math.floor(10000000 + Math.random() * 89999999)), location: selectedJob.location || 'Bengaluru, Karnataka',
    appliedJobId: selectedJob.id, appliedJob: selectedJob.title, skills: [...required.slice(0, Math.max(2, required.length - 1)), ...(selectedJob.preferredSkills || []).slice(0, 2)],
    experienceYears: Math.max(1, Number(String(selectedJob.experienceRequired || '').match(/\d+/)?.[0]) || 3), education: 'B.Tech in Computer Science',
    college: 'Visvesvaraya Technological University', graduationYear: 2021, certifications: ['Professional Skills Certificate'],
    projects: [`${selectedJob.title} workflow platform`, 'Analytics and automation dashboard'], source: 'Resume Upload', status: 'Applied', resumeFile: file.name,
  };
  const analysis = calculateMatchScore(candidate, selectedJob);
  return { ...candidate, ...analysis, summary: `${name} demonstrates relevant experience for ${selectedJob.title}, with evidence across core skills and practical projects.` };
};

export const generateInterviewQuestions = async (candidate, job, interviewType = 'Technical') => { await delay(); return [`How has your experience prepared you for ${job.title}?`, `Describe a challenging ${interviewType.toLowerCase()} problem you solved.`, `How have you applied ${candidate.matchedSkills?.[0] || job.requiredSkills?.[0] || 'your core skills'} in production?`]; };
export const generateRejectionEmail = async (candidate, job) => { await delay(); return `Subject: Update on your ${job.title} application\n\nDear ${candidate.name}, thank you for your interest. We will not be progressing your application at this time.`; };
export const generateSelectionEmail = async (candidate, job) => { await delay(); return `Subject: Next steps for ${job.title}\n\nDear ${candidate.name}, congratulations. We are pleased to move forward with your application.`; };
export const generateOfferLetter = async (candidate, job) => { await delay(); return `Offer Letter\n\nDear ${candidate.name}, we are delighted to offer you the position of ${job.title} at the proposed compensation of ${job.salaryRange || 'the mutually agreed package'}.`; };
