# Dabda Post Office

Event web app for Dabda Post Office (2026).

## Scripts

- `npm run test:unit`
- `npm run test:e2e`

## Apps Script (clasp)

1. Install clasp: `npm i -g @google/clasp`
2. Login: `clasp login`
3. Replace `.clasp.json` `scriptId` with your Apps Script project ID
4. Push script files: `clasp push`

## Deploy

Deployment steps and smoke tests are documented in:

- `docs/ops/apps-script-deploy-runbook.md`

## Local Frontend with Real GAS API

When running `web/` locally, mock API is used by default.

- Real mode with query params:
  - `http://127.0.0.1:4173/?apiMode=real&apiBase=https%3A%2F%2Fscript.google.com%2Fmacros%2Fs%2FAKfycbzLKag8DcYZC2EAZdBVIwUHmpq8X8cZh8JicQNo1IDrpM3i4YmpVZfMTo1iwWYFlmK1QA%2Fexec`
- Force mock mode:
  - `http://127.0.0.1:4173/?apiMode=mock`
