import { Bell, Menu, Search } from 'lucide-react';

const Topbar = ({ onOpenNavigation }) => (
  <header className="sticky top-0 z-30 flex h-20 items-center gap-3 border-b border-white/10 bg-slate-950/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
    <button
      type="button"
      onClick={onOpenNavigation}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 text-slate-300 transition hover:bg-white/[0.06] hover:text-white lg:hidden"
      aria-label="Open navigation"
    >
      <Menu size={20} />
    </button>

    <label className="flex h-11 min-w-0 max-w-xl flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-slate-500 transition focus-within:border-cyan-500/40 focus-within:bg-white/[0.06]">
      <Search size={18} className="shrink-0" />
      <span className="sr-only">Search HireFlow AI</span>
      <input
        type="search"
        placeholder="Search jobs, candidates, interviews..."
        className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
      />
      <kbd className="hidden rounded-md border border-white/10 bg-slate-900 px-2 py-1 text-[10px] text-slate-500 sm:block">⌘ K</kbd>
    </label>

    <div className="ml-auto flex items-center gap-2">
      <button
        type="button"
        className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
        aria-label="Notifications"
      >
        <Bell size={19} />
        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-slate-950 bg-cyan-400" />
      </button>
      <div className="hidden items-center gap-3 border-l border-white/10 pl-3 sm:flex">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-100">Ankit Kumar</p>
          <p className="text-xs text-slate-500">Admin</p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-cyan-400 text-sm font-semibold text-slate-950">AK</div>
      </div>
    </div>
  </header>
);

export default Topbar;
