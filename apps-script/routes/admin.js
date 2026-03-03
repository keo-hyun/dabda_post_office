const { softDeleteComment } = require('../../src/backend/core/commentsCore.js');

function adminDeleteCommentRoute(comment = null, actor = 'admin') {
  if (!comment) {
    return { ok: false, message: 'COMMENT_NOT_FOUND' };
  }

  return {
    ok: true,
    comment: softDeleteComment(comment),
    audit: {
      type: 'ADMIN_DELETE_COMMENT',
      target_id: comment.comment_id || '',
      reason: 'moderation',
      actor,
      created_at: new Date().toISOString()
    }
  };
}

function reportActionRoute(body = {}, actor = 'admin') {
  return {
    ok: true,
    audit: {
      type: String(body.type || 'REPORT_ACTION'),
      target_id: String(body.target_id || ''),
      reason: String(body.reason || ''),
      actor,
      created_at: new Date().toISOString()
    }
  };
}

module.exports = {
  adminDeleteCommentRoute,
  reportActionRoute
};
