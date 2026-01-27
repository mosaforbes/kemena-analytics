#!/usr/bin/env node

/**
 * Interactive Setup Wizard for Kemena Analytics Integration
 * Helps you configure the backend URL and test the connection
 */

import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const question = (prompt) => {
  return new Promise(resolve => {
    rl.question(`${colors.cyan}${prompt}${colors.reset} `, resolve);
  });
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bold}${colors.blue}${msg}${colors.reset}\n`)
};

const setup = async () => {
  console.clear();
  log.title('🎵 Kemena Analytics - Integration Setup Wizard');

  log.info('This wizard will help you configure your backend integration.\n');

  // Step 1: Backend URL
  log.title('Step 1: Backend Configuration');
  log.info('Your backend is running on Railway. You need to provide its URL.');
  log.info('Find it in: Railway Dashboard → Your Project → Node.js Service → Service URL\n');

  let backendURL = await question('Enter your backend URL (https://...):');
  
  if (!backendURL.includes('http')) {
    log.error('Invalid URL. Must start with http:// or https://');
    process.exit(1);
  }

  // Remove trailing slash
  backendURL = backendURL.replace(/\/$/, '');

  // Step 2: Test connection
  log.title('Step 2: Testing Connection');
  log.info(`Testing connection to: ${backendURL}\n`);

  try {
    const response = await axios.get(`${backendURL}/health`, { timeout: 5000 });
    log.success('Backend is responsive!');
    console.log(`  Status: ${response.status}`);
    console.log(`  Response: ${JSON.stringify(response.data)}\n`);
  } catch (error) {
    log.warn('Could not reach backend. This might be OK if:');
    console.log('  • Backend is still starting up');
    console.log('  • URL is incorrect');
    console.log('  • Firewall is blocking requests\n');
    
    const proceed = await question('Continue with setup anyway? (y/n): ');
    if (proceed.toLowerCase() !== 'y') {
      log.info('Setup cancelled.');
      process.exit(0);
    }
  }

  // Step 3: Update configuration
  log.title('Step 3: Updating Configuration');
  
  const configPath = path.join(__dirname, '../../src/utils/backend.js');
  
  try {
    let configContent = fs.readFileSync(configPath, 'utf-8');
    
    // Update production URL
    configContent = configContent.replace(
      /production: '[^']*'/,
      `production: '${backendURL}'`
    );
    
    fs.writeFileSync(configPath, configContent, 'utf-8');
    log.success(`Updated: ${configPath}`);
  } catch (error) {
    log.error(`Failed to update config: ${error.message}`);
  }

  // Step 4: Summary
  log.title('Step 4: Setup Complete!');
  log.success('Configuration saved successfully! 🎉\n');

  console.log(`${colors.bold}Configuration Summary:${colors.reset}`);
  console.log(`  Backend URL: ${colors.green}${backendURL}${colors.reset}`);
  console.log(`  Frontend: src/utils/backend.js\n`);

  log.info('Next steps:\n');
  console.log('  1. Run database migrations:');
  console.log(`     ${colors.cyan}node backend/scripts/run-migrations.js${colors.reset}\n`);
  
  console.log('  2. Test the backend:');
  console.log(`     ${colors.cyan}node backend/scripts/test-backend.js${colors.reset}\n`);
  
  console.log('  3. (Optional) Add API credentials:');
  console.log('     Go to Railway Dashboard → Environment Variables\n');

  console.log('  4. (Optional) Connect frontend to live data:');
  console.log('     Edit index.html to import apiClient\n');

  console.log(`${colors.bold}Documentation:${colors.reset}`);
  console.log('  • INTEGRATION_GUIDE.md - Detailed setup guide');
  console.log('  • SETUP_COMPLETE.md - Feature overview');
  console.log('  • backend/README.md - API documentation\n');

  rl.close();
};

// Run setup
setup().catch(error => {
  log.error(`Setup failed: ${error.message}`);
  process.exit(1);
});
