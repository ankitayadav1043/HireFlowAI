import { Component } from 'react';
import { AlertTriangle, House, RotateCcw } from 'lucide-react';

export default class PageErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('Page rendering failed', { message: error.message, componentStack: info.componentStack }); }
  retry = () => this.setState({ error: null });
  render() {
    if (!this.state.error) return this.props.children;
    return <div className="grid min-h-[60vh] place-items-center text-center"><div className="max-w-xl rounded-3xl border border-rose-500/20 bg-slate-900/80 p-8"><AlertTriangle className="mx-auto text-rose-300" size={38}/><h1 className="mt-4 text-2xl font-semibold text-white">This page could not be displayed</h1><p className="mt-2 text-sm text-slate-400">Your saved recruitment data is safe. Retry the page or return to the dashboard.</p>{import.meta.env.DEV&&<pre className="mt-4 max-h-40 overflow-auto rounded-xl bg-slate-950 p-3 text-left text-xs text-rose-200">{this.state.error.stack||this.state.error.message}</pre>}<div className="mt-6 flex flex-wrap justify-center gap-2"><button type="button" onClick={this.retry} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2"><RotateCcw size={16}/>Retry</button><a href="/" className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950"><House size={16}/>Go to Dashboard</a></div></div></div>;
  }
}
