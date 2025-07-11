// Test the fallback authentication system
// Since we can't easily test ES modules from Node.js, let's create a simplified version

// Mock localStorage for Node.js
global.localStorage = {
  store: {},
  getItem: function(key) {
    return this.store[key] || null;
  },
  setItem: function(key, value) {
    this.store[key] = value;
  },
  removeItem: function(key) {
    delete this.store[key];
  }
};

// Color output
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

async function testFallbackAuth() {
  log('🧪 Testing Fallback Authentication System', 'blue');
  log('=' * 50, 'blue');
  
  // Test 1: Sign up
  log('\n📝 Testing Sign Up...', 'blue');
  const signUpResult = await authFallback.signUp('test@example.com', 'password123', { name: 'Test User' });
  
  if (signUpResult.error) {
    log(`❌ Sign up failed: ${signUpResult.error.message}`, 'red');
    return false;
  } else {
    log('✅ Sign up successful', 'green');
    log(`📊 User ID: ${signUpResult.user.id}`, 'yellow');
    log(`📊 User Email: ${signUpResult.user.email}`, 'yellow');
    log(`📊 User Name: ${signUpResult.user.user_metadata.name}`, 'yellow');
  }
  
  // Test 2: Sign in
  log('\n🔐 Testing Sign In...', 'blue');
  const signInResult = await authFallback.signIn('test@example.com', 'password123');
  
  if (signInResult.error) {
    log(`❌ Sign in failed: ${signInResult.error.message}`, 'red');
    return false;
  } else {
    log('✅ Sign in successful', 'green');
    log(`📊 Session token: ${signInResult.session.access_token.substring(0, 20)}...`, 'yellow');
  }
  
  // Test 3: Get current user
  log('\n👤 Testing Get Current User...', 'blue');
  const currentUserResult = await authFallback.getCurrentUser();
  
  if (currentUserResult.error) {
    log(`❌ Get current user failed: ${currentUserResult.error.message}`, 'red');
    return false;
  } else {
    log('✅ Get current user successful', 'green');
    log(`📊 Current user: ${currentUserResult.user.email}`, 'yellow');
  }
  
  // Test 4: Get current session
  log('\n📱 Testing Get Current Session...', 'blue');
  const currentSessionResult = await authFallback.getCurrentSession();
  
  if (currentSessionResult.error) {
    log(`❌ Get current session failed: ${currentSessionResult.error.message}`, 'red');
    return false;
  } else {
    log('✅ Get current session successful', 'green');
    log(`📊 Session expires at: ${new Date(currentSessionResult.session.expires_at).toLocaleString()}`, 'yellow');
  }
  
  // Test 5: Update profile
  log('\n✏️ Testing Update Profile...', 'blue');
  const updateResult = await authFallback.updateProfile({ name: 'Updated Test User' });
  
  if (updateResult.error) {
    log(`❌ Update profile failed: ${updateResult.error.message}`, 'red');
    return false;
  } else {
    log('✅ Update profile successful', 'green');
    log(`📊 Updated name: ${updateResult.user.user_metadata.name}`, 'yellow');
  }
  
  // Test 6: Sign out
  log('\n🚪 Testing Sign Out...', 'blue');
  const signOutResult = await authFallback.signOut();
  
  if (signOutResult.error) {
    log(`❌ Sign out failed: ${signOutResult.error.message}`, 'red');
    return false;
  } else {
    log('✅ Sign out successful', 'green');
  }
  
  // Test 7: Verify sign out
  log('\n🔍 Testing Post Sign Out State...', 'blue');
  const postSignOutResult = await authFallback.getCurrentUser();
  
  if (postSignOutResult.user) {
    log('❌ User should be null after sign out', 'red');
    return false;
  } else {
    log('✅ User properly signed out', 'green');
  }
  
  log('\n🎉 All fallback authentication tests passed!', 'green');
  return true;
}

// Run the test
testFallbackAuth().catch(console.error);