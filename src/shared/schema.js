const SHEETS = {
  USERS: {
    name: 'Users',
    columns: ['user_id', 'nickname', 'password_hash', 'created_at', 'last_login_at']
  },
  LETTERS: {
    name: 'Letters',
    columns: [
      'letter_id',
      'user_id',
      'nickname',
      'content',
      'image_file_id',
      'visibility',
      'phase_created',
      'created_at'
    ]
  },
  COMMENTS: {
    name: 'Comments',
    columns: [
      'comment_id',
      'letter_id',
      'nickname',
      'password_hash',
      'content',
      'created_at',
      'updated_at',
      'deleted_at'
    ]
  },
  AUDIT_LOGS: {
    name: 'AuditLogs',
    columns: ['log_id', 'type', 'target_id', 'reason', 'created_at', 'actor']
  },
  METRICS: {
    name: 'Metrics',
    columns: ['event_id', 'event_name', 'user_id', 'meta_json', 'created_at']
  }
};

const REQUIRED_SCRIPT_PROPS = [
  'ENTRY_CODE',
  'PHASE_MODE',
  'SPREADSHEET_ID',
  'DRIVE_FOLDER_ID',
  'ADMIN_PASSWORD_HASH'
];

const RESOURCE_SCRIPT_PROPS = ['SPREADSHEET_ID', 'DRIVE_FOLDER_ID'];

module.exports = {
  RESOURCE_SCRIPT_PROPS,
  SHEETS,
  REQUIRED_SCRIPT_PROPS
};
