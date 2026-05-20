/**
 * 全局错误处理 — 未捕获异常 & Promise rejection
 * 在 app 入口处调用 `setupGlobalErrorHandlers()`
 */

type ErrorReporter = (error: {
  type: 'uncaught' | 'unhandledrejection';
  message: string;
  stack?: string;
  timestamp: number;
}) => void;

let reporter: ErrorReporter = (err) => {
  console.error(`[GlobalError][${err.type}]`, err.message, err.stack);
};

/** Set custom error reporter (e.g., Sentry, custom analytics) */
export function setErrorReporter(fn: ErrorReporter) {
  reporter = fn;
}

/** Install global error handlers — call once at app bootstrap */
export function setupGlobalErrorHandlers() {
  if (typeof window === 'undefined') return;

  // Uncaught exceptions
  window.addEventListener('error', (event) => {
    reporter({
      type: 'uncaught',
      message: event.message || String(event.error),
      stack: event.error?.stack,
      timestamp: Date.now(),
    });
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    reporter({
      type: 'unhandledrejection',
      message: reason?.message || String(reason),
      stack: reason?.stack,
      timestamp: Date.now(),
    });
  });
}
