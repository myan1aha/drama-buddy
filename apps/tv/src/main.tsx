import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from '@drama-buddy/shared/components/ErrorBoundary';
import { setupGlobalErrorHandlers } from '@drama-buddy/shared/utils/global-error-handler';
import './styles/tv-global.css';

// Install global error handlers
setupGlobalErrorHandlers();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
