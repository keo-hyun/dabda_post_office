const { hashPassword, verifyPassword } = require('../../src/backend/core/authCore.js');
const { canEditComment, softDeleteComment } = require('../../src/backend/core/commentsCore.js');
const { buildMetricEvent } = require('../../src/backend/core/metricsCore.js');

function createCommentRoute(body = {}) {
  const nickname = String(body.nickname || '').trim();
  const password = String(body.password || '');
  const content = String(body.content || '').trim();

  if (!body.letter_id || !nickname || !password || !content) {
    return { ok: false, message: 'INVALID_PAYLOAD' };
  }

  return {
    ok: true,
    comment: {
      comment_id: body.comment_id || '',
      letter_id: body.letter_id,
      nickname,
      password_hash: hashPassword(password),
      content,
      created_at: new Date().toISOString(),
      updated_at: null,
      deleted_at: null
    },
    metric: buildMetricEvent('COMMENT_CREATED', { userId: body.user_id || '' })
  };
}

function updateCommentRoute(comment = null, body = {}, context = {}) {
  if (!comment) {
    return { ok: false, message: 'COMMENT_NOT_FOUND' };
  }

  const passwordOk = verifyPassword(String(body.password || ''), comment.password_hash);
  if (!canEditComment(comment, { ...context, passwordOk })) {
    return { ok: false, message: 'FORBIDDEN' };
  }

  return {
    ok: true,
    comment: {
      ...comment,
      content: String(body.content || comment.content),
      updated_at: new Date().toISOString()
    },
    metric: buildMetricEvent('COMMENT_UPDATED', { userId: body.user_id || '' })
  };
}

function deleteCommentRoute(comment = null, body = {}, context = {}) {
  if (!comment) {
    return { ok: false, message: 'COMMENT_NOT_FOUND' };
  }

  const passwordOk = verifyPassword(String(body.password || ''), comment.password_hash);
  if (!canEditComment(comment, { ...context, passwordOk })) {
    return { ok: false, message: 'FORBIDDEN' };
  }

  return {
    ok: true,
    comment: softDeleteComment(comment),
    metric: buildMetricEvent('COMMENT_DELETED', { userId: body.user_id || '' })
  };
}

module.exports = {
  createCommentRoute,
  deleteCommentRoute,
  updateCommentRoute
};
