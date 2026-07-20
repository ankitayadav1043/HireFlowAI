import { normalizeSkillKey, normalizeSkills } from './normalizeSkills.js';

const clamp = (value) => Math.min(100, Math.max(0, Math.round(Number(value) || 0)));
const recommendationFor = (score) => score >= 85 ? 'Highly Recommended' : score >= 70 ? 'Recommended' : score >= 55 ? 'Manual Review' : 'Not Recommended';

export const calculateMatchScore = (candidate = {}, job = {}) => {
  const candidateSkills = normalizeSkills(candidate.skills);
  const requiredSkills = normalizeSkills(job.requiredSkills);
  const candidateKeys = new Set(candidateSkills.map(normalizeSkillKey));
  const matchedSkills = requiredSkills.filter((skill) => candidateKeys.has(normalizeSkillKey(skill)));
  const missingSkills = requiredSkills.filter((skill) => !candidateKeys.has(normalizeSkillKey(skill)));
  const skillScore = requiredSkills.length ? clamp((matchedSkills.length / requiredSkills.length) * 100) : 0;

  const requiredNumbers = String(job.experienceRequired || '').match(/\d+(?:\.\d+)?/g)?.map(Number) || [];
  const requiredExperience = requiredNumbers[0] || 0;
  const experience = Math.max(0, Number(candidate.experienceYears) || 0);
  const experienceScore = requiredExperience ? clamp((experience / requiredExperience) * 100) : experience > 0 ? 100 : 0;

  const educationText = `${candidate.education || ''} ${candidate.college || ''}`.toLowerCase();
  const roleWords = `${job.title || ''} ${job.department || ''}`.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 3);
  const educationScore = educationText.trim() ? clamp(70 + (roleWords.some((word) => educationText.includes(word)) ? 30 : 0)) : 0;

  const projectText = (Array.isArray(candidate.projects) ? candidate.projects : []).join(' ').toLowerCase();
  const projectMatches = requiredSkills.filter((skill) => projectText.includes(normalizeSkillKey(skill))).length;
  const projectScore = projectText ? clamp(60 + (requiredSkills.length ? (projectMatches / requiredSkills.length) * 40 : 20)) : 0;
  const matchScore = clamp(skillScore * 0.5 + experienceScore * 0.2 + educationScore * 0.1 + projectScore * 0.2);
  const strengths = [skillScore >= 75 && 'Strong required-skill alignment', experienceScore >= 90 && 'Meets the experience requirement', projectScore >= 80 && 'Relevant project portfolio'].filter(Boolean);
  const weaknesses = [missingSkills.length > 0 && `Missing ${missingSkills.slice(0, 3).join(', ')}`, experienceScore < 70 && 'Experience is below the preferred level', !projectText && 'No project evidence provided'].filter(Boolean);

  return {
    matchScore, skillScore, experienceScore, educationScore, projectScore, matchedSkills, missingSkills,
    strengths: strengths.length ? strengths : ['Profile has transferable potential'],
    weaknesses: weaknesses.length ? weaknesses : ['No major gaps identified'],
    aiRecommendation: recommendationFor(matchScore),
  };
};

export default calculateMatchScore;
