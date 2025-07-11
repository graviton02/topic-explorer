import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import AuthRouter from './components/auth/AuthRouter';
import MainDashboard from './components/MainDashboard';
import SessionsPage from './components/SessionsPage';
import ProfilePage from './components/ProfilePage';
import { validateEnvironment } from './lib/env-validation';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'sessions', 'profile'
  const [envError, setEnvError] = useState(null);

  // Validate environment on app start
  useEffect(() => {
    if (!validateEnvironment()) {
      setEnvError('Environment configuration is incomplete. Please check your .env file.');
    }
  }, []);

  const handleAuthSuccess = (user, session) => {
    setIsAuthenticated(true);
    setShowAuth(false);
    console.log('User authenticated:', user);
  };

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleSkipAuth = () => {
    setShowAuth(false);
    setIsAuthenticated(false);
  };

  // Show environment error screen if configuration is incomplete
  if (envError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
      }}>
        <div className="w-full max-w-md mx-auto px-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Configuration Error</h1>
            <p className="text-gray-300 mb-6">{envError}</p>
            <div className="text-left text-sm text-gray-400 space-y-2">
              <p>Please ensure your .env file contains:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>VITE_SUPABASE_URL</li>
                <li>VITE_SUPABASE_ANON_KEY</li>
              </ul>
              <p className="mt-4">
                See <span className="text-blue-400 font-mono">DEVELOPMENT_SETUP.md</span> for detailed instructions.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show auth screens if requested
  if (showAuth) {
    return (
      <AuthProvider>
        <AuthRouter onAuthSuccess={handleAuthSuccess} />
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      {currentView === 'sessions' ? (
        <SessionsPage onNavigate={setCurrentView} onShowAuth={handleShowAuth} />
      ) : currentView === 'profile' ? (
        <ProfilePage onNavigate={setCurrentView} onShowAuth={handleShowAuth} />
      ) : (
        <MainDashboard onNavigate={setCurrentView} onShowAuth={handleShowAuth} />
      )}
    </AuthProvider>
  );
}

export default App
