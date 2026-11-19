import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
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
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="fixed inset-0 z-[99999] bg-[#07172c] text-white flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6 text-amber-400">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black tracking-tight mb-2 text-white">
            Campus Session Notice
          </h2>
          <p className="text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
            The application encountered a temporary display state change. Your session and verified campus coordinates remain completely preserved.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-all border border-slate-700"
            >
              Resume Session
            </button>
            <button
              onClick={this.handleReload}
              className="px-5 py-2.5 rounded-xl bg-[#1d4ed8] hover:bg-[#2563eb] text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-[#1d4ed8]/30"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Campus Map
            </button>
          </div>

          <div className="mt-8">
            <button
              type="button"
              onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
              className="text-[11px] text-slate-500 hover:text-slate-400 underline"
            >
              {this.state.showDetails ? 'Hide Diagnostic Info' : 'Technical Diagnostics'}
            </button>

            {this.state.showDetails && this.state.error && (
              <div className="mt-3 p-4 bg-slate-950/90 rounded-xl border border-slate-800 text-left max-w-xl w-full overflow-auto text-xs font-mono text-slate-400">
                <div className="font-bold text-amber-400 mb-1">{this.state.error.toString()}</div>
                <div className="text-slate-500 text-[10px] whitespace-pre-wrap">
                  {this.state.errorInfo?.componentStack}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
