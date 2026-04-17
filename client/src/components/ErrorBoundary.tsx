import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    setTimeout(() => {
      this.setState({ errorInfo });
    }, 1);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 text-red-600 bg-white font-mono border-t-4 border-red-600 shadow-2xl m-8 rounded-xl overflow-hidden">
          <h1 className="text-3xl font-black mb-4 uppercase tracking-tighter">Node Fatal Error</h1>
          <h2 className="text-xl font-bold mb-6 text-slate-700">{this.state.error?.message}</h2>
          <pre className="mt-6 text-xs whitespace-pre-wrap overflow-x-auto p-6 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 shadow-inner max-h-[40vh]">
            {this.state.error?.stack}
          </pre>
          {this.state.errorInfo && (
            <pre className="mt-6 text-xs whitespace-pre-wrap overflow-x-auto p-6 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 shadow-inner max-h-[40vh]">
              {this.state.errorInfo.componentStack}
            </pre>
          )}
          <div className="mt-8 flex justify-end">
             <button 
               onClick={() => window.location.reload()} 
               className="px-6 py-2 bg-slate-900 text-white font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-slate-800 transition-all active:scale-95"
             >
               Attempt Re-Synchronization
             </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
