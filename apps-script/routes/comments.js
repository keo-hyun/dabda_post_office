const { hashPassword, verifyPassword } = require('../../src/backend/core/authCore.js');
const { canEditComment, softDeleteComment } = require('../../src/backend/core/commentsCore.js');
const { buildMetricEvent } = require('../../src/backend/core/metricsCore.js');

function createCommentRoute(body = {}, deps = {}) {
  const sheetsGateway = deps.sheetsGateway || null;
  const spreadsheetId = deps.spreadsheetId || '';
  const nickname = String(body.nickname || '').trim();
  const password = String(body.password || '');
  const content = String(body.content || '').trim();

  if (!body.letter_id || !nickname || !password || !content) {
    return { ok: false, message: 'INVALID_PAYLOAD' };
  }

  const comment = {
    comment_id: body.comment_id || `c_${Date.now()}`,
    letter_id: body.letter_id,
    nickname,
    password_hash: hashPassword(password),
    content,
    created_at: new Date().toISOString(),
    updated_at: null,
    deleted_at: null
  };

  if (sheetsGateway && spreadsheetId) {
    sheetsGateway.appendRow('Comments', comment, { spreadsheetId });
  }

  return {
    ok: true,
    comment,
    metric: buildMetricEvent('COMMENT_CREATED', { userId: body.user_id || '' })
  };
}

function updateCommentRoute(comment = null, body = {}, context = {}, deps = {}) {
  const sheetsGateway = deps.sheetsGateway || null;
  const spreadsheetId = deps.spreadsheetId || '';
  let source = comment;

  if (!source && sheetsGateway && spreadsheetId && body.comment_id) {
    const found = sheetsGateway.findRowBy('Comments', 'comment_id', body.comment_id, { spreadsheetId });
    source = found ? found.row : null;
  }

  if (!source) {
    return { ok: false, message: 'COMMENT_NOT_FOUND' };
  }

  const passwordOk = verifyPassword(String(body.password || ''), source.password_hash);
  if (!canEditComment(source, { ...context, passwordOk })) {
    return { ok: false, message: 'FORBIDDEN' };
  }

  const updatedComment = {
    ...source,
    content: String(body.content || source.content),
    updated_at: new Date().toISOString()
  };

  if (sheetsGateway && spreadsheetId) {
    sheetsGateway.updateRowBy('Comments', 'comment_id', updatedComment.comment_id, updatedComment, {
      spreadsheetId
    });
  }

  return {
    ok: true,
    comment: updatedComment,
    metric: buildMetricEvent('COMMENT_UPDATED', { userId: body.user_id || '' })
  };
}

function deleteCommentRoute(comment = null, body = {}, context = {}, deps = {}) {
  const sheetsGateway = deps.sheetsGateway || null;
  const spreadsheetId = deps.spreadsheetId || '';
  let source = comment;

  if (!source && sheetsGateway && spreadsheetId && body.comment_id) {
    const found = sheetsGateway.findRowBy('Comments', 'comment_id', body.comment_id, { spreadsheetId });
    source = found ? found.row : null;
  }

  if (!source) {
    return { ok: false, message: 'COMMENT_NOT_FOUND' };
  }

  const passwordOk = verifyPassword(String(body.password || ''), source.password_hash);
  if (!canEditComment(source, { ...context, passwordOk })) {
    return { ok: false, message: 'FORBIDDEN' };
  }

  const softDeleted = softDeleteComment(source);
  if (sheetsGateway && spreadsheetId) {
    sheetsGateway.updateRowBy('Comments', 'comment_id', softDeleted.comment_id, softDeleted, {
      spreadsheetId
    });
  }

  return {
    ok: true,
    comment: softDeleted,
    metric: buildMetricEvent('COMMENT_DELETED', { userId: body.user_id || '' })
  };
}

module.exports = {
  createCommentRoute,
  deleteCommentRoute,
  updateCommentRoute
};
