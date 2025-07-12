import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TopicForm from './TopicForm';
import TopicContent from './TopicContent';
import Navigation from './Navigation';
import HistoryPage from './HistoryPage';
import { fetchTopic, saveTopicToHistory, fetchTopicHistory, clearTopicHistory } from '../lib/api';

// Function to generate a simple UUID (for client-side session tracking)
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Function to generate session ID for anonymous users (TEXT format)
const generateAnonymousSessionId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `anon_${timestamp}_${random}`;
};

// Helper to map DB history item to client-side history item structure
const mapDbHistoryItemToClient = (dbItem) => ({
  id: dbItem.id,
  name: dbItem.name,
  timestamp: dbItem.timestamp,
  data: {
    description: dbItem.description,
    subtopics: dbItem.subtopics,
    questions: dbItem.questions,
  },
});

const MainDashboard = ({ onNavigate, onShowAuth }) => {
  const { user, currentUserSession, getAuthHeaders, isRealAuthenticatedUser, createNewAutoSession, trackActivity } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [topicData, setTopicData] = useState(null);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  
  const [history, setHistory] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(-1);
  const [currentView, setCurrentView] = useState('main');

  // Effect to initialize sessionId with automatic session management
  useEffect(() => {
    const initializeSession = async () => {
      if (isRealAuthenticatedUser()) {
        if (currentUserSession) {
          // User has an active session
          setSessionId(currentUserSession.id);
        } else {
          // User is authenticated but has no active session, create one automatically
          console.log('User authenticated but no session, creating auto-session...');
          const newSession = await createNewAutoSession();
          if (newSession) {
            setSessionId(newSession.id);
          }
        }
      } else {
        // Anonymous user (including demo mode users)
        let currentSessionId = sessionStorage.getItem('appSessionId');
        if (!currentSessionId) {
          currentSessionId = generateAnonymousSessionId();
          sessionStorage.setItem('appSessionId', currentSessionId);
        }
        setSessionId(currentSessionId);
      }
    };

    initializeSession();
  }, [user, currentUserSession, isRealAuthenticatedUser, createNewAutoSession]);

  // Effect to fetch history when sessionId is available
  useEffect(() => {
    if (sessionId) {
      const loadHistory = async () => {
        setIsHistoryLoading(true);
        try {
          let dbHistory;
          if (isRealAuthenticatedUser() && currentUserSession) {
            // Real authenticated user
            dbHistory = await fetchTopicHistory(null, sessionId, getAuthHeaders());
          } else {
            // Anonymous user (including demo mode)
            dbHistory = await fetchTopicHistory(sessionId);
          }
          
          const clientHistory = dbHistory.map(mapDbHistoryItemToClient);
          setHistory(clientHistory);
          setCurrentPosition(-1);
          setTopicData(null);
        } catch (err) {
          console.error("Failed to load history:", err);
          setError("Failed to load session history."); 
        }
        setIsHistoryLoading(false);
      };
      loadHistory();
    }
  }, [sessionId, user, currentUserSession, getAuthHeaders]);

  const handleTopicSubmit = async (topic) => {
    // Track user activity for session timeout management
    trackActivity();
    
    if (!sessionId) {
      console.error("Session ID not initialized yet.");
      setError("Session not initialized. Please refresh.");
      return;
    }
    setIsLoading(true);
    setError(null);
    
    try {
      const authHeaders = isRealAuthenticatedUser() ? getAuthHeaders() : {};
      console.log('Topic submission debug info:');
      console.log('- User exists:', !!user);
      console.log('- User ID:', user?.id);
      console.log('- Session ID:', sessionId);
      console.log('- Current user session:', currentUserSession?.id);
      console.log('- isRealAuthenticatedUser():', isRealAuthenticatedUser());
      console.log('- Auth headers:', authHeaders);
      
      const openAiData = await fetchTopic(topic, authHeaders);

      const historyPayload = {
        name: topic,
        data: openAiData,
        sessionId: !isRealAuthenticatedUser() ? sessionId : null,
        userSessionId: isRealAuthenticatedUser() ? sessionId : null
      };
      
      console.log('History payload:', historyPayload);
      
      const savedHistoryItemResult = await saveTopicToHistory(historyPayload, authHeaders);

      // If authenticated user request failed with session_id error, try as anonymous user
      if (!savedHistoryItemResult.success && savedHistoryItemResult.error?.includes('session_id is required for anonymous users') && isRealAuthenticatedUser()) {
        console.warn('Authenticated user treated as anonymous by server, retrying as anonymous user');
        const fallbackPayload = {
          ...historyPayload,
          sessionId: sessionId,
          userSessionId: null
        };
        console.log('Fallback payload:', fallbackPayload);
        const fallbackResult = await saveTopicToHistory(fallbackPayload, {});
        
        if (fallbackResult.success) {
          console.log('Fallback request succeeded');
          // Use the fallback result
          Object.assign(savedHistoryItemResult, fallbackResult);
        } else {
          console.error('Fallback request also failed:', fallbackResult.error);
        }
      }

      if (savedHistoryItemResult.success && savedHistoryItemResult.data && savedHistoryItemResult.data.length > 0) {
        const newDbItem = savedHistoryItemResult.data[0];
        const newClientHistoryItem = mapDbHistoryItemToClient(newDbItem);

        const newHistoryList = currentPosition < history.length - 1
          ? [...history.slice(0, currentPosition + 1), newClientHistoryItem]
          : [...history, newClientHistoryItem];
        
        setHistory(newHistoryList);
        const newPosition = newHistoryList.length - 1;
        setCurrentPosition(newPosition);
        setTopicData(newClientHistoryItem.data);

      } else {
        setTopicData(openAiData);
        console.error('Failed to save topic to history:', savedHistoryItemResult.error);
        setError('Fetched topic, but failed to save to history. ' + (savedHistoryItemResult.error || ''));
      }
    } catch (err) {
      console.error('Error in handleTopicSubmit:', err);
      setError(err.message || 'Failed to process topic. Please try again.');
      setTopicData(null); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubtopicClick = (subtopic) => {
    trackActivity();
    handleTopicSubmit(subtopic);
  };

  const handleQuestionClick = (question) => {
    trackActivity();
    const cleanQuestion = question.endsWith('?') 
      ? question.substring(0, question.length - 1) 
      : question;
    handleTopicSubmit(cleanQuestion);
  };

  const handleBackClick = () => {
    trackActivity();
    if (currentPosition > 0) {
      const newPosition = currentPosition - 1;
      setCurrentPosition(newPosition);
      setTopicData(history[newPosition].data);
    }
  };

  const handleHistoryItemClick = (itemIndex) => {
    if (itemIndex >= 0 && itemIndex < history.length) {
      setCurrentPosition(itemIndex);
      setTopicData(history[itemIndex].data);
      setCurrentView('main');
    }
  };

  const handleClearAppHistory = async () => {
    if (!sessionId) return;
    setIsHistoryLoading(true);
    try {
      const authHeaders = isRealAuthenticatedUser() ? getAuthHeaders() : {};
      const result = isRealAuthenticatedUser() 
        ? await clearTopicHistory(null, sessionId, authHeaders)
        : await clearTopicHistory(sessionId);
        
      if (result.success) {
        setHistory([]);
        setCurrentPosition(-1);
        setTopicData(null);
        setError(null); 
      } else {
        throw new Error(result.error || "Failed to clear history on server");
      }
    } catch (err) {
      console.error("Failed to clear history:", err);
      setError("Failed to clear history. " + err.message);
    }
    setIsHistoryLoading(false);
  };

  const navigateToHistory = () => setCurrentView('history');
  const navigateToMain = () => setCurrentView('main');

  if (currentView === 'history') {
    return (
      <HistoryPage 
        history={history}
        onHistoryItemClick={handleHistoryItemClick}
        onClearHistory={handleClearAppHistory}
        isLoading={isHistoryLoading}
        currentTopicName={topicData && history[currentPosition] ? history[currentPosition].name : null}
        onNavigateHome={navigateToMain}
      />
    );
  }

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
    }}>
      {/* Header */}
      <header className="border-b border-gray-800/50 bg-gray-900/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white">Topic Explorer</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Navigation Menu */}
              <nav className="flex items-center space-x-6">
                <button className="text-blue-400 font-medium">
                  Dashboard
                </button>
                <button 
                  onClick={() => onNavigate?.('knowledge-graph')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Knowledge Graph
                </button>
                <button 
                  onClick={() => onNavigate?.('profile')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Profile
                </button>
              </nav>
              
              {user ? (
                <div className="flex items-center space-x-2">
                  {currentUserSession && (
                    <select className="bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-1 text-sm text-white">
                      <option>{currentUserSession.session_name || 'Session 1'}</option>
                    </select>
                  )}
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.user_metadata?.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={onShowAuth}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-5xl font-bold text-white mb-4">Topic Explorer</h2>
          <p className="text-xl text-gray-300">Explore and discover new topics with AI</p>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <TopicForm 
              onTopicSubmit={handleTopicSubmit} 
              isLoading={isLoading}
              className="pl-10"
            />
          </div>
          
          <div className="flex justify-center mt-6 space-x-4">
            <button 
              onClick={() => handleTopicSubmit('Machine Learning')}
              className="px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white hover:bg-gray-700/50 transition-colors"
            >
              Machine Learning
            </button>
            <button 
              onClick={() => handleTopicSubmit('Data Science')}
              className="px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white hover:bg-gray-700/50 transition-colors"
            >
              Data Science
            </button>
            <button 
              onClick={() => handleTopicSubmit('Cloud Computing')}
              className="px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white hover:bg-gray-700/50 transition-colors"
            >
              Cloud Computing
            </button>
            <button 
              onClick={() => handleTopicSubmit('Cybersecurity')}
              className="px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white hover:bg-gray-700/50 transition-colors"
            >
              Cybersecurity
            </button>
            <button 
              onClick={() => handleTopicSubmit('Blockchain')}
              className="px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white hover:bg-gray-700/50 transition-colors"
            >
              Blockchain
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          <button 
            onClick={navigateToHistory}
            className="px-6 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white hover:bg-gray-700/50 transition-colors"
          >
            View History
          </button>
          <button 
            onClick={() => onNavigate?.('knowledge-graph')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
            </svg>
            <span>Knowledge Graph</span>
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Explore
          </button>
        </div>

        {/* Content Section */}
        <div className="bg-white/5 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
          <Navigation 
            history={history} 
            currentPosition={currentPosition}
            onBackClick={handleBackClick}
          />
          
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded-md text-red-300">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          <TopicContent 
            data={topicData}
            isLoading={isLoading}
            onSubtopicClick={handleSubtopicClick}
            onQuestionClick={handleQuestionClick}
          />
        </div>

        {/* Footer */}
        <footer className="text-center mt-8">
          <p className="text-gray-400">Powered by OpenAI and Supabase</p>
        </footer>
      </div>
    </div>
  );
};

export default MainDashboard;