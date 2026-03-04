function commentsCore() {
  if (typeof canEditComment === 'function') {
    return {
      buildMetricEvent: buildMetricEvent,
      canEditComment: canEditComment,
      hashPassword: hashPassword,
      softDeleteComment: softDeleteComment,
      verifyPassword: verifyPassword
    };
  }

  return require('../lib/core.js');
}

function createCommentRoute(body, deps) {
  var payload = body || {};
  var options = deps || {};
  var core = commentsCore();
  var sheetsGateway = options.sheetsGateway || null;
  var spreadsheetId = options.spreadsheetId || '';
  var nickname = String(payload.nickname || '').trim();
  var password = String(payload.password || '');
  var content = String(payload.content || '').trim();

  if (!payload.letter_id || !nickname || !password || !content) {
    return { ok: false, message: 'INVALID_PAYLOAD' };
  }

  var comment = {
    comment_id: payload.comment_id || 'c_' + Date.now(),
    letter_id: payload.letter_id,
    nickname: nickname,
    password_hash: core.hashPassword(password),
    content: content,
    created_at: new Date().toISOString(),
    updated_at: null,
    deleted_at: null
  };

  if (sheetsGateway && spreadsheetId) {
    sheetsGateway.appendRow('Comments', comment, { spreadsheetId: spreadsheetId });
  }

  return {
    ok: true,
    comment: comment,
    metric: core.buildMetricEvent('COMMENT_CREATED', { userId: payload.user_id || '' })
  };
}

function updateCommentRoute(comment, body, context, deps) {
  var source = comment || null;
  var payload = body || {};
  var ctx = context || {};
  var options = deps || {};
  var core = commentsCore();
  var sheetsGateway = options.sheetsGateway || null;
  var spreadsheetId = options.spreadsheetId || '';

  if (!source && sheetsGateway && spreadsheetId && payload.comment_id) {
    var found = sheetsGateway.findRowBy('Comments', 'comment_id', payload.comment_id, { spreadsheetId: spreadsheetId });
    source = found ? found.row : null;
  }

  if (!source) {
    return { ok: false, message: 'COMMENT_NOT_FOUND' };
  }

  var passwordOk = core.verifyPassword(String(payload.password || ''), source.password_hash);
  if (!core.canEditComment(source, Object.assign({}, ctx, { passwordOk: passwordOk }))) {
    return { ok: false, message: 'FORBIDDEN' };
  }

  var updatedComment = Object.assign({}, source, {
    content: String(payload.content || source.content),
    updated_at: new Date().toISOString()
  });

  if (sheetsGateway && spreadsheetId) {
    sheetsGateway.updateRowBy('Comments', 'comment_id', updatedComment.comment_id, updatedComment, {
      spreadsheetId: spreadsheetId
    });
  }

  return {
    ok: true,
    comment: updatedComment,
    metric: core.buildMetricEvent('COMMENT_UPDATED', { userId: payload.user_id || '' })
  };
}

function deleteCommentRoute(comment, body, context, deps) {
  var source = comment || null;
  var payload = body || {};
  var ctx = context || {};
  var options = deps || {};
  var core = commentsCore();
  var sheetsGateway = options.sheetsGateway || null;
  var spreadsheetId = options.spreadsheetId || '';

  if (!source && sheetsGateway && spreadsheetId && payload.comment_id) {
    var found = sheetsGateway.findRowBy('Comments', 'comment_id', payload.comment_id, { spreadsheetId: spreadsheetId });
    source = found ? found.row : null;
  }

  if (!source) {
    return { ok: false, message: 'COMMENT_NOT_FOUND' };
  }

  var passwordOk = core.verifyPassword(String(payload.password || ''), source.password_hash);
  if (!core.canEditComment(source, Object.assign({}, ctx, { passwordOk: passwordOk }))) {
    return { ok: false, message: 'FORBIDDEN' };
  }

  var softDeleted = core.softDeleteComment(source);
  if (sheetsGateway && spreadsheetId) {
    sheetsGateway.updateRowBy('Comments', 'comment_id', softDeleted.comment_id, softDeleted, {
      spreadsheetId: spreadsheetId
    });
  }

  return {
    ok: true,
    comment: softDeleted,
    metric: core.buildMetricEvent('COMMENT_DELETED', { userId: payload.user_id || '' })
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createCommentRoute: createCommentRoute,
    deleteCommentRoute: deleteCommentRoute,
    updateCommentRoute: updateCommentRoute
  };
}
