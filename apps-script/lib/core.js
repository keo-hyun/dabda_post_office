function toHex(byteArray) {
  return byteArray
    .map(function (byte) {
      var v = byte;
      if (v < 0) v += 256;
      return (v < 16 ? '0' : '') + v.toString(16);
    })
    .join('');
}

function sha256Hex(value) {
  var input = String(value || '');

  if (typeof Utilities !== 'undefined') {
    var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input, Utilities.Charset.UTF_8);
    return toHex(digest);
  }

  var crypto = require('crypto');
  return crypto.createHash('sha256').update(input).digest('hex');
}

function validateEntryCode(input, expected) {
  return typeof input === 'string' && typeof expected === 'string' && input === expected;
}

function hashPassword(plain) {
  return sha256Hex(String(plain || ''));
}

function verifyPassword(plain, hash) {
  return hashPassword(plain) === hash;
}

function buildUserInsert(nickname, password) {
  return {
    user_id: 'u_' + Date.now(),
    nickname: String(nickname || ''),
    password_hash: hashPassword(password),
    created_at: new Date().toISOString(),
    last_login_at: new Date().toISOString()
  };
}

function normalizePhaseMode(mode) {
  var raw = String(mode || '').trim().toUpperCase();
  if (raw === 'PHASE_1' || raw === 'TRANSITION' || raw === 'PHASE_2' || raw === 'CLOSED') {
    return raw;
  }

  return '';
}

function resolvePhase(date, phaseMode) {
  var override = normalizePhaseMode(phaseMode);
  if (override) {
    return override;
  }

  var target = date || new Date();
  var time = target.getTime();
  var windows = [
    { phase: 'PHASE_1', start: '2026-03-25T00:00:00+09:00', end: '2026-04-08T23:59:59+09:00' },
    { phase: 'TRANSITION', start: '2026-04-09T00:00:00+09:00', end: '2026-04-12T23:59:59+09:00' },
    { phase: 'PHASE_2', start: '2026-04-13T00:00:00+09:00', end: '2026-04-24T23:59:59+09:00' }
  ];

  for (var i = 0; i < windows.length; i += 1) {
    var item = windows[i];
    var start = new Date(item.start).getTime();
    var end = new Date(item.end).getTime();
    if (time >= start && time <= end) return item.phase;
  }

  return 'CLOSED';
}

function validateLetterPayload(payload) {
  var content = String((payload && payload.content) || '');
  if (content.length > 1000) {
    return { ok: false, message: 'CONTENT_TOO_LONG' };
  }

  var imageBytes = (payload && (payload.imageBytes || (payload.image && payload.image.size))) || 0;
  if (Number(imageBytes) > 5 * 1024 * 1024) {
    return { ok: false, message: 'IMAGE_TOO_LARGE' };
  }

  var visibility = String((payload && payload.visibility) || 'PUBLIC');
  if (visibility !== 'PUBLIC' && visibility !== 'PRIVATE') {
    return { ok: false, message: 'INVALID_VISIBILITY' };
  }

  return { ok: true };
}

function canViewLetter(letter, context) {
  var item = letter || {};
  var ctx = context || {};

  if (ctx.isAdmin || ctx.isOwner) return true;
  if (item.visibility === 'PRIVATE') return false;
  return ctx.phase === 'PHASE_2';
}

function canEditComment(comment, context) {
  var ctx = context || {};
  return Boolean(ctx.isAdmin || ctx.passwordOk);
}

function buildSoftDeletePatch(now) {
  var timestamp = now || new Date();
  return { deleted_at: timestamp.toISOString() };
}

function softDeleteComment(comment, now) {
  var item = comment || {};
  var patch = buildSoftDeletePatch(now || new Date());
  var result = {};

  Object.keys(item).forEach(function (key) {
    result[key] = item[key];
  });

  result.deleted_at = patch.deleted_at;
  return result;
}

function buildMetricEvent(eventName, payload) {
  var source = payload || {};
  return {
    event_id: 'evt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
    event_name: String(eventName || ''),
    user_id: source.userId || '',
    meta_json: JSON.stringify(source.meta || {}),
    created_at: source.createdAt || new Date().toISOString()
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    buildMetricEvent: buildMetricEvent,
    buildSoftDeletePatch: buildSoftDeletePatch,
    buildUserInsert: buildUserInsert,
    canEditComment: canEditComment,
    canViewLetter: canViewLetter,
    hashPassword: hashPassword,
    resolvePhase: resolvePhase,
    softDeleteComment: softDeleteComment,
    validateEntryCode: validateEntryCode,
    validateLetterPayload: validateLetterPayload,
    verifyPassword: verifyPassword
  };
}
