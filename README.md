# Patient Navigator UI Automation

Playwright and TypeScript UI automation for patient and transitional care nurse workflows. Cross-role tests use separate authenticated browser contexts so patient and nurse sessions remain isolated while exercising the same backend journey. UI interactions only.

## Setup

1. Install Node.js (18 or newer) and run `npm install`.
2. Copy `.env.example` to `.env`, then set `PATIENT_PASSWORD` and `CARE_NURSE_PASSWORD`. Keep `.env` private; it is ignored by Git.
3. Install the browser with `npx playwright install chromium`.

## Run and reports

- `npm run test:e2e` clears previous Allure output, then runs the workflows with one worker using the browser mode configured in `playwright.config.ts`.
- `npm run test:e2e:headed` clears previous Allure output, then runs with a visible Chromium window.
- `npm run typecheck` checks TypeScript; `npm run lint` runs ESLint.
- Playwright HTML output is written to `playwright-report/`; Allure results go to `allure-results/`. Generate/open Allure using `npm run allure:generate` and `npm run allure:open`. Both reports represent the latest npm-driven test execution.

The escalation scenario creates and resolves a real record. Queue selection matches the patient, message, priority, and open status, then chooses the latest parseable timestamp without assuming a fixed queue size. Because the application is currently a POC and can respond slowly, test, assertion, action, and navigation timeouts are intentionally set to 120 seconds.

Scenario inputs live in `src/test-data/` and are created through typed factory functions. Add alternative datasets there and pass them into tests; Page Objects should contain reusable UI behavior rather than scenario-specific values. The appointment reason is unique per run. Escalation cleanup is not available through this automation repository, so old escalation records may remain in the test environment.
