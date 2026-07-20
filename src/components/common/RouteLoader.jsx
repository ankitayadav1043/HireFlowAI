import { LoaderCircle } from 'lucide-react';

export default function RouteLoader({ compact = false }) {
  return <div className={`grid place-items-center ${compact ? 'min-h-48' : 'min-h-[60vh]'}`} role="status" aria-live="polite"><div className="text-center"><LoaderCircle className="mx-auto animate-spin text-cyan-300" size={30}/><p className="mt-3 text-sm text-slate-400">Loading page…</p></div></div>;
}
