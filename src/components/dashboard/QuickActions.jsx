import { createElement } from 'react';
import { Bot, BriefcaseBusiness, CalendarPlus, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

const QuickActions = ({ automations, runAutomation }) => {
  const navigate = useNavigate();
  const { error } = useToast();

  const actions = [
    { label: 'Add Candidate', description: 'Create a candidate profile', icon: UserPlus, onClick: () => navigate('/candidates') },
    { label: 'Create Job', description: 'Open a new requisition', icon: BriefcaseBusiness, onClick: () => navigate('/jobs') },
    { label: 'Schedule Interview', description: 'Coordinate the next round', icon: CalendarPlus, onClick: () => navigate('/interviews') },
    {
      label: 'Run Resume Screening', description: 'Score new applications', icon: Bot,
      onClick: () => {
        const screening = automations.find((automation) => /resume/i.test(automation.name) && /screen/i.test(automation.name));
        if (!screening) {
          error('No resume-screening workflow is configured.');
          return;
        }
        runAutomation(screening.id);
      },
    },
  ];

  return (
    <section aria-labelledby="quick-actions-title">
      <div className="mb-3 flex items-center justify-between"><h2 id="quick-actions-title" className="text-sm font-semibold text-slate-200">Quick actions</h2><p className="text-xs text-slate-600">Common recruiting tasks</p></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => (
          <button key={action.label} type="button" onClick={action.onClick} className="group flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan-500/25 hover:bg-slate-900">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-slate-400 transition group-hover:bg-cyan-500/10 group-hover:text-cyan-300">{createElement(action.icon, { size: 18 })}</span>
            <span className="min-w-0"><span className="block truncate text-sm font-medium text-slate-200">{action.label}</span><span className="block truncate text-xs text-slate-500">{action.description}</span></span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;
