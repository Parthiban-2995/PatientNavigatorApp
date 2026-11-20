# Patient Navigator UI Automation

Playwright and TypeScript UI automation for the single business workflow ESC-001, Care Nurse Escalation Handling Flow. It logs Betty Ann in, verifies her chat response, clicks her profile and logs out, then logs Michael Chen in on the same page at the application login URL. UI interactions only.

## Setup

1. Install Node.js (18 or newer) and run `npm install`.
2. Copy `.env.example` to `.env`, then set `PATIENT_PASSWORD` and `CARE_NURSE_PASSWORD`. Keep `.env` private; it is ignored by Git.
3. Install the browser with `npx playwright install chromium`.

## Run and reports

- `npm run test:e2e` runs the workflow headless with one worker.
- `npm run test:e2e:headed` runs it with a visible Chromium window.
- `npm run typecheck` checks TypeScript; `npm run lint` runs ESLint.
- Playwright HTML output is written to `playwright-report/`; Allure results go to `allure-results/`. Generate/open Allure using `npm run allure:generate` and `npm run allure:open`.

The scenario creates and resolves a real escalation. The queue selection waits for the first displayed Active record matching the patient, message, and configured priority without assuming a fixed queue size. Playwright uses centralized 60 second test, 10 second assertion, 10 second action, and 20 second navigation timeouts. Only AI response validation has a local 60 second assertion timeout. Login enters the configured username and password and clicks Sign in.
