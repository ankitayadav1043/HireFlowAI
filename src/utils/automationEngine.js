export const normalizeSteps = (steps = []) => steps.filter(Boolean).map((item, index) => ({
  order: index + 1,
  actionType: item.actionType || item.type || String(item),
  label: item.label || item.actionType || String(item),
  description: item.description || '',
  configuration: item.configuration || {},
  continueOnFailure: Boolean(item.continueOnFailure),
  delaySeconds: Math.max(0, Number(item.delaySeconds) || 0),
}));

export const successRate = (automation) => automation.totalRuns ? Math.round((automation.successfulRuns / automation.totalRuns) * 100) : 0;
export const automationTimeSaved = (automation) => (automation.successfulRuns || 0) * (automation.estimatedMinutesSavedPerRun || 0);
export const requiresEntity = (automation) => {
  const text = `${automation.triggerType} ${automation.steps?.map((item) => item.actionType).join(' ')}`;
  if (/Interview|Calendar|Reminder/i.test(text)) return 'interview';
  if (/Candidate|Resume|Shortlist|Reject|Match/i.test(text)) return 'candidate';
  if (/Job Created/i.test(text)) return 'job';
  return null;
};
