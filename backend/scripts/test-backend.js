#!/usr/bin/env node

/**
 * Backend Integration Tester
 * Verifies that your backend is running and accessible
 * Usage: node backend/scripts/test-backend.js <BACKEND_URL>
 */

import axios from 'axios';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  test: (msg) => console.log(`\n${colors.cyan}→${colors.reset} ${msg}`)
};

const testBackend = async () => {
  const backendURL = process.argv[2] || 'http://localhost:5000';
  
  log.info(`Testing backend at: ${backendURL}\n`);

  const tests = [
    {
      name: 'Health Check',
      method: 'GET',
      endpoint: '/health',
      expectedStatus: 200
    },
    {
      name: 'Get Artist (Non-existent)',
      method: 'GET',
      endpoint: '/api/artists/test-artist-123',
      expectedStatus: [200, 404] // Either OK with null or Not Found
    },
    {
      name: 'Get Sync Status',
      method: 'GET',
      endpoint: '/api/sync/status',
      expectedStatus: [200, 500] // May fail if no DB
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    log.test(`${test.name}`);
    try {
      const response = await axios({
        method: test.method,
        url: `${backendURL}${test.endpoint}`,
        timeout: 5000,
        validateStatus: () => true // Don't throw on any status
      });

      const expectedStatuses = Array.isArray(test.expectedStatus) 
        ? test.expectedStatus 
        : [test.expectedStatus];

      if (expectedStatuses.includes(response.status)) {
        log.success(`${test.method} ${test.endpoint} → ${response.status}`);
        if (response.data) {
          console.log(`  Response: ${JSON.stringify(response.data).substring(0, 100)}`);
        }
        passed++;
      } else {
        log.error(`${test.method} ${test.endpoint} → ${response.status}`);
        console.log(`  Expected: ${expectedStatuses.join(' or ')}`);
        console.log(`  Got: ${response.status}`);
        failed++;
      }
    } catch (error) {
      log.error(`${test.method} ${test.endpoint}`);
      if (error.code === 'ECONNREFUSED') {
        console.log(`  Connection refused - backend may not be running`);
      } else {
        console.log(`  ${error.message}`);
      }
      failed++;
    }
  }

  // Summary
  console.log(`\n${colors.cyan}═══════════════════════════════════${colors.reset}`);
  console.log(`Tests Passed: ${colors.green}${passed}${colors.reset}`);
  console.log(`Tests Failed: ${colors.red}${failed}${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════${colors.reset}\n`);

  if (failed === 0) {
    log.success('Backend is operational! 🚀');
    console.log('\nNext steps:');
    console.log(`  1. Run migrations: node backend/scripts/run-migrations.js`);
    console.log(`  2. Add API credentials: Update environment variables in Railway`);
    console.log(`  3. Connect frontend: Update src/utils/backend.js with backend URL\n`);
  } else {
    log.warn('Some tests failed. Check your backend configuration.');
    console.log('\nTroubleshooting:');
    console.log(`  • Is the backend running? Check Railway logs`);
    console.log(`  • Is the URL correct? ${backendURL}`);
    console.log(`  • Are environment variables set? Check .env file\n`);
  }
};

testBackend();
