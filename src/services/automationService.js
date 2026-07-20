import { calculateMatchScore } from '../utils/calculateMatchScore.js';

const wait = (ms, signal) => new Promise((resolve, reject) => {
  const timer = setTimeout(resolve, ms);
  signal?.addEventListener('abort', () => { clearTimeout(timer); reject(new DOMException('Cancelled', 'AbortError')); }, { once: true });
});
export const generateRunId = () => `RUN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
export const createAutomationLogEntry = (severity, message, step = null, metadata = {}) => ({ id: `LOG-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`, timestamp: new Date().toISOString(), severity, step, message, metadata });

export const executeAutomationStep = async (step, contextData = {}, signal) => {
  await wait(500 + Math.floor(Math.random() * 701), signal);
  if (step.configuration?.simulateFailure) throw new Error(step.configuration.failureMessage || `${step.label} failed during simulation.`);
  const candidate = contextData.candidate;
  const job = contextData.job || contextData.jobs?.find((item) => item.id === candidate?.appliedJobId);
  if (step.actionType === 'Calculate AI Match Score') return candidate && job ? calculateMatchScore(candidate, job) : { message: 'No candidate context; calculation simulated.' };
  if (step.actionType === 'Shortlist Candidate') return { candidateId: candidate?.id, status: candidate && candidate.matchScore >= (job?.minimumMatchScore || 0) ? 'Shortlisted' : 'Screening' };
  if (step.actionType === 'Reject Candidate') return { candidateId: candidate?.id, status: 'Rejected' };
  if (step.actionType === 'Update Candidate Status') return { candidateId: candidate?.id, status: step.configuration?.targetStatus || 'Screening' };
  if (step.actionType === 'Send Reminder') return { interviewId: contextData.interview?.id, reminderSent: true };
  if (step.actionType === 'Generate Report') {
    const candidates = contextData.candidates || [];
    const count = (status) => candidates.filter((item) => item.status === status).length;
    return { candidatesAdded: candidates.length, shortlisted: count('Shortlisted'), interviewsScheduled: count('Interview Scheduled'), selected: count('Selected'), hired: count('Hired'), rejected: count('Rejected'), averageMatchScore: candidates.length ? Math.round(candidates.reduce((sum, item) => sum + (Number(item.matchScore) || 0), 0) / candidates.length) : 0, conversionRate: candidates.length ? Math.round((count('Hired') / candidates.length) * 100) : 0 };
  }
  return { message: `${step.actionType} completed in mock mode.` };
};

export const executeAutomation = async (automation, contextData = {}, options = {}) => {
  const startedAt = new Date().toISOString();
  const logs = [createAutomationLogEntry('Info', `Started ${automation.name}.`)];
  const completedSteps = [];
  let failedStep = null;
  for (const step of automation.steps || []) {
    options.onStep?.(step, completedSteps.length);
    try {
      const output = await executeAutomationStep(step, contextData, options.signal);
      completedSteps.push({ ...step, status: 'Success', output });
      logs.push(createAutomationLogEntry('Success', `${step.label} completed.`, step.order, output));
    } catch (error) {
      if (error.name === 'AbortError') return { status: 'Cancelled', startedAt, endedAt: new Date().toISOString(), completedSteps, failedStep: step, errorMessage: 'Run cancelled by user.', logs: [...logs, createAutomationLogEntry('Warning', 'Run cancelled.', step.order)] };
      failedStep = step;
      logs.push(createAutomationLogEntry('Error', error.message, step.order));
      if (!step.continueOnFailure) break;
    }
  }
  const status = failedStep ? (completedSteps.length ? 'Partial Success' : 'Failed') : 'Success';
  return { status, startedAt, endedAt: new Date().toISOString(), completedSteps, failedStep, errorMessage: failedStep ? logs.at(-1).message : '', logs };
};

export const simulateTrigger = (triggerType, payload = {}) => ({ triggerType, payload, simulatedAt: new Date().toISOString() });
export const calculateAutomationMetrics = (automations, runHistory = []) => {
  const totalRuns = automations.reduce((sum, item) => sum + (item.totalRuns || 0), 0);
  const successes = automations.reduce((sum, item) => sum + (item.successfulRuns || 0), 0);
  return { total: automations.length, active: automations.filter((item) => item.status === 'Active').length, runsToday: runHistory.filter((item) => item.startedAt?.slice(0, 10) === new Date().toISOString().slice(0, 10)).length, successfulRuns: successes, failedRuns: automations.reduce((sum, item) => sum + (item.failedRuns || 0), 0), successRate: totalRuns ? Math.round((successes / totalRuns) * 100) : 0, estimatedHoursSaved: Math.round(automations.reduce((sum, item) => sum + (item.successfulRuns || 0) * (item.estimatedMinutesSavedPerRun || 0), 0) / 60) };
};
