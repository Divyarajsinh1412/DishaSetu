import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[DishaSetu ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="fixed inset-0 z-[99999] bg-[#071B32] text-white flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6 text-amber-400">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight mb-2">
            DishaSetu Recoverable Engine Notice
          </h2>
          <p className="text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
            The application encountered a temporary UI state issue, but your campus session is safe. Click below to refresh the campus view.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-all border border-slate-700"
            >
              Resume Session
            </button>
            <button
              onClick={this.handleReload}
              className="px-5 py-2.5 rounded-xl bg-[#00A878] hover:bg-[#00966b] text-white text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-[#00A878]/30"
            >
              <RefreshCw className="w-4 h-4 animate-spin-reverse" />
              Reload Campus
            </button>
          </div>

          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <div className="mt-8 p-4 bg-slate-950/80 rounded-xl border border-red-500/30 text-left max-w-xl w-full overflow-auto text-xs font-mono text-red-400">
              <div className="font-bold mb-1">{this.state.error.toString()}</div>
              <div className="text-slate-500 text-[10px] whitespace-pre-wrap">
                {this.state.errorInfo?.componentStack}
              </div>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
