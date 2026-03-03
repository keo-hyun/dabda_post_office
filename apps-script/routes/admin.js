const { softDeleteComment } = require('../../src/backend/core/commentsCore.js');

function createAudit(type, targetId, reason, actor) {
  return {
    log_id: `audit_${Date.now()}`,
    type,
    target_id: targetId,
    reason,
    actor,
    created_at: new Date().toISOString()
  };
}

function adminDeleteCommentRoute(comment = null, actor = 'admin', deps = {}) {
  const sheetsGateway = deps.sheetsGateway || null;
  const spreadsheetId = deps.spreadsheetId || '';
  let source = comment;

  if (!source && sheetsGateway && spreadsheetId && deps.commentId) {
    const found = sheetsGateway.findRowBy('Comments', 'comment_id', deps.commentId, { spreadsheetId });
    source = found ? found.row : null;
  }

  if (!source) {
    return { ok: false, message: 'COMMENT_NOT_FOUND' };
  }

  const softDeleted = softDeleteComment(source);
  const audit = createAudit('ADMIN_DELETE_COMMENT', source.comment_id || '', 'moderation', actor);

  if (sheetsGateway && spreadsheetId) {
    sheetsGateway.updateRowBy('Comments', 'comment_id', softDeleted.comment_id, softDeleted, {
      spreadsheetId
    });
    sheetsGateway.appendRow('AuditLogs', audit, { spreadsheetId });
  }

  return {
    ok: true,
    comment: softDeleted,
    audit
  };
}

function reportActionRoute(body = {}, actor = 'admin', deps = {}) {
  const sheetsGateway = deps.sheetsGateway || null;
  const spreadsheetId = deps.spreadsheetId || '';
  const audit = createAudit(
    String(body.type || 'REPORT_ACTION'),
    String(body.target_id || ''),
    String(body.reason || ''),
    actor
  );

  if (sheetsGateway && spreadsheetId) {
    sheetsGateway.appendRow('AuditLogs', audit, { spreadsheetId });
  }

  return {
    ok: true,
    audit
  };
}

module.exports = {
  adminDeleteCommentRoute,
  reportActionRoute
};
