# Supabase Setup Guide

This guide explains how to set up Supabase for the Topic Explorer application.

## 1. Create a Supabase Account and Project

1. Go to [Supabase](https://supabase.com/) and sign up for an account if you don't have one
2. Create a new project with a name like "topic-explorer"
3. Choose a strong database password and save it securely
4. Select the region closest to your users
5. Wait for your database to be provisioned (this may take a few minutes)

## 2. Get Your API Credentials

1. In your Supabase project dashboard, navigate to "Settings" > "API"
2. Copy the following values:
   - **Project URL**: This is your `VITE_SUPABASE_URL`
   - **anon/public** key: This is your `VITE_SUPABASE_ANON_KEY`

3. Update these values in `src/config.js`

## 3. Create Database Tables

You need to create two tables for this application: `topics` and `graph`.

### Creating the `topics` Table

1. Go to "Table Editor" in your Supabase dashboard
2. Click "New Table"
3. Set the Name to "topics"
4. Add the following columns:
   - `id`: type `uuid`, set as Primary Key, with Default value `uuid_generate_v4()`
   - `session_id`: type `text`, not nullable
   - `name`: type `text`, not nullable
   - `description`: type `text`, not nullable
   - `subtopics`: type `json`, not nullable
   - `questions`: type `json`, not nullable
   - `timestamp`: type `timestamptz`, Default value `now()`
5. Click "Save" to create the table

### Creating the `graph` Table

1. Click "New Table"
2. Set the Name to "graph"
3. Add the following columns:
   - `id`: type `uuid`, set as Primary Key, with Default value `uuid_generate_v4()`
   - `session_id`: type `text`, not nullable, unique
   - `nodes`: type `json`, not nullable
   - `edges`: type `json`, not nullable
4. Click "Save" to create the table

### Create the Helper Functions

1. Go to "SQL Editor" in your Supabase dashboard
2. Create a new SQL query with the following:

```sql
-- This function returns a list of all tables in the public schema
CREATE OR REPLACE FUNCTION get_tables()
RETURNS SETOF text AS $$
BEGIN
  RETURN QUERY SELECT tablename::text FROM pg_tables WHERE schemaname = 'public';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

3. Click "Run" to create the function

## 4. Set Up Row-Level Security (RLS)

For security in production environments, you should enable Row-Level Security:

1. Go to "Authentication" > "Policies"
2. For each table, enable RLS
3. Add policies as needed to allow your users to read/write their own data

## 5. Testing Your Connection

To verify that your connection is working:

1. Update your `src/config.js` with the Project URL and anon key
2. Start your development server with `npm run dev`
3. Open browser console to check for Supabase connection errors

## Troubleshooting

- If you get CORS errors, ensure you've added your app URL to the allowed origins in Supabase settings
- For database errors, check the SQL query logs in your Supabase dashboard
- Ensure your api keys in `src/config.js` are correct and do not have extra whitespace 