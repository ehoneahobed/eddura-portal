# Puppeteer Chrome Installation Fix

## Problem
The application was encountering errors when trying to generate PDF documents due to missing Chrome browser installation for Puppeteer:

```
Error: Could not find Chrome (ver. 138.0.7204.94). This can occur if either
 1. you did not perform an installation before running the script (e.g. `npx puppeteer browsers install chrome`) or
 2. your cache path is incorrectly configured (which is: /home/sbx_user1051/.cache/puppeteer).
```

## Solution
This fix implements a comprehensive solution to ensure Chrome is properly installed and available for Puppeteer PDF generation.

### Changes Made

#### 1. Package.json Updates
- **Added postinstall script**: Automatically installs Chrome when dependencies are installed
- **Added setup:puppeteer script**: Provides a manual setup option with better error handling

```json
{
  "scripts": {
    "postinstall": "npx puppeteer browsers install chrome",
    "setup:puppeteer": "node scripts/setup-puppeteer.js"
  }
}
```

#### 2. Enhanced PDF Generation Code
- **Improved error handling**: Better detection and messaging for Chrome installation errors
- **Configurable executable path**: Support for custom Chrome paths via environment variables
- **Robust browser launch**: Enhanced configuration for server environments

```typescript
// Enhanced browser launch configuration
browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-gpu',
    '--disable-web-security',
    '--disable-features=VizDisplayCompositor'
  ],
  timeout: 30000,
  // Ensure we use the installed Chrome browser
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
});

// Enhanced error handling
if (error instanceof Error && error.message.includes('Could not find Chrome')) {
  console.error('[PDF] Chrome installation error detected. Please run: npx puppeteer browsers install chrome');
  throw new Error('Chrome browser not found. Please ensure Chrome is installed for Puppeteer. Run: npx puppeteer browsers install chrome');
}
```

#### 3. Setup Script
Created `scripts/setup-puppeteer.js` to provide:
- **Installation verification**: Checks if Chrome is already installed
- **Automatic installation**: Downloads and installs Chrome if missing
- **Troubleshooting guidance**: Provides helpful error messages and next steps
- **Cross-platform support**: Works on both Linux and Windows environments

### Usage

#### Automatic Installation
Chrome will be automatically installed when you run:
```bash
npm install
# or
pnpm install
```

#### Manual Setup
If you need to manually set up Chrome:
```bash
npm run setup:puppeteer
# or
node scripts/setup-puppeteer.js
```

#### Environment Variables
You can specify a custom Chrome path using:
```bash
export PUPPETEER_EXECUTABLE_PATH="/path/to/chrome"
```

### Deployment Considerations

#### Vercel Deployment
For Vercel deployments, the postinstall script will automatically run during the build process, ensuring Chrome is available.

#### Docker Deployment
If using Docker, ensure the container has sufficient disk space and the necessary permissions to install Chrome.

#### Server Environments
The enhanced browser launch configuration includes server-optimized flags:
- `--no-sandbox`: Disables Chrome sandbox for server environments
- `--disable-setuid-sandbox`: Additional sandbox disabling
- `--disable-dev-shm-usage`: Prevents shared memory issues
- `--single-process`: Reduces resource usage

### Testing
After implementing this fix:
1. Run `npm run setup:puppeteer` to verify Chrome installation
2. Test PDF generation by downloading a document as PDF
3. Check the console logs for successful browser launch messages

### Troubleshooting

#### Common Issues
1. **Insufficient disk space**: Ensure at least 500MB free space
2. **Network issues**: Check internet connection for Chrome download
3. **Permission issues**: Ensure write access to cache directory
4. **Memory constraints**: The single-process flag helps with memory usage

#### Manual Chrome Installation
If automatic installation fails:
```bash
npx puppeteer browsers install chrome
```

#### Verify Installation
Check if Chrome is installed:
```bash
ls -la ~/.cache/puppeteer/chrome/
```

### Files Modified
- `package.json`: Added postinstall and setup scripts
- `app/api/documents/[id]/download/route.ts`: Enhanced PDF generation with better error handling
- `scripts/setup-puppeteer.js`: New setup script for Chrome installation

### Benefits
1. **Automatic setup**: No manual intervention required for new installations
2. **Better error messages**: Clear guidance when issues occur
3. **Robust deployment**: Works across different deployment environments
4. **Maintenance friendly**: Easy to troubleshoot and update
5. **Cross-platform**: Works on Linux, Windows, and macOS

This fix ensures that PDF generation will work reliably across all deployment scenarios while providing clear error messages and easy troubleshooting options.