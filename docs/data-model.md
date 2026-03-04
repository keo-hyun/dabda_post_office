# Dabda Post Office Data Model

## Sheets

### Users
- `user_id`
- `nickname`
- `password_hash`
- `created_at`
- `last_login_at`

### Letters
- `letter_id`
- `user_id`
- `nickname`
- `content`
- `image_file_id`
- `visibility`
- `phase_created`
- `created_at`

### Comments
- `comment_id`
- `letter_id`
- `nickname`
- `password_hash`
- `content`
- `created_at`
- `updated_at`
- `deleted_at`

### AuditLogs
- `log_id`
- `type`
- `target_id`
- `reason`
- `created_at`
- `actor`

### Metrics
- `event_id`
- `event_name`
- `user_id`
- `meta_json`
- `created_at`

## Script Properties
- `ENTRY_CODE`
- `PHASE_MODE`
- `SPREADSHEET_ID`
- `DRIVE_FOLDER_ID`
- `ADMIN_PASSWORD_HASH`

## Provisioned Resource IDs
- `SPREADSHEET_ID`: `1GSKuJm9NyQYHWhB4SuZSqWe6CHEswFX5RGnEYZKnpI0`
- `DRIVE_FOLDER_ID`: `1tB_M5qd_9c0-hmikoy5pqSr3QlV7Pwbr`
