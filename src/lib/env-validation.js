// Environment validation utility
export const validateEnvironment = () => {
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    console.error('Please check your .env file and ensure the following variables are set:');
    missingVars.forEach(varName => {
      console.error(`- ${varName}`);
    });
    
    return false;
  }

  return true;
};

export const getEnvironmentInfo = () => {
  return {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD
  };
};