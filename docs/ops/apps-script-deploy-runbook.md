# Apps Script Deploy Runbook

## 1) Prerequisites
- Google account with edit permissions on Apps Script, Sheets, and Drive
- Spreadsheet ID: `1GSKuJm9NyQYHWhB4SuZSqWe6CHEswFX5RGnEYZKnpI0`
- Drive folder ID: `1tB_M5qd_9c0-hmikoy5pqSr3QlV7Pwbr`
- `clasp` installed and authenticated

## 2) Local Verification
```bash
npm ci
npm run test:unit
npm run test:e2e
```

## 3) Configure Script Properties
Set Script Properties in Apps Script project:
- `ENTRY_CODE`
- `PHASE_MODE`
- `SPREADSHEET_ID=1GSKuJm9NyQYHWhB4SuZSqWe6CHEswFX5RGnEYZKnpI0`
- `DRIVE_FOLDER_ID=1tB_M5qd_9c0-hmikoy5pqSr3QlV7Pwbr`
- `ADMIN_PASSWORD_HASH`

## 4) Push Code
```bash
clasp push
```

## 5) Deploy Web App
1. Open Apps Script project
2. Deploy > New deployment > Web app
3. Execute as: `User accessing the web app` or `Me` per policy
4. Access: `Anyone` (or appropriate project policy)
5. Save deployed URL

## 6) Smoke Test Checklist
- Entry code accepted/rejected correctly
- Register/login writes and updates `Users`
- Letter creation writes `Letters`
- Optional image writes to Drive and stores `image_file_id`
- Phase 2 mailbox only shows public letters
- Comment create/update/delete works with soft delete
- Admin delete/report writes `AuditLogs`
- KPI events append to `Metrics`
