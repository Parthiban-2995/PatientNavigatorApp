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

The scenario creates and resolves a real escalation. The queue selection reads displayed date/time values and picks the newest matching patient/message/HIGH row, and stops if that row predates the current run. The POC is configured with extended 30 second action and assertion timeouts, a 60 second navigation timeout, and a 3 minute test timeout. Login enters the configured username and password and clicks Sign in.
