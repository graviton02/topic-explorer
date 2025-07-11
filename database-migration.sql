-- Database Migration Script for Topic Explorer
-- This script adds user authentication and session management support

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (Supabase Auth will handle this automatically, but we need profile info)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    name VARCHAR,
    avatar_url VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_sessions table for multi-session support
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_name VARCHAR DEFAULT 'Default Session',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Create exploration_paths table for the visual map feature
CREATE TABLE IF NOT EXISTS exploration_paths (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
    from_topic_id BIGINT REFERENCES topics(id) ON DELETE CASCADE,
    to_topic_id BIGINT REFERENCES topics(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update existing topics table to support user authentication
ALTER TABLE topics ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE topics ADD COLUMN IF NOT EXISTS user_session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL;
ALTER TABLE topics ADD COLUMN IF NOT EXISTS parent_topic_id BIGINT REFERENCES topics(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_topics_user_id ON topics(user_id);
CREATE INDEX IF NOT EXISTS idx_topics_session_id ON topics(user_session_id);
CREATE INDEX IF NOT EXISTS idx_topics_parent ON topics(parent_topic_id);
CREATE INDEX IF NOT EXISTS idx_exploration_paths_user ON exploration_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_exploration_paths_session ON exploration_paths(session_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE exploration_paths ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for user_sessions
CREATE POLICY "Users can manage their own sessions" ON user_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for topics
CREATE POLICY "Users can manage their own topics" ON topics
    FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for exploration_paths
CREATE POLICY "Users can manage their own exploration paths" ON exploration_paths
    FOR ALL USING (auth.uid() = user_id);

-- Create functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
    );
    
    -- Create default session for new user
    INSERT INTO public.user_sessions (user_id, session_name)
    VALUES (NEW.id, 'Default Session');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update last_accessed timestamp
CREATE OR REPLACE FUNCTION public.update_session_last_accessed()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_sessions 
    SET last_accessed = NOW()
    WHERE id = NEW.user_session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update session last_accessed when topics are created
CREATE OR REPLACE TRIGGER update_session_timestamp
    AFTER INSERT ON topics
    FOR EACH ROW EXECUTE FUNCTION public.update_session_last_accessed();

-- Create view for user statistics (for dashboard)
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
    u.id as user_id,
    u.email,
    u.name,
    COUNT(DISTINCT t.id) as total_topics,
    COUNT(DISTINCT t.user_session_id) as total_sessions,
    COUNT(DISTINCT DATE(t.timestamp)) as days_active,
    MIN(t.timestamp) as first_exploration,
    MAX(t.timestamp) as last_exploration,
    COUNT(DISTINCT ep.id) as total_connections
FROM user_profiles u
LEFT JOIN topics t ON u.id = t.user_id
LEFT JOIN exploration_paths ep ON u.id = ep.user_id
GROUP BY u.id, u.email, u.name;

-- Grant necessary permissions
GRANT SELECT ON user_statistics TO authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_sessions TO authenticated;
GRANT ALL ON topics TO authenticated;
GRANT ALL ON exploration_paths TO authenticated;

-- Create function to migrate anonymous sessions to user accounts
CREATE OR REPLACE FUNCTION migrate_anonymous_session(
    p_session_id UUID,
    p_user_id UUID,
    p_session_name VARCHAR DEFAULT 'Migrated Session'
)
RETURNS UUID AS $$
DECLARE
    new_session_id UUID;
BEGIN
    -- Create new user session
    INSERT INTO user_sessions (user_id, session_name)
    VALUES (p_user_id, p_session_name)
    RETURNING id INTO new_session_id;
    
    -- Update all topics with the new user_id and session_id
    UPDATE topics 
    SET 
        user_id = p_user_id,
        user_session_id = new_session_id
    WHERE session_id = p_session_id;
    
    RETURN new_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on migration function
GRANT EXECUTE ON FUNCTION migrate_anonymous_session TO authenticated;