const crypto = require('crypto');

function validateEntryCode(input, expected) {
  if (typeof input !== 'string' || typeof expected !== 'string') {
    return false;
  }

  const normalizedInput = input.trim().toUpperCase();
  const normalizedExpected = expected.trim().toUpperCase();
  return Boolean(normalizedInput) && normalizedInput === normalizedExpected;
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
