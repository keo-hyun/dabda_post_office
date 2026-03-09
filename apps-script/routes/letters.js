function lettersCore() {
  if (typeof validateLetterPayload === 'function') {
    return {
      buildMetricEvent: buildMetricEvent,
      canViewLetter: canViewLetter,
      validateLetterPayload: validateLetterPayload
    };
  }

  return require('../lib/core.js');
}

function getDriveGateway(deps) {
  var options = deps || {};
  if (options.driveGateway) return options.driveGateway;

  if (typeof uploadImageToDrive === 'function') {
    return { uploadImageToDrive: uploadImageToDrive };
  }

  return require('../lib/driveGateway.js');
}

function mailboxCacheKey(spreadsheetId) {
  return 'mailboxes:' + String(spreadsheetId || '');
}

function letterDetailCacheKey(spreadsheetId, letterId) {
  return 'letter:' + String(spreadsheetId || '') + ':' + String(letterId || '');
}

function readCachedJson(cacheGateway, key) {
  if (!cacheGateway || !key || typeof cacheGateway.get !== 'function') {
    return null;
  }

  try {
    var raw = cacheGateway.get(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function writeCachedJson(cacheGateway, key, payload, ttlSeconds) {
  if (!cacheGateway || !key || typeof cacheGateway.set !== 'function') {
    return;
  }

  try {
    cacheGateway.set(key, JSON.stringify(payload), ttlSeconds || 15);
  } catch (error) {
    // Cache is best-effort only.
  }
}

function invalidateMailboxCache(cacheGateway, spreadsheetId) {
  if (!cacheGateway || typeof cacheGateway.remove !== 'function') {
    return;
  }

  try {
    cacheGateway.remove(mailboxCacheKey(spreadsheetId));
  } catch (error) {
    // Cache invalidation is best-effort only.
  }
}

function createLetterRoute(body, deps) {
  var payload = body || {};
  var options = deps || {};
  var core = lettersCore();
  var sheetsGateway = options.sheetsGateway || null;
  var driveGateway = getDriveGateway(options);
  var driveFolderId = options.driveFolderId || payload.drive_folder_id || '';
  var spreadsheetId = options.spreadsheetId || '';
  var cacheGateway = options.cacheGateway || null;
  var validation = core.validateLetterPayload(payload);
  var nickname = String(payload.nickname || '').trim();

  if (!validation.ok) {
    return validation;
  }

  if (!nickname) {
    return { ok: false, message: 'INVALID_PAYLOAD' };
  }

  var letter = {
    letter_id: payload.letter_id || 'l_' + Date.now(),
    user_id: payload.user_id || '',
    nickname: nickname,
    content: payload.content || '',
    image_file_id: payload.image_file_id || '',
    visibility: payload.visibility || 'PUBLIC',
    phase_created: payload.phase_created || '',
    created_at: payload.created_at || new Date().toISOString()
  };

  if (payload.imageDataUri && driveFolderId) {
    var uploaded = driveGateway.uploadImageToDrive(
      payload.imageDataUri,
      driveFolderId,
      payload.imageFilename || letter.letter_id + '.png',
      options.driveServices || {}
    );
    letter.image_file_id = uploaded.fileId || '';
  }

  if (sheetsGateway && spreadsheetId) {
    sheetsGateway.appendRow('Letters', letter, { spreadsheetId: spreadsheetId });
  }
  invalidateMailboxCache(cacheGateway, spreadsheetId);

  return {
    ok: true,
    message: 'LETTER_CREATED',
    letter: letter,
    metric: core.buildMetricEvent('LETTER_SUBMITTED', { userId: payload.user_id || '' })
  };
}

function getMailboxesRoute(letters, context, deps) {
  var inputLetters = letters || [];
  var ctx = context || {};
  var options = deps || {};
  var core = lettersCore();
  var sheetsGateway = options.sheetsGateway || null;
  var spreadsheetId = options.spreadsheetId || '';
  var cacheGateway = options.cacheGateway || null;
  var cacheKey = mailboxCacheKey(spreadsheetId);

  if (!inputLetters.length && spreadsheetId) {
    var cachedLetters = readCachedJson(cacheGateway, cacheKey);
    if (Array.isArray(cachedLetters)) {
      return {
        ok: true,
        letters: cachedLetters,
        metric: core.buildMetricEvent('MAILBOX_VIEW', { userId: ctx.userId || '' })
      };
    }
  }

  var source = inputLetters.length
    ? inputLetters
    : sheetsGateway && spreadsheetId
      ? sheetsGateway.getAllRows('Letters', { spreadsheetId: spreadsheetId })
      : [];
  var visibleLetters = source.filter(function (letter) {
    return core.canViewLetter(letter, ctx) && letter.visibility === 'PUBLIC';
  });

  if (!inputLetters.length && spreadsheetId) {
    writeCachedJson(cacheGateway, cacheKey, visibleLetters, 15);
  }

  return {
    ok: true,
    letters: visibleLetters,
    metric: core.buildMetricEvent('MAILBOX_VIEW', { userId: ctx.userId || '' })
  };
}

function getLetterByIdRoute(letter, context, deps) {
  var source = letter || null;
  var ctx = context || {};
  var options = deps || {};
  var core = lettersCore();
  var sheetsGateway = options.sheetsGateway || null;
  var spreadsheetId = options.spreadsheetId || '';
  var cacheGateway = options.cacheGateway || null;
  var cacheKey = letterDetailCacheKey(spreadsheetId, ctx.letterId || (source && source.letter_id));

  if (!source && spreadsheetId && ctx.letterId) {
    var cachedLetter = readCachedJson(cacheGateway, cacheKey);
    if (cachedLetter && core.canViewLetter(cachedLetter, ctx)) {
      return {
        ok: true,
        letter: cachedLetter
      };
    }
  }

  if (!source && sheetsGateway && spreadsheetId && ctx.letterId) {
    var found = sheetsGateway.findRowBy('Letters', 'letter_id', ctx.letterId, { spreadsheetId: spreadsheetId });
    source = found ? found.row : null;
  }

  if (!source) {
    return { ok: false, message: 'LETTER_NOT_FOUND' };
  }

  if (!core.canViewLetter(source, ctx)) {
    return { ok: false, message: 'FORBIDDEN' };
  }

  var comments = [];
  if (sheetsGateway && spreadsheetId && source.letter_id) {
    try {
      comments = sheetsGateway
        .getAllRows('Comments', { spreadsheetId: spreadsheetId })
        .filter(function (comment) {
          var sameLetter = String(comment.letter_id || '') === String(source.letter_id);
          var deleted = String(comment.deleted_at || '').trim();
          return sameLetter && !deleted;
        })
        .sort(function (a, b) {
          return String(a.created_at || '').localeCompare(String(b.created_at || ''));
        });
    } catch (error) {
      comments = [];
    }
  }

  var letterWithComments = Object.assign({}, source, { comments: comments });
  if (spreadsheetId && source.letter_id) {
    writeCachedJson(cacheGateway, letterDetailCacheKey(spreadsheetId, source.letter_id), letterWithComments, 15);
  }

  return {
    ok: true,
    letter: letterWithComments
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createLetterRoute: createLetterRoute,
    getLetterByIdRoute: getLetterByIdRoute,
    getMailboxesRoute: getMailboxesRoute
  };
}
