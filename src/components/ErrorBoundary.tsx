import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
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
    console.error('Uncaught error in game:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-slate-950 text-amber-200 flex flex-col items-center justify-center p-6 z-[999999]">
          <div className="bg-stone-900 border-2 border-amber-500 rounded-3xl p-6 max-w-xl w-full shadow-2xl text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-2xl font-serif font-black text-amber-400 mb-2">
              Chyba pri behu hry
            </h2>
            <p className="text-sm text-stone-300 mb-4">
              {this.state.error?.message || 'Nastala neočakávaná chyba.'}
            </p>
            {this.state.errorInfo && (
              <pre className="bg-black/60 p-3 rounded-xl text-left text-xs text-red-300 overflow-x-auto max-h-40 mb-4 font-mono">
                {this.state.error?.stack || this.state.errorInfo.componentStack}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-2xl cursor-pointer uppercase tracking-wider font-serif"
            >
              Reštartovať hru
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
