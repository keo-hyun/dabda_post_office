const {
  buildUserInsert,
  validateEntryCode,
  verifyPassword
} = require('../../src/backend/core/authCore.js');
const { buildMetricEvent } = require('../../src/backend/core/metricsCore.js');
const { resolvePhase } = require('../../src/shared/phase.js');

function enterRoute(body = {}, env = {}) {
  const ok = validateEntryCode(body.entryCode, env.ENTRY_CODE || '');
  const phase = resolvePhase(env.now ? new Date(env.now) : new Date());

  const response = {
    ok,
    phase,
    message: ok ? 'ENTRY_OK' : 'INVALID_ENTRY_CODE'
  };

  if (ok) {
    response.metric = buildMetricEvent('ENTRY_SUCCESS', { userId: body.userId || '' });
  }

  return response;
}

function registerOrLoginRoute(body = {}, existingUser = null, deps = {}) {
  const nickname = String(body.nickname || '').trim();
  const password = String(body.password || '');
  const sheetsGateway = deps.sheetsGateway || null;
  const spreadsheetId = deps.spreadsheetId || '';

  if (!nickname || !password) {
    return { ok: false, message: 'INVALID_PAYLOAD' };
  }

  let candidate = existingUser;
  if (!candidate && sheetsGateway && spreadsheetId) {
    const found = sheetsGateway.findRowBy('Users', 'nickname', nickname, { spreadsheetId });
    candidate = found ? found.row : null;
  }

  if (!candidate) {
    const user = buildUserInsert(nickname, password);

    if (sheetsGateway && spreadsheetId) {
      sheetsGateway.appendRow('Users', user, { spreadsheetId });
    }

    return {
      ok: true,
      mode: 'REGISTER',
      user
    };
  }

  const passwordOk = verifyPassword(password, candidate.password_hash);
  if (!passwordOk) {
    return {
      ok: false,
      mode: 'LOGIN',
      message: 'INVALID_PASSWORD'
    };
  }

  if (sheetsGateway && spreadsheetId) {
    sheetsGateway.updateRowBy(
      'Users',
      'nickname',
      nickname,
      { last_login_at: new Date().toISOString() },
      { spreadsheetId }
    );
  }

  return {
    ok: true,
    mode: 'LOGIN',
    message: 'LOGIN_OK'
  };
}

module.exports = {
  enterRoute,
  registerOrLoginRoute
};
