import { useState } from 'react';

const AuthRouter = ({ onAuthSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSkipAuth = () => {
    // Simulate successful authentication for demo purposes
    const mockUser = { id: 'demo-user', email: 'demo@example.com' };
    const mockSession = { access_token: 'demo-token' };
    onAuthSuccess(mockUser, mockSession);
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ 
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
    }}>
      <div className="w-full max-w-md mx-auto px-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3a1 1 0 011-1h2.586l6.414-6.414A6 6 0 0121 9z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">Topic Explorer</h1>
          <p className="text-gray-300 mb-8">
            Authentication system is being configured. You can continue with demo mode.
          </p>
          
          <button
            onClick={handleSkipAuth}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {isLoading ? 'Loading...' : 'Continue with Demo Mode'}
          </button>
          
          <p className="text-xs text-gray-400 mt-4">
            Full authentication will be available in future updates
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthRouter;