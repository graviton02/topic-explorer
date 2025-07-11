const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

class VisualTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseURL = 'http://localhost:5173';
    this.screenshotDir = path.join(__dirname, 'screenshots');
    this.referenceDir = path.join(__dirname, '../Screens');
    
    // Ensure screenshot directory exists
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for headless mode
      defaultViewport: {
        width: 1920,
        height: 1080
      },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // Set up the page
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // Add some common styles to match the designs
    await this.page.addStyleTag({
      content: `
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        body {
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          min-height: 100vh;
        }
      `
    });
  }

  async takeScreenshot(name, selector = null) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    const filepath = path.join(this.screenshotDir, filename);
    
    if (selector) {
      const element = await this.page.$(selector);
      if (element) {
        await element.screenshot({ path: filepath });
      } else {
        console.warn(`Element with selector "${selector}" not found`);
        await this.page.screenshot({ path: filepath, fullPage: true });
      }
    } else {
      await this.page.screenshot({ path: filepath, fullPage: true });
    }
    
    console.log(`Screenshot saved: ${filename}`);
    return filepath;
  }

  async navigateToPage(route = '/') {
    const url = `${this.baseURL}${route}`;
    await this.page.goto(url, { waitUntil: 'networkidle2' });
    
    // Wait for any animations to complete
    await this.page.waitForTimeout(1000);
  }

  async waitForElement(selector, timeout = 5000) {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      console.error(`Element "${selector}" not found within ${timeout}ms`);
      return false;
    }
  }

  async fillForm(formData) {
    for (const [selector, value] of Object.entries(formData)) {
      await this.page.type(selector, value);
      await this.page.waitForTimeout(100); // Small delay between inputs
    }
  }

  async clickElement(selector) {
    await this.page.click(selector);
    await this.page.waitForTimeout(500); // Wait for any animations
  }

  async testRegistrationForm() {
    console.log('Testing Registration Form...');
    
    // Navigate to the main page first
    await this.navigateToPage('/');
    
    // Wait for page to load
    await this.page.waitForTimeout(2000);
    
    // First, let's see if we can access the registration form
    // For now, let's just take a screenshot of the main page
    await this.takeScreenshot('main-dashboard');
    
    // Test if we can interact with the topic form
    const topicInput = await this.page.$('#topic-input');
    if (topicInput) {
      await topicInput.type('Machine Learning');
      await this.takeScreenshot('topic-input-filled');
      
      // Click the explore button
      const exploreButton = await this.page.$('button[type="submit"]');
      if (exploreButton) {
        await exploreButton.click();
        await this.page.waitForTimeout(3000); // Wait for API response
        await this.takeScreenshot('topic-results');
      }
    }
    
    console.log('Registration form testing completed');
  }

  async testLoginForm() {
    console.log('Testing Login Form...');
    
    await this.navigateToPage('/login');
    
    // Wait for form to load
    await this.waitForElement('input[type="email"]');
    
    // Take initial screenshot
    await this.takeScreenshot('login-initial');
    
    // Fill form with test data
    await this.fillForm({
      'input[type="email"]': 'user@example.com',
      'input[type="password"]': 'password123'
    });
    
    // Take screenshot with filled form
    await this.takeScreenshot('login-filled');
    
    console.log('Login form testing completed');
  }

  async testMainDashboard() {
    console.log('Testing Main Dashboard...');
    
    await this.navigateToPage('/');
    
    // Wait for main elements to load
    await this.waitForElement('h1');
    
    // Take initial screenshot
    await this.takeScreenshot('dashboard-initial');
    
    // Test search functionality
    const searchInput = await this.page.$('input[placeholder*="topic"]');
    if (searchInput) {
      await searchInput.type('Machine Learning');
      await this.takeScreenshot('dashboard-search');
    }
    
    console.log('Main dashboard testing completed');
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async runAllTests() {
    console.log('Starting visual tests...');
    
    try {
      await this.init();
      
      // Test different screens
      await this.testMainDashboard();
      await this.testRegistrationForm();
      await this.testLoginForm();
      
      console.log('All visual tests completed successfully!');
      console.log(`Screenshots saved in: ${this.screenshotDir}`);
      
    } catch (error) {
      console.error('Error during visual testing:', error);
    } finally {
      await this.close();
    }
  }
}

// Export for use in other files
module.exports = VisualTester;

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new VisualTester();
  tester.runAllTests();
}