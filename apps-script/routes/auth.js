function authCore() {
  if (typeof validateEntryCode === 'function') {
    return {
      buildUserInsert: buildUserInsert,
      buildMetricEvent: buildMetricEvent,
      resolvePhase: resolvePhase,
      validateEntryCode: validateEntryCode,
      verifyPassword: verifyPassword
    };
  }

  return require('../lib/core.js');
}

function enterRoute(body, env) {
  var payload = body || {};
  var runtime = env || {};
  var core = authCore();
  var ok = core.validateEntryCode(payload.entryCode, runtime.ENTRY_CODE || '');
  var phase = core.resolvePhase(runtime.now ? new Date(runtime.now) : new Date(), runtime.PHASE_MODE || '');

  var response = {
    ok: ok,
    phase: phase,
    message: ok ? 'ENTRY_OK' : 'INVALID_ENTRY_CODE'
  };

  if (ok) {
    response.metric = core.buildMetricEvent('ENTRY_SUCCESS', { userId: payload.userId || '' });
  }

  return response;
}

function registerOrLoginRoute(body, existingUser, deps) {
  var payload = body || {};
  var sourceUser = existingUser || null;
  var options = deps || {};
  var core = authCore();
  var nickname = String(payload.nickname || '').trim();
  var password = String(payload.password || '');
  var sheetsGateway = options.sheetsGateway || null;
  var spreadsheetId = options.spreadsheetId || '';

  if (!nickname || !password) {
    return { ok: false, message: 'INVALID_PAYLOAD' };
  }

  var candidate = sourceUser;
  if (!candidate && sheetsGateway && spreadsheetId) {
    var found = sheetsGateway.findRowBy('Users', 'nickname', nickname, { spreadsheetId: spreadsheetId });
    candidate = found ? found.row : null;
  }

  if (!candidate) {
    var user = core.buildUserInsert(nickname, password);

    if (sheetsGateway && spreadsheetId) {
      sheetsGateway.appendRow('Users', user, { spreadsheetId: spreadsheetId });
    }

    return {
      ok: true,
      mode: 'REGISTER',
      user: user
    };
  }

  var passwordOk = core.verifyPassword(password, candidate.password_hash);
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
      { spreadsheetId: spreadsheetId }
    );
  }

  return {
    ok: true,
    mode: 'LOGIN',
    message: 'LOGIN_OK'
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    enterRoute: enterRoute,
    registerOrLoginRoute: registerOrLoginRoute
  };
}
