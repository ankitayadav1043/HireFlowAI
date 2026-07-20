import { Zap } from 'lucide-react';
export default function AutomationTriggerBadge({ trigger }) { return <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300"><Zap size={12} />{trigger || 'Manual'}</span>; }
