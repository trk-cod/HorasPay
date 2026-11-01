import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://127.0.0.1:4200', headless: true },
  webServer: [
    { command: 'dotnet run --project src/HorasPay.Api -- --urls http://127.0.0.1:5157', url: 'http://127.0.0.1:5157/health', reuseExistingServer: true },
    { command: 'npm run web:dev', url: 'http://127.0.0.1:4200', reuseExistingServer: true }
  ]
});
