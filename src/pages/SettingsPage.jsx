import { Building2, UserRound } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';

const SettingsPage = () => (
  <div className="space-y-6">
    <PageHeader
      eyebrow="Workspace"
      title="Settings"
      description="Manage your workspace profile, hiring preferences, and team access."
    />
    <section className="divide-y divide-white/10 rounded-3xl border border-white/10 bg-slate-900/70">
      <button type="button" className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-white/[0.03]">
        <span className="rounded-xl bg-cyan-500/10 p-2.5 text-cyan-300"><Building2 size={19} /></span>
        <span><span className="block font-medium text-white">Organization profile</span><span className="text-sm text-slate-400">Company details and hiring defaults</span></span>
      </button>
      <button type="button" className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-white/[0.03]">
        <span className="rounded-xl bg-violet-500/10 p-2.5 text-violet-300"><UserRound size={19} /></span>
        <span><span className="block font-medium text-white">Team and permissions</span><span className="text-sm text-slate-400">Members, roles, and workspace access</span></span>
      </button>
    </section>
  </div>
);

export default SettingsPage;
