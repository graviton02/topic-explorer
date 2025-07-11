# Development Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Supabase account and project

## Quick Start

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd topic-explorer-app
   npm install
   ```

2. **Environment Configuration**
   
   Create a `.env` file in the root directory with the following variables:
   
   ```bash
   # OpenAI API Configuration
   OPENAI_API_KEY=your-openai-api-key
   
   # Supabase Configuration (Backend)
   SUPABASE_URL=your-supabase-project-url
   SUPABASE_SERVICE_KEY=your-supabase-service-key
   
   # Supabase Configuration (Frontend)
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. **Get Your Supabase Credentials**
   
   - Go to your [Supabase Dashboard](https://app.supabase.com/)
   - Select your project
   - Go to Settings → API
   - Copy the following:
     - **URL**: Use for both `SUPABASE_URL` and `VITE_SUPABASE_URL`
     - **anon public key**: Use for `VITE_SUPABASE_ANON_KEY`
     - **service_role key**: Use for `SUPABASE_SERVICE_KEY`

4. **Database Setup**
   
   Run the database migration to create the necessary tables:
   ```bash
   # Copy the contents of database-migration.sql
   # Run it in your Supabase SQL editor
   ```

5. **Start Development Servers**
   ```bash
   npm run dev:all
   ```
   
   This will start both:
   - Frontend development server: http://localhost:5173
   - Backend API server: http://localhost:3001

## Environment Variables Explained

### Required for Frontend (Vite)
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Public anon key for client-side authentication

### Required for Backend (Node.js)
- `OPENAI_API_KEY`: Your OpenAI API key for generating topic content
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Service role key for server-side database operations

## Common Issues and Solutions

### 1. "supabaseUrl is required" Error
**Problem**: Missing frontend environment variables
**Solution**: 
- Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in `.env`
- Restart the development server after adding environment variables

### 2. "OpenAI API Key not found" Error
**Problem**: Missing OpenAI API key
**Solution**: 
- Add your OpenAI API key to `OPENAI_API_KEY` in `.env`
- Restart the backend server

### 3. Database Connection Issues
**Problem**: Database tables don't exist or wrong permissions
**Solution**: 
- Run the database migration script in Supabase SQL editor
- Check that Row Level Security (RLS) policies are correctly set up

### 4. CORS Issues
**Problem**: Cross-origin requests blocked
**Solution**: 
- Ensure your domain is added to Supabase allowed origins
- Check that the backend server is running on the correct port (3001)

## Development Commands

```bash
# Start both frontend and backend
npm run dev:all

# Start only frontend
npm run dev

# Start only backend
npm run api

# Run visual tests
npm run visual-test

# Run simple tests
npm run simple-test

# Build for production
npm run build

# Run linting
npm run lint
```

## Testing

### Visual Testing
Run visual tests to verify screen implementations:
```bash
npm run simple-test
```

### Manual Testing
1. Open http://localhost:5173 in your browser
2. Check console for any error messages
3. Test authentication flows
4. Test topic exploration functionality

## File Structure

```
src/
├── components/
│   ├── auth/                 # Authentication screens
│   │   ├── RegistrationScreen.jsx
│   │   ├── LoginScreen.jsx
│   │   ├── PasswordResetScreen.jsx
│   │   └── AuthRouter.jsx
│   ├── MainDashboard.jsx     # Main application dashboard
│   ├── TopicForm.jsx         # Topic search form
│   ├── TopicContent.jsx      # Topic display component
│   ├── Navigation.jsx        # Navigation component
│   └── HistoryPage.jsx       # History view
├── contexts/
│   └── AuthContext.jsx       # Authentication context
├── lib/
│   ├── auth.js              # Authentication utilities
│   ├── api.js               # API functions
│   └── env-validation.js    # Environment validation
└── main.jsx                 # Application entry point
```

## Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   - Configure the same environment variables in your production environment
   - Ensure proper security for service keys

3. **Deploy**
   - Frontend: Deploy the `dist` folder to your static hosting service
   - Backend: Deploy the server.cjs file to your Node.js hosting service

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure your Supabase database is properly configured
4. Check that your API keys are valid and have the correct permissions

## Next Steps

Once your development environment is set up:
1. Test the implemented authentication screens
2. Verify topic exploration functionality
3. Begin implementing additional screens as needed
4. Run visual tests to ensure design compliance