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

module.exports = {
  validateEntryCode,
  hashPassword,
  verifyPassword
};
