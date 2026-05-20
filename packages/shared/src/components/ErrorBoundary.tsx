import React, { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback UI */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  /** Called when an error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary — 全局错误捕获
 * 防止单个组件崩溃导致整个 app 白屏
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return (this.props.fallback as (error: Error, reset: () => void) => ReactNode)(
            this.state.error,
            this.reset
          );
        }
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: '200px',
          padding: '32px',
          textAlign: 'center',
          color: '#e2e8f0',
          background: 'rgba(15, 15, 23, 0.95)',
          borderRadius: '12px',
          gap: '16px',
        }}>
          <div style={{ fontSize: '48px' }}>😵</div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>出了点问题</h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8', maxWidth: '400px' }}>
            {this.state.error.message || '未知错误'}
          </p>
          <button
            onClick={this.reset}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#a5b4fc',
              fontSize: '14px',
              cursor: 'pointer',
              marginTop: '8px',
            }}
          >
            重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
