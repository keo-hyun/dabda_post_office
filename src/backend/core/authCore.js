const crypto = require('crypto');

function validateEntryCode(input, expected) {
  return typeof input === 'string' && typeof expected === 'string' && input === expected;
}

function hashPassword(plain) {
  return crypto.createHash('sha256').update(String(plain)).digest('hex');
}

function verifyPassword(plain, hash) {
  return hashPassword(plain) === hash;
}

function buildUserInsert(nickname, password) {
  return {
    user_id: `u_${Date.now()}`,
    nickname: String(nickname),
    password_hash: hashPassword(password),
    created_at: new Date().toISOString(),
    last_login_at: new Date().toISOString()
  };
}

module.exports = {
  buildUserInsert,
  validateEntryCode,
  hashPassword,
  verifyPassword
};
