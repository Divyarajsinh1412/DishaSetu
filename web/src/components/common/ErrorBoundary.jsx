import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: true };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error, showDetails: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[DishaSetu ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo, showDetails: true });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.removeItem('dishasetu_active_route');
    } catch {}
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: true });
  };

  handleReturnOverview = () => {
    try {
      localStorage.removeItem('dishasetu_active_route');
      window.history.pushState(null, '', '/');
    } catch {}
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: true });
    if (this.props.onResetToOverview) {
      this.props.onResetToOverview();
    } else {
      window.location.href = '/';
    }
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

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-all border border-slate-700 active:scale-95"
            >
              Resume Session
            </button>
            <button
              onClick={this.handleReturnOverview}
              className="px-4 py-2.5 rounded-xl bg-[#0e2a47] hover:bg-[#143a61] text-[#d4af37] text-xs sm:text-sm font-semibold transition-all border border-[#1d4670] active:scale-95"
            >
              Return to Campus Overview
            </button>
            <button
              onClick={this.handleReload}
              className="px-4 py-2.5 rounded-xl bg-[#1d4ed8] hover:bg-[#2563eb] text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-[#1d4ed8]/30 active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Campus Map
            </button>
          </div>

          {this.state.error && (
            <div className="mt-6 p-4 bg-slate-950/95 rounded-xl border border-amber-500/40 text-left max-w-2xl w-full overflow-hidden text-xs font-mono text-slate-300 shadow-2xl">
              <div className="font-bold text-amber-400 mb-1 text-sm flex items-center justify-between">
                <span>⚠️ Diagnostic Details:</span>
                <button
                  type="button"
                  onClick={() => {
                    const text = `${this.state.error?.toString()}\n${this.state.error?.stack || ''}\n${this.state.errorInfo?.componentStack || ''}`;
                    navigator.clipboard?.writeText(text);
                  }}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300"
                >
                  Copy Error
                </button>
              </div>
              <div className="text-red-300 font-semibold mb-2 break-words">
                {this.state.error?.toString()}
              </div>
              {this.state.error?.stack && (
                <div className="text-slate-400 text-[10px] whitespace-pre-wrap font-mono p-2 bg-slate-900 rounded border border-slate-800 max-h-36 overflow-y-auto">
                  {this.state.error.stack}
                </div>
              )}
              {this.state.errorInfo?.componentStack && (
                <div className="text-slate-500 text-[9px] whitespace-pre-wrap font-mono mt-2 p-2 bg-slate-900/60 rounded max-h-36 overflow-y-auto">
                  {this.state.errorInfo.componentStack}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
