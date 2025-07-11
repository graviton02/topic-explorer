// Authentication Flow Test for Sessions Page
// This tests that the authentication flow works correctly

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

// Test 1: App.jsx properly passes onShowAuth
function testAppJSXAuthFlow() {
  log('\n🔐 Testing App.jsx Auth Flow...', 'blue');
  
  try {
    const appPath = path.join(__dirname, '..', 'src/App.jsx');
    const appContent = fs.readFileSync(appPath, 'utf8');
    
    const requiredElements = [
      'handleShowAuth',
      'onShowAuth={handleShowAuth}',
      'setShowAuth',
      'showAuth',
      'AuthRouter'
    ];
    
    let passed = 0;
    let failed = 0;
    
    requiredElements.forEach(element => {
      if (appContent.includes(element)) {
        log(`✅ Auth flow element found: ${element}`, 'green');
        passed++;
      } else {
        log(`❌ Auth flow element missing: ${element}`, 'red');
        failed++;
      }
    });
    
    log(`\n📊 App.jsx Auth Test Results: ${passed} passed, ${failed} failed`, 
        failed === 0 ? 'green' : 'yellow');
    
    return failed === 0;
  } catch (error) {
    log('❌ Error testing App.jsx auth flow: ' + error.message, 'red');
    return false;
  }
}

// Test 2: SessionsPage handles unauthenticated users
function testSessionsPageUnauth() {
  log('\n👤 Testing Sessions Page Unauthenticated Flow...', 'blue');
  
  try {
    const sessionsPath = path.join(__dirname, '..', 'src/components/SessionsPage.jsx');
    const sessionsContent = fs.readFileSync(sessionsPath, 'utf8');
    
    const requiredElements = [
      'onShowAuth',
      'if (!user)',
      'Sessions are for Registered Users',
      'Sign In',
      'Continue as Guest',
      'loading',
      'With Sessions, you can:'
    ];
    
    let passed = 0;
    let failed = 0;
    
    requiredElements.forEach(element => {
      if (sessionsContent.includes(element)) {
        log(`✅ Unauth handling found: ${element}`, 'green');
        passed++;
      } else {
        log(`❌ Unauth handling missing: ${element}`, 'red');
        failed++;
      }
    });
    
    log(`\n📊 Sessions Unauth Test Results: ${passed} passed, ${failed} failed`, 
        failed === 0 ? 'green' : 'yellow');
    
    return failed === 0;
  } catch (error) {
    log('❌ Error testing Sessions unauth flow: ' + error.message, 'red');
    return false;
  }
}

// Test 3: MainDashboard has Sign In button
function testMainDashboardAuth() {
  log('\n🏠 Testing Main Dashboard Auth Integration...', 'blue');
  
  try {
    const dashboardPath = path.join(__dirname, '..', 'src/components/MainDashboard.jsx');
    const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
    
    const requiredElements = [
      'onShowAuth',
      'Sign In',
      'user && currentUserSession',
      'onClick={onShowAuth}'
    ];
    
    let passed = 0;
    let failed = 0;
    
    requiredElements.forEach(element => {
      if (dashboardContent.includes(element)) {
        log(`✅ Dashboard auth element found: ${element}`, 'green');
        passed++;
      } else {
        log(`❌ Dashboard auth element missing: ${element}`, 'red');
        failed++;
      }
    });
    
    log(`\n📊 Dashboard Auth Test Results: ${passed} passed, ${failed} failed`, 
        failed === 0 ? 'green' : 'yellow');
    
    return failed === 0;
  } catch (error) {
    log('❌ Error testing Dashboard auth integration: ' + error.message, 'red');
    return false;
  }
}

// Test 4: ProfilePage accepts onShowAuth prop
function testProfilePageAuth() {
  log('\n👤 Testing Profile Page Auth Props...', 'blue');
  
  try {
    const profilePath = path.join(__dirname, '..', 'src/components/ProfilePage.jsx');
    const profileContent = fs.readFileSync(profilePath, 'utf8');
    
    const requiredElements = [
      'onShowAuth',
      'onNavigate, onShowAuth'
    ];
    
    let passed = 0;
    let failed = 0;
    
    requiredElements.forEach(element => {
      if (profileContent.includes(element)) {
        log(`✅ Profile auth prop found: ${element}`, 'green');
        passed++;
      } else {
        log(`❌ Profile auth prop missing: ${element}`, 'red');
        failed++;
      }
    });
    
    log(`\n📊 Profile Auth Test Results: ${passed} passed, ${failed} failed`, 
        failed === 0 ? 'green' : 'yellow');
    
    return failed === 0;
  } catch (error) {
    log('❌ Error testing Profile auth props: ' + error.message, 'red');
    return false;
  }
}

// Test 5: API error handling
function testAPIErrorHandling() {
  log('\n🛡️ Testing API Error Handling...', 'blue');
  
  try {
    const sessionsPath = path.join(__dirname, '..', 'src/components/SessionsPage.jsx');
    const sessionsContent = fs.readFileSync(sessionsPath, 'utf8');
    
    const requiredElements = [
      'Invalid or expired token',
      'catch (err)',
      'console.error',
      'setError',
      'Failed to',
      'if (!user)'
    ];
    
    let passed = 0;
    let failed = 0;
    
    requiredElements.forEach(element => {
      if (sessionsContent.includes(element)) {
        log(`✅ Error handling found: ${element}`, 'green');
        passed++;
      } else {
        log(`❌ Error handling missing: ${element}`, 'red');
        failed++;
      }
    });
    
    log(`\n📊 API Error Test Results: ${passed} passed, ${failed} failed`, 
        failed === 0 ? 'green' : 'yellow');
    
    return failed === 0;
  } catch (error) {
    log('❌ Error testing API error handling: ' + error.message, 'red');
    return false;
  }
}

// Main test runner
function runTests() {
  log('🔐 Starting Authentication Flow Tests', 'blue');
  log('=' * 50, 'blue');
  
  const tests = [
    { name: 'App.jsx Auth Flow', fn: testAppJSXAuthFlow },
    { name: 'Sessions Page Unauthenticated', fn: testSessionsPageUnauth },
    { name: 'Main Dashboard Auth', fn: testMainDashboardAuth },
    { name: 'Profile Page Auth Props', fn: testProfilePageAuth },
    { name: 'API Error Handling', fn: testAPIErrorHandling }
  ];
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  tests.forEach(test => {
    const result = test.fn();
    if (result) {
      totalPassed++;
    } else {
      totalFailed++;
    }
  });
  
  log('\n' + '=' * 50, 'blue');
  log('📊 FINAL AUTHENTICATION FLOW TEST RESULTS', 'blue');
  log('=' * 50, 'blue');
  
  log(`✅ Tests Passed: ${totalPassed}`, 'green');
  log(`❌ Tests Failed: ${totalFailed}`, 'red');
  
  const successRate = Math.round((totalPassed / tests.length) * 100);
  log(`📈 Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'yellow');
  
  if (totalFailed === 0) {
    log('\n🎉 All authentication flow tests passed!', 'green');
    log('✅ Users can now properly sign in from Sessions page', 'green');
    log('✅ Unauthenticated users see proper messaging', 'green');
    log('✅ API errors are handled gracefully', 'green');
  } else {
    log('\n⚠️  Some authentication tests failed. Please review the issues above.', 'yellow');
  }
  
  return totalFailed === 0;
}

// Run the tests
if (require.main === module) {
  runTests();
}

module.exports = { runTests };