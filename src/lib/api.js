// API service for handling all API calls (supports both authenticated and anonymous users)

/**
 * Fetch topic information from the API
 * @param {string} topic - The topic to fetch information for
 * @param {Object} authHeaders - Optional auth headers for authenticated requests
 * @returns {Promise<Object>} - The response data
 */
export const fetchTopic = async (topic, authHeaders = {}) => {
  try {
    const response = await fetch('/api/topic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch topic');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching topic:', error);
    throw error;
  }
};

/**
 * Save topic to history (supports both authenticated and anonymous users)
 * @param {Object} historyItem - The item to save
 * @param {Object} authHeaders - Optional auth headers for authenticated requests
 * @returns {Promise<Object>} - The response data
 */
export const saveTopicToHistory = async (historyItem, authHeaders = {}) => {
  try {
    const payload = {
      name: historyItem.name,
      description: historyItem.data.description,
      subtopics: historyItem.data.subtopics,
      questions: historyItem.data.questions,
      parent_topic_id: historyItem.parentTopicId || null,
    };

    // Add session identifiers based on user type
    if (authHeaders.Authorization) {
      // Authenticated user
      payload.user_session_id = historyItem.userSessionId;
    } else {
      // Anonymous user
      payload.session_id = historyItem.sessionId;
    }

    const response = await fetch('/api/history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle schema-specific errors with helpful messages
      if (errorData.schemaError) {
        throw new Error('Database setup incomplete. Please run the database setup script (database-schema-fix.sql) to fix missing columns.');
      }
      
      throw new Error(errorData.error || 'Failed to save history');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving topic to history:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch topic history (supports both authenticated and anonymous users)
 * @param {string} sessionId - The session ID (for anonymous users)
 * @param {string} userSessionId - The user session ID (for authenticated users)
 * @param {Object} authHeaders - Optional auth headers for authenticated requests
 * @returns {Promise<Array>} - An array of history items
 */
export const fetchTopicHistory = async (sessionId, userSessionId = null, authHeaders = {}) => {
  if (!sessionId && !userSessionId) {
    console.error('Session ID is required to fetch history');
    return [];
  }
  
  try {
    const params = new URLSearchParams();
    
    if (authHeaders.Authorization && userSessionId) {
      params.append('userSessionId', userSessionId);
    } else if (sessionId) {
      params.append('sessionId', sessionId);
    }
    
    const response = await fetch(`/api/history?${params}`, {
      headers: {
        ...authHeaders,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch history');
    }
    
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching topic history:', error);
    return [];
  }
};

/**
 * Clear topic history (supports both authenticated and anonymous users)
 * @param {string} sessionId - The session ID (for anonymous users)
 * @param {string} userSessionId - The user session ID (for authenticated users)
 * @param {Object} authHeaders - Optional auth headers for authenticated requests
 * @returns {Promise<Object>} - The response data
 */
export const clearTopicHistory = async (sessionId, userSessionId = null, authHeaders = {}) => {
  if (!sessionId && !userSessionId) {
    console.error('Session ID is required to clear history');
    return { success: false, error: 'Session ID required' };
  }
  
  try {
    const params = new URLSearchParams();
    
    if (authHeaders.Authorization && userSessionId) {
      params.append('userSessionId', userSessionId);
    } else if (sessionId) {
      params.append('sessionId', sessionId);
    }
    
    const response = await fetch(`/api/history?${params}`, {
      method: 'DELETE',
      headers: {
        ...authHeaders,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to clear history');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error clearing topic history:', error);
    return { success: false, error: error.message };
  }
};

// New API functions for authenticated users

/**
 * Fetch user sessions
 * @param {Object} authHeaders - Auth headers for authenticated requests
 * @returns {Promise<Array>} - An array of user sessions
 */
export const fetchUserSessions = async (authHeaders) => {
  try {
    const response = await fetch('/api/sessions', {
      headers: authHeaders,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch sessions');
    }
    
    const result = await response.json();
    return result.sessions || [];
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    return [];
  }
};

/**
 * Create new user session
 * @param {string} sessionName - Name for the new session
 * @param {Object} authHeaders - Auth headers for authenticated requests
 * @returns {Promise<Object>} - The created session
 */
export const createUserSession = async (sessionName, authHeaders) => {
  try {
    const response = await fetch('/api/sessions', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ sessionName }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create session');
    }
    
    const result = await response.json();
    return result.session;
  } catch (error) {
    console.error('Error creating user session:', error);
    throw error;
  }
};

/**
 * Update user session
 * @param {string} sessionId - The session ID to update
 * @param {string} sessionName - New name for the session
 * @param {Object} authHeaders - Auth headers for authenticated requests
 * @returns {Promise<Object>} - The updated session
 */
export const updateUserSession = async (sessionId, sessionName, authHeaders) => {
  try {
    const response = await fetch(`/api/sessions/${sessionId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ sessionName }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update session');
    }
    
    const result = await response.json();
    return result.session;
  } catch (error) {
    console.error('Error updating user session:', error);
    throw error;
  }
};

/**
 * Delete user session
 * @param {string} sessionId - The session ID to delete
 * @param {Object} authHeaders - Auth headers for authenticated requests
 * @returns {Promise<Object>} - The response data
 */
export const deleteUserSession = async (sessionId, authHeaders) => {
  try {
    const response = await fetch(`/api/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete session');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting user session:', error);
    throw error;
  }
};

/**
 * Fetch user statistics
 * @param {Object} authHeaders - Auth headers for authenticated requests
 * @returns {Promise<Object>} - User statistics
 */
export const fetchUserStats = async (authHeaders) => {
  try {
    const response = await fetch('/api/user/stats', {
      headers: authHeaders,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch user stats');
    }
    
    const result = await response.json();
    return result.stats;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

/**
 * Fetch exploration paths for visual map
 * @param {string} sessionId - Optional session ID to filter by
 * @param {Object} authHeaders - Auth headers for authenticated requests
 * @returns {Promise<Array>} - Array of exploration paths
 */
export const fetchExplorationPaths = async (sessionId = null, authHeaders) => {
  try {
    const params = new URLSearchParams();
    if (sessionId) params.append('sessionId', sessionId);
    
    const response = await fetch(`/api/exploration-paths?${params}`, {
      headers: authHeaders,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch exploration paths');
    }
    
    const result = await response.json();
    return result.paths || [];
  } catch (error) {
    console.error('Error fetching exploration paths:', error);
    return [];
  }
};

/**
 * Fetch topics for visual map
 * @param {string} sessionId - Optional session ID to filter by
 * @param {Object} authHeaders - Auth headers for authenticated requests
 * @returns {Promise<Array>} - Array of topics
 */
export const fetchTopicsForMap = async (sessionId = null, authHeaders) => {
  try {
    const params = new URLSearchParams();
    if (sessionId) params.append('sessionId', sessionId);
    
    const response = await fetch(`/api/topics-for-map?${params}`, {
      headers: authHeaders,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch topics for map');
    }
    
    const result = await response.json();
    return result.topics || [];
  } catch (error) {
    console.error('Error fetching topics for map:', error);
    return [];
  }
};

/**
 * Migrate anonymous session to user account
 * @param {string} sessionId - The anonymous session ID
 * @param {string} sessionName - Name for the migrated session
 * @param {Object} authHeaders - Auth headers for authenticated requests
 * @returns {Promise<string>} - The new user session ID
 */
export const migrateAnonymousSession = async (sessionId, sessionName, authHeaders) => {
  try {
    const response = await fetch('/api/auth/migrate-session', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ sessionId, sessionName }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to migrate session');
    }
    
    const result = await response.json();
    return result.newSessionId;
  } catch (error) {
    console.error('Error migrating session:', error);
    throw error;
  }
};

/**
 * Fetch knowledge graph data
 * @param {string} sessionId - The session ID (for anonymous users)
 * @param {string} userSessionId - The user session ID (for authenticated users)
 * @param {Object} authHeaders - Optional auth headers for authenticated requests
 * @returns {Promise<Object>} - Knowledge graph data with topics, connections, and clusters
 */
export const fetchKnowledgeGraph = async (sessionId, userSessionId = null, authHeaders = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (authHeaders.Authorization && userSessionId) {
      params.append('userSessionId', userSessionId);
    } else if (sessionId) {
      params.append('sessionId', sessionId);
    }
    
    console.log('Fetching knowledge graph with params:', params.toString());
    
    const response = await fetch(`/api/knowledge-graph?${params}`, {
      headers: {
        ...authHeaders,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch knowledge graph');
    }
    
    const result = await response.json();
    console.log('Knowledge graph data received:', result);
    return result;
  } catch (error) {
    console.error('Error fetching knowledge graph:', error);
    throw error;
  }
}; 