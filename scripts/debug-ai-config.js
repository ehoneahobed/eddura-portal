require('dotenv').config();

console.log('🔍 Debugging AI Configuration...\n');

// 1. Test AI config
console.log('1. Testing AI Configuration...');
try {
  const aiConfig = require('../lib/ai-config');
  console.log('✅ AI Config loaded successfully');
  console.log('Default provider:', aiConfig.aiConfig.defaultProvider);
  console.log('Google provider enabled:', aiConfig.aiConfig.providers.google.enabled);
  console.log('Google API key exists:', !!process.env.GOOGLE_AI_API_KEY);
  console.log('Fallback enabled:', aiConfig.aiConfig.retrySettings.enableFallback);
  console.log('Fallback scores:', aiConfig.aiConfig.retrySettings.fallbackScores);
  console.log('');
} catch (error) {
  console.log('❌ Error loading AI config:', error.message);
}

// 2. Test AI utils
console.log('2. Testing AI Utils...');
try {
  const aiUtils = require('../lib/ai-utils');
  console.log('✅ AI Utils loaded successfully');
  
  // Test createFallbackReview
  const fallbackReview = aiUtils.createFallbackReview('Test Document');
  console.log('Fallback review created successfully');
  console.log('Fallback scores:', fallbackReview.scores);
  console.log('Fallback feedback count:', fallbackReview.feedback.length);
  console.log('Fallback summary exists:', !!fallbackReview.summary);
  console.log('');
  
  // Test error detection
  const overloadError = { message: 'The model is overloaded. Please try again later.' };
  const isRetryable = aiUtils.isRetryableError(overloadError);
  console.log('Overload error retryable:', isRetryable);
  
  const authError = { message: 'Invalid API key' };
  const isAuthRetryable = aiUtils.isRetryableError(authError);
  console.log('Auth error retryable:', isAuthRetryable);
  console.log('');
  
} catch (error) {
  console.log('❌ Error loading AI utils:', error.message);
}

// 3. Test environment variables
console.log('3. Testing Environment Variables...');
console.log('GOOGLE_AI_API_KEY exists:', !!process.env.GOOGLE_AI_API_KEY);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET);
console.log('');

// 4. Test fallback score validation
console.log('4. Testing Fallback Score Validation...');
try {
  const aiUtils = require('../lib/ai-utils');
  const fallbackReview = aiUtils.createFallbackReview('Test Document');
  
  // Check if all scores are numbers between 0-100
  const scores = fallbackReview.scores;
  const scoreEntries = Object.entries(scores);
  
  console.log('Score validation:');
  scoreEntries.forEach(([key, value]) => {
    const isValid = typeof value === 'number' && value >= 0 && value <= 100;
    console.log(`  ${key}: ${value} (${isValid ? '✅' : '❌'})`);
  });
  
  // Check if scores match config
  const aiConfig = require('../lib/ai-config');
  const configScores = aiConfig.aiConfig.retrySettings.fallbackScores;
  
  console.log('\nScore comparison with config:');
  scoreEntries.forEach(([key, value]) => {
    const configValue = configScores[key];
    const matches = value === configValue;
    console.log(`  ${key}: ${value} vs config ${configValue} (${matches ? '✅' : '❌'})`);
  });
  
} catch (error) {
  console.log('❌ Error in fallback validation:', error.message);
}

console.log('\n�� Debug complete!'); 