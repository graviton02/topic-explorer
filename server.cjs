// Express server for local API development
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: SUPABASE_URL or SUPABASE_SERVICE_KEY is not set in environment variables.');
}
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

if (supabase) {
  console.log('Supabase client initialized successfully for server.');
} else {
  console.log('Supabase client NOT initialized for server.');
}

const app = express();
const port = process.env.PORT || 3001;

// Ensure OPENAI_API_KEY is loaded from .env
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('ERROR: OPENAI_API_KEY is not set in the environment variables. Please check your .env file.');
} else {
  console.log('OpenAI API Key loaded successfully from environment variable.');
}

// Initialize OpenAI client
let openai = null;
if (apiKey) {
  try {
    openai = new OpenAI({ apiKey });
    console.log('OpenAI client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize OpenAI client:', error);
  }
} else {
  console.log('OpenAI client NOT initialized because OPENAI_API_KEY was not found.');
}

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }
    
    const token = authHeader.substring(7);
    
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client not initialized' });
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Optional authentication middleware (allows both authenticated and anonymous users)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      if (supabase) {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          req.user = user;
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};

// Authentication endpoints
app.post('/api/auth/migrate-session', authenticateUser, async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client not initialized' });
  }
  
  try {
    const { sessionId, sessionName = 'Migrated Session' } = req.body;
    const userId = req.user.id;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    // Call the migration function
    const { data, error } = await supabase
      .rpc('migrate_anonymous_session', {
        p_session_id: sessionId,
        p_user_id: userId,
        p_session_name: sessionName
      });
    
    if (error) {
      console.error('Migration error:', error);
      return res.status(500).json({ error: 'Failed to migrate session', details: error.message });
    }
    
    res.json({ success: true, newSessionId: data });
  } catch (error) {
    console.error('Session migration error:', error);
    res.status(500).json({ error: 'Internal server error during migration' });
  }
});

// User sessions endpoints
app.get('/api/sessions', authenticateUser, async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client not initialized' });
  }
  
  try {
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('user_sessions')
      .select(`
        *,
        topics:topics(count)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('last_accessed', { ascending: false });
    
    if (error) {
      console.error('Error fetching sessions:', error);
      return res.status(500).json({ error: 'Failed to fetch sessions' });
    }
    
    res.json({ success: true, sessions: data });
  } catch (error) {
    console.error('Sessions fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/sessions', authenticateUser, async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client not initialized' });
  }
  
  try {
    const { sessionName = 'New Session' } = req.body;
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        session_name: sessionName
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating session:', error);
      return res.status(500).json({ error: 'Failed to create session' });
    }
    
    res.json({ success: true, session: data });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/sessions/:sessionId', authenticateUser, async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client not initialized' });
  }
  
  try {
    const { sessionId } = req.params;
    const { sessionName } = req.body;
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('user_sessions')
      .update({ session_name: sessionName })
      .eq('id', sessionId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating session:', error);
      return res.status(500).json({ error: 'Failed to update session' });
    }
    
    res.json({ success: true, session: data });
  } catch (error) {
    console.error('Session update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/sessions/:sessionId', authenticateUser, async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client not initialized' });
  }
  
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    
    const { error } = await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('id', sessionId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting session:', error);
      return res.status(500).json({ error: 'Failed to delete session' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Session deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User statistics endpoint
app.get('/api/user/stats', authenticateUser, async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client not initialized' });
  }
  
  try {
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user stats:', error);
      return res.status(500).json({ error: 'Failed to fetch user statistics' });
    }
    
    res.json({ success: true, stats: data });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Topic API endpoint (updated to support both authenticated and anonymous users)
app.post('/api/topic', optionalAuth, async (req, res) => {
  try {
    const { topic } = req.body;
    
    console.log(`Processing topic request: "${topic}"`);
    
    if (!topic || topic.trim() === '') {
      return res.status(400).json({ error: 'Topic is required' });
    }

    // Always use OpenAI API if client is initialized
    if (openai) {
      console.log('Using OpenAI API for topic:', topic);

      // Construct the prompt for OpenAI
      const prompt = `
      Please provide information about the topic "${topic}" in the following format:
      
      1. A concise description (maximum 150 words)
      2. Exactly 5 related subtopics
      3. Exactly 5 relevant questions
      
      Format your response as JSON with the following structure:
      {
        "description": "your concise description here (max 150 words)",
        "subtopics": ["subtopic1", "subtopic2", "subtopic3", "subtopic4", "subtopic5"],
        "questions": ["question1?", "question2?", "question3?", "question4?", "question5?"]
      }
      `;

      console.log('Sending request to OpenAI API...');
      
      // Call OpenAI API
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You are a helpful assistant providing concise, accurate information." },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        });

        console.log('Received response from OpenAI API');
        
        // Extract the content
        const content = response.choices[0].message.content;
        
        // Parse the JSON response
        const parsedResponse = JSON.parse(content);
        
        // Validate the response format
        if (!parsedResponse.description || !Array.isArray(parsedResponse.subtopics) || !Array.isArray(parsedResponse.questions)) {
          throw new Error('Invalid response format from OpenAI');
        }
        
        // Ensure exactly 5 subtopics and questions
        if (parsedResponse.subtopics.length !== 5 || parsedResponse.questions.length !== 5) {
          throw new Error('OpenAI did not return exactly 5 subtopics and 5 questions');
        }

        console.log('Successfully processed OpenAI response');
        return res.json(parsedResponse);
      } catch (openAiError) {
        console.error('Error calling OpenAI API:', openAiError);
        throw openAiError;
      }
    } else {
      console.log('OpenAI client not initialized, using mock data for topic:', topic);
      return res.json({
        description: `Mock description for "${topic}". This is a placeholder since no OpenAI API key was provided. In a real implementation, this would be generated by OpenAI's API based on your topic.`,
        subtopics: [
          `${topic} - Subtopic 1`,
          `${topic} - Subtopic 2`,
          `${topic} - Subtopic 3`,
          `${topic} - Subtopic 4`,
          `${topic} - Subtopic 5`
        ],
        questions: [
          `What is ${topic}?`,
          `How does ${topic} work?`,
          `Why is ${topic} important?`,
          `When was ${topic} developed?`,
          `Who uses ${topic}?`
        ]
      });
    }
  } catch (error) {
    console.error('Error processing topic:', error);
    
    // Return error for development
    return res.status(500).json({ 
      error: 'Error processing your request', 
      message: error.message,
      description: "There was an error processing your request with the OpenAI API. Please check the server logs for details.",
      subtopics: [
        "Error - Subtopic 1",
        "Error - Subtopic 2",
        "Error - Subtopic 3",
        "Error - Subtopic 4",
        "Error - Subtopic 5"
      ],
      questions: [
        "Error - Question 1?",
        "Error - Question 2?",
        "Error - Question 3?",
        "Error - Question 4?",
        "Error - Question 5?"
      ]
    });
  }
});

// History API endpoint - POST to save topic (supports both authenticated and anonymous users)
app.post('/api/history', optionalAuth, async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client not initialized on server' });
  }
  try {
    const { session_id, user_session_id, name, description, subtopics, questions, parent_topic_id } = req.body;
    const userId = req.user?.id || null;

    if (!name || !description || !subtopics || !questions) {
      return res.status(400).json({ error: 'Missing required fields for history item' });
    }

    // For authenticated users, require user_session_id instead of session_id
    if (userId && !user_session_id) {
      return res.status(400).json({ error: 'user_session_id is required for authenticated users' });
    }

    // For anonymous users, require session_id
    if (!userId && !session_id) {
      return res.status(400).json({ error: 'session_id is required for anonymous users' });
    }

    // Cap history per session (50 topics)
    let countQuery;
    if (userId) {
      countQuery = supabase
        .from('topics')
        .select('id', { count: 'exact', head: true })
        .eq('user_session_id', user_session_id);
    } else {
      countQuery = supabase
        .from('topics')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', session_id);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error counting history items:', countError);
    }

    if (count !== null && count >= 50) {
      console.log(`History limit (50) reached. Not saving new topic.`);
      return res.status(429).json({ 
        error: 'History limit reached', 
        message: 'Maximum of 50 topics per session. Please clear history to save more.' 
      });
    }

    // Prepare insert data
    const insertData = {
      name,
      description,
      subtopics,
      questions,
      parent_topic_id
    };

    if (userId) {
      insertData.user_id = userId;
      insertData.user_session_id = user_session_id;
    } else {
      insertData.session_id = session_id;
    }

    const { data, error } = await supabase
      .from('topics')
      .insert([insertData])
      .select();

    if (error) {
      console.error('Error saving topic to Supabase:', error);
      return res.status(500).json({ error: 'Failed to save topic to history', details: error.message });
    }

    // If this topic was reached from another topic, create an exploration path
    if (userId && parent_topic_id) {
      await supabase
        .from('exploration_paths')
        .insert({
          user_id: userId,
          session_id: user_session_id,
          from_topic_id: parent_topic_id,
          to_topic_id: data[0].id
        });
    }

    console.log('Topic saved to history:', data);
    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Server error saving history:', error);
    res.status(500).json({ error: 'Internal server error while saving history' });
  }
});

// History API endpoint - GET to fetch history (supports both authenticated and anonymous users)
app.get('/api/history', optionalAuth, async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client not initialized on server' });
  }
  try {
    const { sessionId, userSessionId } = req.query;
    const userId = req.user?.id || null;

    // For authenticated users, use userSessionId
    if (userId) {
      if (!userSessionId) {
        return res.status(400).json({ error: 'Missing userSessionId query parameter for authenticated user' });
      }
      
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('user_session_id', userSessionId)
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching history from Supabase:', error);
        return res.status(500).json({ error: 'Failed to fetch history', details: error.message });
      }

      res.status(200).json({ success: true, data });
    } else {
      // For anonymous users, use sessionId
      if (!sessionId) {
        return res.status(400).json({ error: 'Missing sessionId query parameter for anonymous user' });
      }

      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('session_id', sessionId)
        .is('user_id', null)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching history from Supabase:', error);
        return res.status(500).json({ error: 'Failed to fetch history', details: error.message });
      }

      res.status(200).json({ success: true, data });
    }
  } catch (error) {
    console.error('Server error fetching history:', error);
    res.status(500).json({ error: 'Internal server error while fetching history' });
  }
});

// History API endpoint - DELETE to clear history (supports both authenticated and anonymous users)
app.delete('/api/history', optionalAuth, async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client not initialized on server' });
  }
  try {
    const { sessionId, userSessionId } = req.query;
    const userId = req.user?.id || null;

    if (userId) {
      if (!userSessionId) {
        return res.status(400).json({ error: 'Missing userSessionId query parameter for authenticated user' });
      }
      
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('user_session_id', userSessionId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting history from Supabase:', error);
        return res.status(500).json({ error: 'Failed to delete history', details: error.message });
      }

      console.log(`History cleared for user_session_id: ${userSessionId}`);
      res.status(200).json({ success: true, message: 'History cleared successfully' });
    } else {
      if (!sessionId) {
        return res.status(400).json({ error: 'Missing sessionId query parameter for anonymous user' });
      }

      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('session_id', sessionId)
        .is('user_id', null);

      if (error) {
        console.error('Error deleting history from Supabase:', error);
        return res.status(500).json({ error: 'Failed to delete history', details: error.message });
      }

      console.log(`History cleared for session_id: ${sessionId}`);
      res.status(200).json({ success: true, message: 'History cleared successfully' });
    }
  } catch (error) {
    console.error('Server error deleting history:', error);
    res.status(500).json({ error: 'Internal server error while deleting history' });
  }
});

// Exploration paths API for visual map
app.get('/api/exploration-paths', authenticateUser, async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client not initialized' });
  }
  
  try {
    const { sessionId } = req.query;
    const userId = req.user.id;
    
    let query = supabase
      .from('exploration_paths')
      .select(`
        *,
        from_topic:topics!from_topic_id(id, name, description),
        to_topic:topics!to_topic_id(id, name, description)
      `)
      .eq('user_id', userId);
    
    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching exploration paths:', error);
      return res.status(500).json({ error: 'Failed to fetch exploration paths' });
    }
    
    res.json({ success: true, paths: data });
  } catch (error) {
    console.error('Exploration paths error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get topics for visual map (nodes)
app.get('/api/topics-for-map', authenticateUser, async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client not initialized' });
  }
  
  try {
    const { sessionId } = req.query;
    const userId = req.user.id;
    
    let query = supabase
      .from('topics')
      .select('id, name, description, timestamp, parent_topic_id')
      .eq('user_id', userId);
    
    if (sessionId) {
      query = query.eq('user_session_id', sessionId);
    }
    
    const { data, error } = await query.order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Error fetching topics for map:', error);
      return res.status(500).json({ error: 'Failed to fetch topics for map' });
    }
    
    res.json({ success: true, topics: data });
  } catch (error) {
    console.error('Topics for map error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint for Railway
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Debug endpoint to check environment variables
app.get('/api/debug', (req, res) => {
  res.json({
    hasOpenAiKey: !!process.env.OPENAI_API_KEY,
    openAiKeyPrefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'NOT_FOUND',
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_KEY,
    openAiClientInitialized: !!openai,
    nodeEnv: process.env.NODE_ENV,
    railwayEnv: process.env.RAILWAY_ENVIRONMENT
  });
});

// Placeholder for legacy graph API (keep for compatibility)
app.get('/api/graph', (req, res) => {
  res.json({ message: 'Graph API has been replaced by /api/exploration-paths and /api/topics-for-map' });
});

app.post('/api/graph', (req, res) => {
  res.json({ message: 'Graph data is now automatically saved when topics are created' });
});

// Smart Topic Clustering Algorithm
function clusterTopics(topics) {
  const clusters = {};
  
  // Define keyword patterns for different categories
  const clusterKeywords = {
    'technology': [
      'machine learning', 'artificial intelligence', 'ai', 'ml', 'programming', 'software', 
      'computer', 'algorithm', 'data science', 'python', 'javascript', 'web development',
      'blockchain', 'cryptocurrency', 'cloud computing', 'cybersecurity', 'automation',
      'robotics', 'iot', 'internet of things', 'neural network', 'deep learning',
      'api', 'database', 'framework', 'coding', 'tech', 'digital', 'app', 'mobile'
    ],
    'science': [
      'physics', 'chemistry', 'biology', 'research', 'experiment', 'scientific',
      'study', 'theory', 'hypothesis', 'analysis', 'genetics', 'evolution',
      'quantum', 'molecular', 'climate', 'environment', 'ecology', 'astronomy',
      'geology', 'mathematics', 'statistics', 'laboratory', 'discovery'
    ],
    'business': [
      'business', 'marketing', 'finance', 'management', 'strategy', 'startup',
      'entrepreneur', 'investment', 'market', 'economy', 'sales', 'customer',
      'revenue', 'profit', 'company', 'corporate', 'leadership', 'team',
      'project management', 'agile', 'productivity', 'innovation', 'growth'
    ],
    'health': [
      'health', 'medical', 'medicine', 'healthcare', 'wellness', 'fitness',
      'nutrition', 'diet', 'exercise', 'mental health', 'therapy', 'treatment',
      'disease', 'prevention', 'symptoms', 'diagnosis', 'pharmaceutical',
      'hospital', 'patient', 'doctor', 'nurse', 'surgery', 'recovery'
    ],
    'education': [
      'education', 'learning', 'teaching', 'school', 'university', 'student',
      'curriculum', 'academic', 'knowledge', 'skill', 'training', 'course',
      'degree', 'certification', 'pedagogy', 'classroom', 'online learning',
      'e-learning', 'tutorial', 'lesson', 'study', 'research'
    ],
    'creative': [
      'art', 'design', 'creative', 'music', 'writing', 'literature', 'poetry',
      'painting', 'photography', 'film', 'movie', 'theater', 'dance',
      'sculpture', 'graphic design', 'ux', 'ui', 'visual', 'aesthetic',
      'storytelling', 'creativity', 'inspiration', 'culture', 'entertainment'
    ],
    'lifestyle': [
      'lifestyle', 'travel', 'food', 'cooking', 'recipe', 'culture', 'tradition',
      'hobby', 'entertainment', 'sports', 'game', 'leisure', 'fashion',
      'home', 'family', 'relationship', 'personal development', 'mindfulness',
      'meditation', 'philosophy', 'spirituality', 'community', 'social'
    ]
  };
  
  // Score each topic against cluster keywords
  topics.forEach(topic => {
    const topicText = (topic.name + ' ' + (topic.description || '') + ' ' + 
                     (topic.subtopics || []).join(' ') + ' ' + 
                     (topic.questions || []).join(' ')).toLowerCase();
    
    let maxScore = 0;
    let bestCluster = 'default';
    
    Object.entries(clusterKeywords).forEach(([cluster, keywords]) => {
      let score = 0;
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = topicText.match(regex);
        if (matches) {
          score += matches.length;
        }
      });
      
      if (score > maxScore) {
        maxScore = score;
        bestCluster = cluster;
      }
    });
    
    clusters[topic.id] = maxScore > 0 ? bestCluster : 'default';
  });
  
  return clusters;
}

// API endpoint for knowledge graph data
app.get('/api/knowledge-graph', optionalAuth, async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client not initialized' });
  }
  
  try {
    const { sessionId, userSessionId } = req.query;
    const userId = req.user?.id || null;
    
    let topics = [];
    let connections = [];
    
    // Fetch topics based on user type
    if (userId && userSessionId) {
      // Authenticated user
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('*')
        .eq('user_session_id', userSessionId)
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });
      
      if (topicsError) throw topicsError;
      topics = topicsData || [];
      
      // Fetch exploration paths for connections
      const { data: pathsData, error: pathsError } = await supabase
        .from('exploration_paths')
        .select(`
          from_topic_id,
          to_topic_id,
          from_topic:topics!from_topic_id(id, name),
          to_topic:topics!to_topic_id(id, name)
        `)
        .eq('user_id', userId)
        .eq('session_id', userSessionId);
      
      if (!pathsError && pathsData) {
        connections = pathsData.map(path => ({
          from: path.from_topic_id,
          to: path.to_topic_id,
          strength: 1
        }));
      }
    } else if (sessionId) {
      // Anonymous user
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('*')
        .eq('session_id', sessionId)
        .is('user_id', null)
        .order('timestamp', { ascending: false });
      
      if (topicsError) throw topicsError;
      topics = topicsData || [];
      
      // For anonymous users, create connections based on parent_topic_id
      connections = topics
        .filter(topic => topic.parent_topic_id)
        .map(topic => ({
          from: topic.parent_topic_id,
          to: topic.id,
          strength: 1
        }));
    }
    
    // Apply smart clustering
    const clusters = clusterTopics(topics);
    
    // Add cluster statistics
    const clusterStats = {};
    Object.values(clusters).forEach(cluster => {
      clusterStats[cluster] = (clusterStats[cluster] || 0) + 1;
    });
    
    res.json({
      success: true,
      topics: topics,
      connections: connections,
      clusters: clusters,
      stats: {
        totalTopics: topics.length,
        totalConnections: connections.length,
        clusterDistribution: clusterStats
      }
    });
  } catch (error) {
    console.error('Knowledge graph error:', error);
    res.status(500).json({ error: 'Failed to fetch knowledge graph data' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Local API server listening at http://localhost:${port}`);
  if (apiKey) {
    console.log('OpenAI API Key status: Available ✅');
  } else {
    console.log('OpenAI API Key status: Missing or not loaded ❌. Please check your .env file and server logs.');
  }
}); 