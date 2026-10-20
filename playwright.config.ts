import { defineConfig, devices } from "@playwright/test";

/**
 * Pruebas de extremo a extremo (navegador real).
 *   npx playwright install chromium   # solo la primera vez
 *   npm run test:e2e
 * Arranca el servidor de desarrollo automáticamente si no está ya en marcha.
 * CHROMIUM_PATH permite usar un Chromium ya instalado en el sistema.
 */
const executablePath = process.env.CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    launchOptions: { executablePath },
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], launchOptions: { executablePath } } },
    { name: "mobile", use: { ...devices["Pixel 7"], launchOptions: { executablePath } } },
  ],
});
