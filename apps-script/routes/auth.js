const { validateEntryCode, hashPassword, verifyPassword } = require('../../src/backend/core/authCore.js');

function enterRoute(body = {}, env = {}) {
  const ok = validateEntryCode(body.entryCode, env.ENTRY_CODE || '');

  return {
    ok,
    message: ok ? 'ENTRY_OK' : 'INVALID_ENTRY_CODE'
  };
}

function registerOrLoginRoute(body = {}, existingUser = null) {
  const nickname = String(body.nickname || '').trim();
  const password = String(body.password || '');

  if (!nickname || !password) {
    return { ok: false, message: 'INVALID_PAYLOAD' };
  }

  if (!existingUser) {
    return {
      ok: true,
      mode: 'REGISTER',
      user: {
        nickname,
        password_hash: hashPassword(password)
      }
    };
  }

  const passwordOk = verifyPassword(password, existingUser.password_hash);

  return {
    ok: passwordOk,
    mode: 'LOGIN',
    message: passwordOk ? 'LOGIN_OK' : 'INVALID_PASSWORD'
  };
}

module.exports = {
  enterRoute,
  registerOrLoginRoute
};
