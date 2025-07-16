#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Puppeteer Chrome browser...\n');

try {
  // Check if Chrome is already installed
  console.log('📋 Checking if Chrome is already installed...');
  
  try {
    const puppeteerCachePath = path.join(process.env.HOME || process.env.USERPROFILE, '.cache', 'puppeteer');
    const chromePath = path.join(puppeteerCachePath, 'chrome');
    
    if (fs.existsSync(chromePath)) {
      const chromeDirs = fs.readdirSync(chromePath);
      if (chromeDirs.length > 0) {
        console.log('✅ Chrome appears to be already installed');
        console.log(`📁 Chrome location: ${chromePath}`);
        return;
      }
    }
  } catch (error) {
    console.log('ℹ️  Could not check existing installation, proceeding with fresh install...');
  }

  // Install Chrome
  console.log('📥 Installing Chrome browser for Puppeteer...');
  execSync('npx puppeteer browsers install chrome', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  console.log('\n✅ Chrome installation completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Restart your development server if it\'s running');
  console.log('2. Try generating a PDF document to verify the installation');
  console.log('3. If you encounter issues, run: npx puppeteer browsers install chrome');

} catch (error) {
  console.error('\n❌ Error during Chrome installation:', error.message);
  console.log('\n🔧 Troubleshooting steps:');
  console.log('1. Ensure you have sufficient disk space');
  console.log('2. Check your internet connection');
  console.log('3. Try running: npx puppeteer browsers install chrome manually');
  console.log('4. If the issue persists, check Puppeteer documentation at: https://pptr.dev/guides/configuration');
  
  process.exit(1);
}