// Test Supabase connection and configuration
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Color scheme for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

async function testSupabaseConnection() {
  log('🔍 Testing Supabase Connection...', 'blue');
  log('=' * 50, 'blue');

  // Test environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  log('\n📋 Environment Variables Check:', 'blue');
  log(`VITE_SUPABASE_URL: ${supabaseUrl ? '✅ Present' : '❌ Missing'}`, supabaseUrl ? 'green' : 'red');
  log(`VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Present' : '❌ Missing'}`, supabaseAnonKey ? 'green' : 'red');
  log(`SUPABASE_SERVICE_KEY: ${supabaseServiceKey ? '✅ Present' : '❌ Missing'}`, supabaseServiceKey ? 'green' : 'red');

  if (!supabaseUrl || !supabaseAnonKey) {
    log('\n❌ Missing required environment variables', 'red');
    return false;
  }

  // Test URL format
  log('\n🔗 URL Validation:', 'blue');
  try {
    const url = new URL(supabaseUrl);
    log(`✅ Valid URL format: ${url.hostname}`, 'green');
  } catch (error) {
    log(`❌ Invalid URL format: ${error.message}`, 'red');
    return false;
  }

  // Test anon key client
  log('\n🔑 Testing Anonymous Key Client:', 'blue');
  try {
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test basic connection
    const { data, error } = await anonClient.auth.getSession();
    
    if (error) {
      log(`❌ Anonymous client error: ${error.message}`, 'red');
      return false;
    } else {
      log('✅ Anonymous client connected successfully', 'green');
      log(`📊 Session status: ${data.session ? 'Active session' : 'No active session'}`, 'yellow');
    }
  } catch (error) {
    log(`❌ Anonymous client connection failed: ${error.message}`, 'red');
    return false;
  }

  // Test service key client
  log('\n🔧 Testing Service Key Client:', 'blue');
  try {
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Test service connection with a simple query
    const { data, error } = await serviceClient.auth.admin.listUsers();
    
    if (error) {
      log(`❌ Service client error: ${error.message}`, 'red');
      return false;
    } else {
      log('✅ Service client connected successfully', 'green');
      log(`📊 Users count: ${data.users?.length || 0}`, 'yellow');
    }
  } catch (error) {
    log(`❌ Service client connection failed: ${error.message}`, 'red');
    return false;
  }

  // Test table access
  log('\n🗃️ Testing Table Access:', 'blue');
  try {
    const client = createClient(supabaseUrl, supabaseServiceKey);
    
    // Test user_sessions table
    const { data: sessions, error: sessionsError } = await client
      .from('user_sessions')
      .select('id')
      .limit(1);
    
    if (sessionsError) {
      log(`❌ user_sessions table error: ${sessionsError.message}`, 'red');
    } else {
      log('✅ user_sessions table accessible', 'green');
    }

    // Test topics table
    const { data: topics, error: topicsError } = await client
      .from('topics')
      .select('id')
      .limit(1);
    
    if (topicsError) {
      log(`❌ topics table error: ${topicsError.message}`, 'red');
    } else {
      log('✅ topics table accessible', 'green');
    }

  } catch (error) {
    log(`❌ Table access test failed: ${error.message}`, 'red');
    return false;
  }

  log('\n🎉 All Supabase connection tests passed!', 'green');
  return true;
}

async function testRegistrationFlow() {
  log('\n👤 Testing Registration Flow...', 'blue');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    log('❌ Missing environment variables for registration test', 'red');
    return false;
  }

  try {
    const client = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test sign up with a test email
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    log(`🧪 Testing registration with: ${testEmail}`, 'yellow');
    
    const { data, error } = await client.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: 'Test User'
        }
      }
    });
    
    if (error) {
      log(`❌ Registration test failed: ${error.message}`, 'red');
      return false;
    } else {
      log('✅ Registration test successful', 'green');
      log(`📊 User ID: ${data.user?.id}`, 'yellow');
      log(`📊 Email confirmed: ${data.user?.email_confirmed_at ? 'Yes' : 'No'}`, 'yellow');
      return true;
    }
  } catch (error) {
    log(`❌ Registration test error: ${error.message}`, 'red');
    return false;
  }
}

// Main test function
async function runAllTests() {
  log('🚀 Starting Supabase Connection Tests', 'blue');
  
  const connectionResult = await testSupabaseConnection();
  
  if (connectionResult) {
    await testRegistrationFlow();
  }
  
  log('\n📋 Test Summary:', 'blue');
  log(`Connection Test: ${connectionResult ? '✅ PASSED' : '❌ FAILED'}`, connectionResult ? 'green' : 'red');
  
  if (!connectionResult) {
    log('\n🔧 Troubleshooting Steps:', 'yellow');
    log('1. Check if Supabase project is active/not paused', 'yellow');
    log('2. Verify API keys are correct and not expired', 'yellow');
    log('3. Ensure authentication is enabled in Supabase settings', 'yellow');
    log('4. Check if email confirmation is required', 'yellow');
  }
}

// Run the tests
runAllTests().catch(console.error);