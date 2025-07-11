# Topic Explorer Web App

A single-page application that allows users to input a topic, receive a concise description (≤150 words), 5 subtopics, and 5 questions via OpenAI's API, with iterative exploration, Supabase-based history, and a network graph visualization.

## Features

- Topic Input: Enter any topic and get AI-generated information
- Concise Descriptions: Short, clear descriptions (≤150 words)
- Exploration: Navigate through subtopics and questions
- History: Track your exploration history
- Graph Visualization: See your exploration path as a network graph

## Development Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables in `.env`:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Supabase Setup

See `SUPABASE_SETUP.md` for detailed instructions on setting up your Supabase database.

## Deployment

This app is configured for deployment on Vercel. To deploy:

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Set environment variables in the Vercel dashboard
4. Deploy

## Tech Stack

- Frontend: React, Tailwind CSS
- Visualization: Vis.js
- Database: Supabase
- Deployment: Vercel
- API: OpenAI

## Phase Implementation

This project follows a phased implementation approach:
1. Project Setup (Completed): Environment setup, React initialization, Supabase configuration
2. Core Functionality: OpenAI integration, topic display, exploration loop
3. History/Graph: Supabase-based history, Vis.js graph
4. Error Handling: Comprehensive error handling, responsive design
5. Testing/Deployment: User testing, bug fixes, final deployment
