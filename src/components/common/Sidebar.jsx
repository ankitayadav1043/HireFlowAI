import { createElement } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react';

const navigationItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/jobs', label: 'Jobs', icon: BriefcaseBusiness },
  { to: '/candidates', label: 'Candidates', icon: Users },
  { to: '/interviews', label: 'Interviews', icon: CalendarDays },
  { to: '/automation', label: 'Automations', icon: Sparkles },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar = ({ collapsed = false, onCollapse, onNavigate, mobile = false }) => (
  <aside
    className={`flex h-full flex-col border-r border-white/10 bg-slate-950/95 transition-[width] duration-300 ${
      collapsed && !mobile ? 'w-20' : 'w-72'
    }`}
  >
    <div className={`flex h-20 items-center border-b border-white/10 ${collapsed && !mobile ? 'justify-center px-3' : 'px-5'}`}>
      <NavLink to="/" onClick={onNavigate} className="flex min-w-0 items-center gap-3" aria-label="HireFlow AI dashboard">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20">
          <Sparkles size={20} strokeWidth={2.5} />
        </span>
        {(!collapsed || mobile) && (
          <span className="min-w-0">
            <span className="block truncate text-base font-semibold tracking-tight text-white">HireFlow AI</span>
            <span className="block truncate text-xs text-slate-500">Talent intelligence</span>
          </span>
        )}
      </NavLink>
    </div>

    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="Primary navigation">
      {navigationItems.map(({ to, label, icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          title={collapsed && !mobile ? label : undefined}
          className={({ isActive }) =>
            `group flex h-11 items-center rounded-xl text-sm font-medium transition-colors ${
              collapsed && !mobile ? 'justify-center px-2' : 'gap-3 px-3'
            } ${
              isActive
                ? 'bg-cyan-500/15 text-cyan-300'
                : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-100'
            }`
          }
        >
          {createElement(icon, { size: 19, className: 'shrink-0' })}
          {(!collapsed || mobile) && <span>{label}</span>}
        </NavLink>
      ))}
    </nav>

    <div className="border-t border-white/10 p-3">
      <div className={`flex items-center rounded-xl bg-white/[0.04] p-2 ${collapsed && !mobile ? 'justify-center' : 'gap-3'}`}>
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-cyan-400 text-sm font-semibold text-slate-950">
          AK
        </div>
        {(!collapsed || mobile) && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-100">Ankit Kumar</p>
            <p className="truncate text-xs text-slate-500">Administrator</p>
          </div>
        )}
      </div>
      {!mobile && (
        <button
          type="button"
          onClick={onCollapse}
          className={`mt-2 flex h-9 w-full items-center rounded-lg text-xs font-medium text-slate-500 transition hover:bg-white/[0.05] hover:text-slate-200 ${
            collapsed ? 'justify-center' : 'justify-between px-3'
          }`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {!collapsed && <span>Collapse sidebar</span>}
          {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
        </button>
      )}
    </div>
  </aside>
);

export default Sidebar;
