import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import KnowledgeGraph3D from './KnowledgeGraph3D';

const KnowledgeGraphPage = ({ onNavigate, onShowAuth }) => {
  const { user, currentUserSession, getAuthHeaders } = useAuth();
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [viewMode, setViewMode] = useState('3d'); // '3d' or 'stats'
  
  // Initialize session ID
  useEffect(() => {
    if (user && currentUserSession) {
      setSessionId(currentUserSession.id);
    } else {
      const currentSessionId = sessionStorage.getItem('appSessionId');
      setSessionId(currentSessionId);
    }
  }, [user, currentUserSession]);
  
  // Fetch knowledge graph data
  useEffect(() => {
    const fetchGraphData = async () => {
      if (!sessionId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams();
        if (user && currentUserSession) {
          params.append('userSessionId', sessionId);
        } else {
          params.append('sessionId', sessionId);
        }
        
        const authHeaders = user ? getAuthHeaders() : {};
        const response = await fetch(`/api/knowledge-graph?${params}`, {
          headers: authHeaders
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch knowledge graph data');
        }
        
        const data = await response.json();
        setGraphData(data);
      } catch (err) {
        console.error('Error fetching graph data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGraphData();
  }, [sessionId, user, currentUserSession, getAuthHeaders]);
  
  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
  };
  
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
      }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Building Your Knowledge Graph</h2>
          <p className="text-gray-300">Analyzing your exploration patterns...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
      }}>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Graph</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  if (!graphData || graphData.topics.length === 0) {
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
                <h1 className="text-xl font-bold text-white">Knowledge Graph</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <nav className="flex items-center space-x-6">
                  <button 
                    onClick={() => onNavigate?.('dashboard')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={() => onNavigate?.('sessions')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Sessions
                  </button>
                  <button 
                    onClick={() => onNavigate?.('profile')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Profile
                  </button>
                </nav>
                
                {!user && (
                  <button 
                    onClick={onShowAuth}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>
        
        {/* Empty State */}
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No Topics Explored Yet</h2>
            <p className="text-gray-300 mb-6">Start exploring topics to build your knowledge graph</p>
            <button 
              onClick={() => onNavigate?.('dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Explore Topics
            </button>
          </div>
        </div>
      </div>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white">Knowledge Graph</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg p-1">
                <button
                  onClick={() => handleViewModeChange('3d')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === '3d' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  3D View
                </button>
                <button
                  onClick={() => handleViewModeChange('stats')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === 'stats' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Statistics
                </button>
              </div>
              
              <nav className="flex items-center space-x-6">
                <button 
                  onClick={() => onNavigate?.('dashboard')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => onNavigate?.('sessions')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Sessions
                </button>
                <button 
                  onClick={() => onNavigate?.('profile')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Profile
                </button>
              </nav>
              
              {!user && (
                <button 
                  onClick={onShowAuth}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      {viewMode === '3d' ? (
        <div className="h-screen">
          <KnowledgeGraph3D
            topics={graphData.topics}
            connections={graphData.connections}
            clusters={graphData.clusters}
            onTopicSelect={handleTopicSelect}
            selectedTopic={selectedTopic}
            className="h-full"
          />
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Overview Stats */}
            <div className="bg-white/5 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Topics</span>
                  <span className="text-white font-semibold">{graphData.stats.totalTopics}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Connections</span>
                  <span className="text-white font-semibold">{graphData.stats.totalConnections}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Categories</span>
                  <span className="text-white font-semibold">
                    {Object.keys(graphData.stats.clusterDistribution).length}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Cluster Distribution */}
            <div className="bg-white/5 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Knowledge Areas</h3>
              <div className="space-y-2">
                {Object.entries(graphData.stats.clusterDistribution)
                  .sort(([,a], [,b]) => b - a)
                  .map(([cluster, count]) => (
                  <div key={cluster} className="flex justify-between items-center">
                    <span className="text-gray-300 capitalize">{cluster}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ 
                            width: `${(count / graphData.stats.totalTopics) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-white text-sm font-semibold">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Recent Topics */}
            <div className="bg-white/5 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Topics</h3>
              <div className="space-y-2">
                {graphData.topics.slice(0, 5).map((topic) => (
                  <div 
                    key={topic.id}
                    className="p-2 bg-gray-800/30 rounded-lg cursor-pointer hover:bg-gray-700/30 transition-colors"
                    onClick={() => setSelectedTopic(topic)}
                  >
                    <div className="text-white text-sm font-medium">{topic.name}</div>
                    <div className="text-gray-400 text-xs capitalize">
                      {graphData.clusters[topic.id] || 'uncategorized'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraphPage;