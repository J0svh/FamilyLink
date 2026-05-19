import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Global setup for E2E tests
  // Could start backend server, seed database, etc.
  console.log('E2E Global Setup: Starting...');
  console.log('Base URL:', config.projects[0]?.use?.baseURL);
}

export default globalSetup;
