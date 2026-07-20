import { createContext, useContext, useEffect, useReducer } from 'react';
import { mockActivities } from '../data/mockActivities';
import { mockAutomations } from '../data/mockAutomations';
import { mockCandidates } from '../data/mockCandidates';
import { mockInterviews } from '../data/mockInterviews';
import { mockJobs } from '../data/mockJobs';
import { generateId } from '../utils/generateId';
import { normalizeSteps } from '../utils/automationEngine';
import { executeAutomation, generateRunId } from '../services/automationService';
import { useToast } from './ToastContext';

const RecruitmentContext = createContext(null);

const STORAGE_KEYS = {
  jobs: 'hireflow_jobs',
  candidates: 'hireflow_candidates',
  interviews: 'hireflow_interviews',
  automations: 'hireflow_automations',
  activities: 'hireflow_activities',
  automationRuns: 'hireflow_automation_runs',
};

const loadCollection = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;

  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const normalizeAutomation = (item) => ({
  description: item.description || item.impact || `${item.name} recruitment workflow.`,
  category: item.category || (/interview/i.test(item.name) ? 'Interview Management' : /digest|report/i.test(item.name) ? 'Reporting' : /screen|shortlist/i.test(item.name) ? 'Candidate Screening' : 'Candidate Communication'),
  triggerType: item.triggerType || item.trigger || 'Manual', triggerConfig: item.triggerConfig || {},
  estimatedMinutesSavedPerRun: Number(item.estimatedMinutesSavedPerRun) || 10,
  steps: normalizeSteps(item.steps || item.actions || []), ...item,
});

const createInitialState = () => ({
  jobs: loadCollection(STORAGE_KEYS.jobs, mockJobs),
  candidates: loadCollection(STORAGE_KEYS.candidates, mockCandidates),
  interviews: loadCollection(STORAGE_KEYS.interviews, mockInterviews),
  automations: loadCollection(STORAGE_KEYS.automations, mockAutomations).map(normalizeAutomation),
  activities: loadCollection(STORAGE_KEYS.activities, mockActivities),
  automationRuns: loadCollection(STORAGE_KEYS.automationRuns, []),
  loading: true,
});

const reducer = (state, action) => {
  switch (action.type) {
    case 'READY':
      return { ...state, loading: false };
    case 'ADD_JOB':
      return { ...state, jobs: [action.job, ...state.jobs] };
    case 'UPDATE_JOB': {
      const previous = state.jobs.find((job) => job.id === action.job.id);
      return {
        ...state,
        jobs: state.jobs.map((job) => (job.id === action.job.id ? action.job : job)),
        candidates: previous?.title === action.job.title
          ? state.candidates
          : state.candidates.map((candidate) => candidate.appliedJobId === action.job.id
            ? { ...candidate, appliedJob: action.job.title }
            : candidate),
        interviews: previous?.title === action.job.title
          ? state.interviews
          : state.interviews.map((interview) => state.candidates.some(
            (candidate) => candidate.id === interview.candidateId && candidate.appliedJobId === action.job.id,
          ) ? { ...interview, jobTitle: action.job.title } : interview),
      };
    }
    case 'DELETE_JOB':
      return {
        ...state,
        jobs: state.jobs.filter((job) => job.id !== action.id),
        candidates: state.candidates.map((candidate) => candidate.appliedJobId === action.id
          ? { ...candidate, appliedJobId: null, appliedJob: `${candidate.appliedJob} (Deleted)` }
          : candidate),
      };
    case 'CHANGE_JOB_STATUS':
      return { ...state, jobs: state.jobs.map((job) => job.id === action.id ? { ...job, status: action.status } : job) };
    case 'ADD_CANDIDATE':
      return {
        ...state,
        candidates: [action.candidate, ...state.candidates],
        jobs: state.jobs.map((job) => job.id === action.candidate.appliedJobId
          ? { ...job, applicants: job.applicants + 1 }
          : job),
      };
    case 'UPDATE_CANDIDATE': {
      const previous = state.candidates.find((candidate) => candidate.id === action.candidate.id);
      return {
        ...state,
        candidates: state.candidates.map((candidate) => candidate.id === action.candidate.id ? action.candidate : candidate),
        jobs: state.jobs.map((job) => {
          if (previous?.appliedJobId === action.candidate.appliedJobId) return job;
          if (job.id === previous?.appliedJobId) return { ...job, applicants: Math.max(0, job.applicants - 1) };
          if (job.id === action.candidate.appliedJobId) return { ...job, applicants: job.applicants + 1 };
          return job;
        }),
        interviews: state.interviews.map((interview) => interview.candidateId === action.candidate.id
          ? { ...interview, candidateName: action.candidate.name, jobTitle: action.candidate.appliedJob }
          : interview),
      };
    }
    case 'DELETE_CANDIDATE': {
      const candidate = state.candidates.find((item) => item.id === action.id);
      return {
        ...state,
        candidates: state.candidates.filter((item) => item.id !== action.id),
        interviews: state.interviews.filter((interview) => interview.candidateId !== action.id),
        jobs: state.jobs.map((job) => job.id === candidate?.appliedJobId
          ? { ...job, applicants: Math.max(0, job.applicants - 1) }
          : job),
      };
    }
    case 'CHANGE_CANDIDATE_STATUS':
      return { ...state, candidates: state.candidates.map((candidate) => candidate.id === action.id ? { ...candidate, status: action.status } : candidate) };
    case 'ADD_INTERVIEW':
      return {
        ...state,
        interviews: [action.interview, ...state.interviews],
        candidates: state.candidates.map((candidate) => candidate.id === action.interview.candidateId
          ? { ...candidate, status: 'Interview Scheduled' }
          : candidate),
      };
    case 'UPDATE_INTERVIEW':
      return {
        ...state,
        interviews: state.interviews.map((interview) => interview.id === action.interview.id ? action.interview : interview),
        candidates: action.candidateStatus
          ? state.candidates.map((candidate) => candidate.id === action.interview.candidateId ? { ...candidate, status: action.candidateStatus } : candidate)
          : state.candidates,
      };
    case 'CANCEL_INTERVIEW':
      return {
        ...state,
        interviews: state.interviews.map((interview) => interview.id === action.id ? { ...interview, status: 'Cancelled', cancellationReason: action.reason || interview.cancellationReason || '' } : interview),
        candidates: action.candidateStatus
          ? state.candidates.map((candidate) => candidate.id === action.candidateId ? { ...candidate, status: action.candidateStatus } : candidate)
          : state.candidates,
      };
    case 'SUBMIT_FEEDBACK':
      return {
        ...state,
        interviews: state.interviews.map((interview) => interview.id === action.id
          ? { ...interview, ...action.feedbackData, rating: action.feedbackData.overallRating, feedback: action.feedbackData.feedback, status: 'Completed' }
          : interview),
        candidates: state.candidates.map((candidate) => candidate.id === action.candidateId
          ? { ...candidate, status: 'Interview Completed' }
          : candidate),
      };
    case 'TOGGLE_AUTOMATION':
      return { ...state, automations: state.automations.map((automation) => automation.id === action.id ? { ...automation, status: action.status } : automation) };
    case 'RUN_AUTOMATION':
      return {
        ...state,
        automations: state.automations.map((automation) => automation.id === action.id ? {
          ...automation,
          totalRuns: automation.totalRuns + 1,
          successfulRuns: automation.successfulRuns + (action.succeeded ? 1 : 0),
          failedRuns: automation.failedRuns + (action.succeeded ? 0 : 1),
          lastRun: action.timestamp,
        } : automation),
      };
    case 'ADD_AUTOMATION':
      return { ...state, automations: [action.automation, ...state.automations] };
    case 'UPDATE_AUTOMATION':
      return { ...state, automations: state.automations.map((item) => item.id === action.automation.id ? action.automation : item) };
    case 'DELETE_AUTOMATION':
      return { ...state, automations: state.automations.filter((item) => item.id !== action.id) };
    case 'RESET_AUTOMATION':
      return { ...state, automations: state.automations.map((item) => item.id === action.id ? { ...item, totalRuns: 0, successfulRuns: 0, failedRuns: 0, lastRun: null } : item) };
    case 'ADD_AUTOMATION_RUN':
      return { ...state, automationRuns: [action.run, ...state.automationRuns] };
    case 'ADD_ACTIVITY':
      return { ...state, activities: [action.activity, ...state.activities] };
    default:
      return state;
  }
};

export const RecruitmentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const { success, error, warning, info } = useToast();
  const { jobs, candidates, interviews, automations, activities, automationRuns } = state;

  useEffect(() => {
    dispatch({ type: 'READY' });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const collections = { jobs, candidates, interviews, automations, activities, automationRuns };
    Object.entries(STORAGE_KEYS).forEach(([collection, key]) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(collections[collection]));
      } catch {
        error(`Could not save ${collection} to local storage.`);
      }
    });
  }, [jobs, candidates, interviews, automations, activities, automationRuns, error]);

  const recordActivity = (activity) => {
    const entry = {
      id: generateId('ACT', state.activities.map((item) => item.id)),
      timestamp: new Date().toISOString(),
      actor: 'System',
      ...activity,
    };
    dispatch({ type: 'ADD_ACTIVITY', activity: entry });
    return entry;
  };

  const addJob = (job) => {
    if (!job?.title) {
      error('A job title is required.');
      return null;
    }
    const created = {
      applicants: 0, status: 'Draft', createdAt: new Date().toISOString().slice(0, 10),
      ...job, id: generateId('JOB', state.jobs.map((item) => item.id)),
    };
    dispatch({ type: 'ADD_JOB', job: created });
    recordActivity({ type: 'job', title: 'Job created', description: `${created.title} was created.`, relatedId: created.id });
    success(`${created.title} was created.`, 'Job added');
    return created;
  };

  const updateJob = (id, updates) => {
    const current = state.jobs.find((job) => job.id === id);
    if (!current) {
      error('The requested job could not be found.');
      return false;
    }
    const updated = { ...current, ...updates, id };
    dispatch({ type: 'UPDATE_JOB', job: updated });
    recordActivity({ type: 'job', title: 'Job updated', description: `${updated.title} was updated.`, relatedId: id });
    success(`${updated.title} was updated.`, 'Job saved');
    return updated;
  };

  const deleteJob = (id, { force = false } = {}) => {
    const job = state.jobs.find((item) => item.id === id);
    if (!job) {
      error('The requested job could not be found.');
      return false;
    }
    const relatedCandidates = state.candidates.filter((candidate) => candidate.appliedJobId === id);
    if (relatedCandidates.length && !force) {
      warning(`${relatedCandidates.length} candidate(s) are linked to this job. Use force deletion to detach them.`, 'Job not deleted');
      return false;
    }
    dispatch({ type: 'DELETE_JOB', id });
    recordActivity({ type: 'job', title: 'Job deleted', description: `${job.title} was deleted${relatedCandidates.length ? ` and ${relatedCandidates.length} candidate(s) were detached` : ''}.`, relatedId: id });
    success(`${job.title} was deleted.`, 'Job deleted');
    return true;
  };

  const changeJobStatus = (id, status) => {
    const job = state.jobs.find((item) => item.id === id);
    if (!job || !status) {
      error('Unable to change the job status.');
      return false;
    }
    dispatch({ type: 'CHANGE_JOB_STATUS', id, status });
    recordActivity({ type: 'job', title: 'Job status changed', description: `${job.title} moved to ${status}.`, relatedId: id });
    success(`${job.title} is now ${status}.`, 'Status updated');
    return true;
  };

  const addCandidate = (candidate) => {
    const job = state.jobs.find((item) => item.id === candidate?.appliedJobId);
    if (!candidate?.name || !job) {
      error('A candidate name and valid job are required.');
      return null;
    }
    const created = {
      status: 'Applied', applicationDate: new Date().toISOString().slice(0, 10),
      ...candidate, appliedJob: job.title, id: generateId('CAN', state.candidates.map((item) => item.id)),
    };
    dispatch({ type: 'ADD_CANDIDATE', candidate: created });
    recordActivity({ type: 'candidate', title: 'Candidate added', description: `${created.name} applied for ${job.title}.`, relatedId: created.id });
    success(`${created.name} was added.`, 'Candidate added');
    return created;
  };

  const updateCandidate = (id, updates) => {
    const current = state.candidates.find((candidate) => candidate.id === id);
    if (!current) {
      error('The requested candidate could not be found.');
      return false;
    }
    const targetJobId = updates.appliedJobId ?? current.appliedJobId;
    const job = targetJobId ? state.jobs.find((item) => item.id === targetJobId) : null;
    if (targetJobId && !job) {
      error('The selected job does not exist.');
      return false;
    }
    const updated = { ...current, ...updates, id, appliedJob: job?.title ?? current.appliedJob };
    dispatch({ type: 'UPDATE_CANDIDATE', candidate: updated });
    recordActivity({ type: 'candidate', title: 'Candidate updated', description: `${updated.name}'s profile was updated.`, relatedId: id });
    success(`${updated.name}'s profile was updated.`, 'Candidate saved');
    return updated;
  };

  const deleteCandidate = (id, { force = false } = {}) => {
    const candidate = state.candidates.find((item) => item.id === id);
    if (!candidate) {
      error('The requested candidate could not be found.');
      return false;
    }
    const linkedInterviews = state.interviews.filter((interview) => interview.candidateId === id);
    if (linkedInterviews.length && !force) {
      warning(`${linkedInterviews.length} interview(s) are linked. Use force deletion to remove both.`, 'Candidate not deleted');
      return false;
    }
    dispatch({ type: 'DELETE_CANDIDATE', id });
    recordActivity({ type: 'candidate', title: 'Candidate deleted', description: `${candidate.name} was removed from the pipeline.`, relatedId: id });
    success(`${candidate.name} was deleted.`, 'Candidate deleted');
    return true;
  };

  const setCandidateStatus = (id, status) => {
    const candidate = state.candidates.find((item) => item.id === id);
    if (!candidate) {
      error('The requested candidate could not be found.');
      return false;
    }
    dispatch({ type: 'CHANGE_CANDIDATE_STATUS', id, status });
    recordActivity({ type: 'candidate', title: 'Candidate status changed', description: `${candidate.name} moved to ${status}.`, relatedId: id });
    success(`${candidate.name} is now ${status}.`, 'Status updated');
    return true;
  };

  const scheduleInterview = (details) => {
    const candidate = state.candidates.find((item) => item.id === details?.candidateId);
    if (!candidate || !details?.date || !details?.time) {
      error('A valid candidate, date, and time are required.');
      return null;
    }
    const interview = {
      status: 'Scheduled', rating: null, feedback: '', reminderSent: false,
      ...details, candidateName: candidate.name, jobTitle: candidate.appliedJob,
      id: generateId('INT', state.interviews.map((item) => item.id)),
    };
    dispatch({ type: 'ADD_INTERVIEW', interview });
    recordActivity({ type: 'interview', title: 'Interview scheduled', description: `${interview.interviewType || 'Interview'} scheduled for ${candidate.name}.`, relatedId: interview.id });
    success(`Interview scheduled for ${candidate.name}.`, 'Interview scheduled');
    return interview;
  };

  const updateInterview = (id, updates) => {
    const current = state.interviews.find((interview) => interview.id === id);
    if (!current) {
      error('The requested interview could not be found.');
      return false;
    }
    const candidateId = updates.candidateId ?? current.candidateId;
    const candidate = state.candidates.find((item) => item.id === candidateId);
    if (!candidate) {
      error('The selected candidate does not exist.');
      return false;
    }
    const updated = { ...current, ...updates, id, candidateId, candidateName: candidate.name, jobTitle: candidate.appliedJob };
    dispatch({ type: 'UPDATE_INTERVIEW', interview: updated, candidateStatus: updated.status === 'Completed' ? 'Interview Completed' : null });
    recordActivity({ type: 'interview', title: 'Interview updated', description: `Interview details for ${candidate.name} were updated.`, relatedId: id });
    success(`Interview for ${candidate.name} was updated.`, 'Interview saved');
    return updated;
  };

  const cancelInterview = (id, reason = '') => {
    const interview = state.interviews.find((item) => item.id === id);
    if (!interview) {
      error('The requested interview could not be found.');
      return false;
    }
    const hasAnotherScheduled = state.interviews.some((item) => item.id !== id && item.candidateId === interview.candidateId && ['Scheduled', 'Rescheduled'].includes(item.status));
    dispatch({ type: 'CANCEL_INTERVIEW', id, candidateId: interview.candidateId, candidateStatus: hasAnotherScheduled ? null : 'Shortlisted', reason });
    recordActivity({ type: 'interview', title: 'Interview cancelled', description: `Interview for ${interview.candidateName} was cancelled.`, relatedId: id });
    info(`Interview for ${interview.candidateName} was cancelled.`, 'Interview cancelled');
    return true;
  };

  const submitInterviewFeedback = (id, feedbackData) => {
    const interview = state.interviews.find((item) => item.id === id);
    const overallRating = Number(feedbackData?.overallRating ?? feedbackData?.rating);
    const feedback = feedbackData?.feedback?.trim();
    if (!interview || overallRating < 1 || overallRating > 5 || !feedback) {
      error('A valid interview, rating, and feedback are required.');
      return false;
    }
    dispatch({ type: 'SUBMIT_FEEDBACK', id, candidateId: interview.candidateId, feedbackData: { ...feedbackData, overallRating, feedback } });
    recordActivity({ type: 'interview', title: 'Interview feedback submitted', description: `Feedback was submitted for ${interview.candidateName}.`, relatedId: id });
    success(`Feedback for ${interview.candidateName} was submitted.`, 'Feedback saved');
    return true;
  };

  const addAutomation = (data) => {
    if (!data?.name?.trim() || state.automations.some((item) => item.name.toLowerCase() === data.name.trim().toLowerCase())) {
      error('Use a unique automation name.'); return null;
    }
    const automation = normalizeAutomation({ totalRuns: 0, successfulRuns: 0, failedRuns: 0, lastRun: null, status: 'Draft', ...data, name: data.name.trim(), id: generateId('AUT', state.automations.map((item) => item.id)) });
    dispatch({ type: 'ADD_AUTOMATION', automation });
    recordActivity({ type: 'automation', title: 'Automation created', description: `${automation.name} was created.`, relatedId: automation.id });
    success(`${automation.name} was created.`, 'Automation created'); return automation;
  };

  const updateAutomation = (id, updates) => {
    const current = state.automations.find((item) => item.id === id);
    if (!current) { error('The requested automation could not be found.'); return false; }
    if (updates.name && state.automations.some((item) => item.id !== id && item.name.toLowerCase() === updates.name.trim().toLowerCase())) { error('Use a unique automation name.'); return false; }
    const automation = normalizeAutomation({ ...current, ...updates, id, steps: normalizeSteps(updates.steps || current.steps) });
    dispatch({ type: 'UPDATE_AUTOMATION', automation });
    recordActivity({ type: 'automation', title: 'Automation updated', description: `${automation.name} was updated.`, relatedId: id });
    success(`${automation.name} was updated.`, 'Automation saved'); return automation;
  };

  const deleteAutomation = (id) => {
    const automation = state.automations.find((item) => item.id === id);
    if (!automation) { error('The requested automation could not be found.'); return false; }
    dispatch({ type: 'DELETE_AUTOMATION', id });
    recordActivity({ type: 'automation', title: 'Automation deleted', description: `${automation.name} was deleted; its run history was preserved.`, relatedId: id });
    success(`${automation.name} was deleted.`, 'Automation deleted'); return true;
  };

  const toggleAutomation = (id) => {
    const automation = state.automations.find((item) => item.id === id);
    if (!automation) { error('The requested automation could not be found.'); return false; }
    const status = automation.status === 'Active' ? 'Paused' : 'Active';
    dispatch({ type: 'TOGGLE_AUTOMATION', id, status });
    recordActivity({ type: 'automation', title: 'Automation status changed', description: `${automation.name} is now ${status}.`, relatedId: id });
    success(`${automation.name} is now ${status}.`, 'Automation updated'); return true;
  };

  const resetAutomationStatistics = (id) => {
    const automation = state.automations.find((item) => item.id === id);
    if (!automation) { error('The requested automation could not be found.'); return false; }
    dispatch({ type: 'RESET_AUTOMATION', id });
    recordActivity({ type: 'automation', title: 'Automation statistics reset', description: `${automation.name} counters were reset; run history was preserved.`, relatedId: id });
    info(`${automation.name} statistics were reset.`, 'Statistics reset'); return true;
  };

  const runAutomation = async (id, options = {}) => {
    const automation = state.automations.find((item) => item.id === id);
    if (!automation) { error('The requested automation could not be found.'); return false; }
    if (automation.status !== 'Active' && !options.allowPaused) { warning('Activate this workflow or confirm a one-time run.', 'Automation not run'); return false; }
    const result = await executeAutomation(automation, { jobs: state.jobs, candidates: state.candidates, interviews: state.interviews, candidate: state.candidates.find((item) => item.id === options.entityId), job: state.jobs.find((item) => item.id === options.entityId), interview: state.interviews.find((item) => item.id === options.entityId) }, options);
    result.completedSteps?.forEach((step) => {
      const output = step.output || {};
      const candidate = state.candidates.find((item) => item.id === (output.candidateId || options.entityId));
      if (candidate && output.status) dispatch({ type: 'CHANGE_CANDIDATE_STATUS', id: candidate.id, status: output.status });
      if (candidate && step.actionType === 'Calculate AI Match Score' && Number.isFinite(output.matchScore)) dispatch({ type: 'UPDATE_CANDIDATE', candidate: { ...candidate, ...output, id: candidate.id } });
      if (output.interviewId && output.reminderSent) {
        const interview = state.interviews.find((item) => item.id === output.interviewId);
        if (interview) dispatch({ type: 'UPDATE_INTERVIEW', interview: { ...interview, reminderSent: true } });
      }
    });
    const ended = result.endedAt || new Date().toISOString();
    const run = { id: generateRunId(), automationId: id, automationName: automation.name, trigger: options.trigger || 'Manual', entityId: options.entityId || null, entityType: options.entityType || null, startedAt: result.startedAt, endedAt: ended, duration: Math.max(0, new Date(ended) - new Date(result.startedAt)), status: result.status, completedSteps: result.completedSteps, failedStep: result.failedStep, errorMessage: result.errorMessage, logs: result.logs, inputs: { entityId: options.entityId || null }, timeSaved: result.status === 'Success' ? automation.estimatedMinutesSavedPerRun : 0 };
    dispatch({ type: 'ADD_AUTOMATION_RUN', run });
    dispatch({ type: 'RUN_AUTOMATION', id, succeeded: result.status === 'Success', timestamp: ended });
    recordActivity({ type: 'automation', title: `Automation ${result.status.toLowerCase()}`, description: `${automation.name} finished with status ${result.status}.`, relatedId: id });
    (result.status === 'Success' ? success : result.status === 'Cancelled' ? info : error)(`${automation.name}: ${result.status}.`, 'Automation run');
    return run;
  };

  const simulateAutomationTrigger = async (triggerType, options = {}) => {
    const matching = state.automations.filter((item) => item.status === 'Active' && item.triggerType === triggerType);
    if (!matching.length) { info(`No active automations match ${triggerType}.`, 'Trigger simulated'); return []; }
    return Promise.all(matching.map((item) => runAutomation(item.id, { ...options, trigger: triggerType })));
  };
  const addActivity = (activity) => {
    const created = recordActivity(activity);
    info(activity.title || 'Activity recorded.', 'Activity added');
    return created;
  };

  const value = ({
    jobs: state.jobs, candidates: state.candidates, interviews: state.interviews,
    automations: state.automations, activities: state.activities, automationRuns: state.automationRuns, loading: state.loading,
    addJob, updateJob, deleteJob, changeJobStatus,
    addCandidate, updateCandidate, deleteCandidate, changeCandidateStatus: setCandidateStatus,
    shortlistCandidate: (id) => setCandidateStatus(id, 'Shortlisted'),
    rejectCandidate: (id) => setCandidateStatus(id, 'Rejected'),
    selectCandidate: (id) => setCandidateStatus(id, 'Selected'),
    scheduleInterview, updateInterview, cancelInterview, submitInterviewFeedback,
    addAutomation, updateAutomation, deleteAutomation, toggleAutomation, resetAutomationStatistics, runAutomation, simulateAutomationTrigger, addActivity,
  });

  return <RecruitmentContext.Provider value={value}>{children}</RecruitmentContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useRecruitment = () => {
  const context = useContext(RecruitmentContext);
  if (!context) throw new Error('useRecruitment must be used within a RecruitmentProvider');
  return context;
};

export default RecruitmentContext;
