import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Homepage from './pages/Homepage';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Homepage />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;