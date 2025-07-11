# Visual Testing Guide for Topic Explorer

## Overview
This guide provides instructions for manually testing the implemented screens against the design mockups.

## Test Setup

### 1. Start the Application
```bash
npm run dev:all
```

### 2. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Screen Testing Checklist

### Registration Screen
**Design Reference**: `Screens/unnamed.png`

#### Test Instructions:
1. Navigate to the registration screen (currently integrated in the auth flow)
2. Check the following elements:

#### Visual Elements Checklist:
- [ ] **Background**: Dark gradient (135deg, #1e293b → #0f172a)
- [ ] **Card**: Glassmorphism effect with backdrop blur
- [ ] **Title**: "Create an Account" (centered, white text)
- [ ] **Subtitle**: "Explore topics interactively with our AI"
- [ ] **Full Name Input**: Placeholder "John Doe", dark background
- [ ] **Email Input**: Placeholder "you@example.com"
- [ ] **Password Input**: Placeholder "••••••••"
- [ ] **Password Strength**: Progress bar with color coding
- [ ] **Confirm Password**: Matching validation
- [ ] **Terms Checkbox**: "I agree to the Terms and Privacy Policy"
- [ ] **Create Account Button**: Blue gradient button
- [ ] **Google Sign Up**: With Google logo
- [ ] **Sign In Link**: "Already have an account? Sign in"

#### Functional Testing:
- [ ] Form validation works in real-time
- [ ] Password strength indicator updates
- [ ] Terms checkbox is required
- [ ] Google authentication works
- [ ] Navigation to login screen works

### Login Screen
**Design Reference**: `Screens/unnamed (1).png`

#### Visual Elements Checklist:
- [ ] **Title**: "Welcome Back" (centered)
- [ ] **Subtitle**: "Dive back into the world of knowledge."
- [ ] **Email Input**: Dark background, proper styling
- [ ] **Password Input**: With show/hide toggle
- [ ] **Remember Me**: Checkbox functionality
- [ ] **Forgot Password**: Link styling
- [ ] **Sign In Button**: Blue gradient button
- [ ] **Google Sign In**: Consistent with registration
- [ ] **Sign Up Link**: "New to Topic Explorer? Sign up"

#### Functional Testing:
- [ ] Email validation
- [ ] Password show/hide toggle
- [ ] Remember me functionality
- [ ] Forgot password navigation
- [ ] Google sign in works
- [ ] Navigation to registration works

### Password Reset Screen
**Design Reference**: `Screens/unnamed (2).png`

#### Visual Elements Checklist:
- [ ] **Title**: "Reset Password" (centered)
- [ ] **Instructions**: Clear description text
- [ ] **Email Input**: Single input field
- [ ] **Send Reset Button**: Blue gradient button
- [ ] **Back to Sign In**: Link at bottom
- [ ] **Success State**: Email sent confirmation

#### Functional Testing:
- [ ] Email validation
- [ ] Reset link sending
- [ ] Success message display
- [ ] Navigation back to login

### Main Dashboard
**Design Reference**: `Screens/unnamed (3).png`

#### Visual Elements Checklist:
- [ ] **Header**: Logo + "Topic Explorer" title
- [ ] **Session Dropdown**: "Session 1" with dropdown arrow
- [ ] **User Avatar**: Profile picture circle
- [ ] **Search Bar**: Large centered search input
- [ ] **Search Icon**: Left-side search icon
- [ ] **Popular Topics**: Topic pill buttons
- [ ] **Action Buttons**: "Explore" and "View History"
- [ ] **Footer**: "Powered by OpenAI and Supabase"

#### Functional Testing:
- [ ] Search functionality works
- [ ] Popular topic buttons work
- [ ] Session management works
- [ ] User profile integration
- [ ] History navigation works

## Visual Comparison Process

### Step 1: Side-by-Side Comparison
1. Open the design file in an image viewer
2. Open the implemented screen in browser
3. Compare element positioning, colors, and spacing

### Step 2: Responsive Testing
Test on different screen sizes:
- [ ] Desktop (1920x1080)
- [ ] Tablet (768px width)
- [ ] Mobile (375px width)

### Step 3: Browser Testing
Test on different browsers:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Step 4: Interactive Testing
Test all interactive elements:
- [ ] Hover effects
- [ ] Click animations
- [ ] Form validation
- [ ] Loading states
- [ ] Error states

## Common Issues to Check

### Design Fidelity
- [ ] Color accuracy (especially gradients)
- [ ] Typography (font sizes, weights)
- [ ] Spacing and padding
- [ ] Border radius consistency
- [ ] Shadow effects

### Performance
- [ ] Page load times
- [ ] Animation smoothness
- [ ] API response times
- [ ] Image loading

### Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast ratios
- [ ] Focus indicators

## Test Results

### Registration Screen
- **Visual Match**: ___% (estimate)
- **Functionality**: ✓ Working / ✗ Issues
- **Responsive**: ✓ Working / ✗ Issues
- **Notes**: _____

### Login Screen
- **Visual Match**: ___% (estimate)
- **Functionality**: ✓ Working / ✗ Issues
- **Responsive**: ✓ Working / ✗ Issues
- **Notes**: _____

### Password Reset Screen
- **Visual Match**: ___% (estimate)
- **Functionality**: ✓ Working / ✗ Issues
- **Responsive**: ✓ Working / ✗ Issues
- **Notes**: _____

### Main Dashboard
- **Visual Match**: ___% (estimate)
- **Functionality**: ✓ Working / ✗ Issues
- **Responsive**: ✓ Working / ✗ Issues
- **Notes**: _____

## Next Steps

Based on test results:
1. **High Priority**: Fix major visual discrepancies
2. **Medium Priority**: Improve responsive design
3. **Low Priority**: Polish animations and micro-interactions

## Automated Testing

For automated visual testing (when system dependencies are available):
```bash
npm run visual-test
```

This will generate screenshots in the `tests/screenshots/` directory for comparison.