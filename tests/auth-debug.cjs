// Debug authentication issue
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

async function debugAuth() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('🔍 Debug Info:');
  console.log('URL:', supabaseUrl);
  console.log('Key (first 20 chars):', supabaseAnonKey?.substring(0, 20) + '...');
  
  const client = createClient(supabaseUrl, supabaseAnonKey);
  
  // Test different auth methods
  console.log('\n📧 Testing simple sign up...');
  try {
    const { data, error } = await client.auth.signUp({
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (error) {
      console.log('❌ Sign up error:', error.message);
      console.log('Error details:', error);
    } else {
      console.log('✅ Sign up successful');
      console.log('User:', data.user?.id);
    }
  } catch (e) {
    console.log('❌ Exception:', e.message);
  }
  
  console.log('\n🔐 Testing sign in...');
  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (error) {
      console.log('❌ Sign in error:', error.message);
    } else {
      console.log('✅ Sign in successful');
    }
  } catch (e) {
    console.log('❌ Exception:', e.message);
  }
}

debugAuth().catch(console.error);