function adminCore() {
  if (typeof softDeleteComment === 'function') {
    return {
      softDeleteComment: softDeleteComment
    };
  }

  return require('../lib/core.js');
}

function createAudit(type, targetId, reason, actor) {
  return {
    log_id: 'audit_' + Date.now(),
    type: type,
    target_id: targetId,
    reason: reason,
    actor: actor,
    created_at: new Date().toISOString()
  };
}

function adminDeleteCommentRoute(comment, actor, deps) {
  var source = comment || null;
  var user = actor || 'admin';
  var options = deps || {};
  var core = adminCore();
  var sheetsGateway = options.sheetsGateway || null;
  var spreadsheetId = options.spreadsheetId || '';

  if (!source && sheetsGateway && spreadsheetId && options.commentId) {
    var found = sheetsGateway.findRowBy('Comments', 'comment_id', options.commentId, { spreadsheetId: spreadsheetId });
    source = found ? found.row : null;
  }

  if (!source) {
    return { ok: false, message: 'COMMENT_NOT_FOUND' };
  }

  var softDeleted = core.softDeleteComment(source);
  var audit = createAudit('ADMIN_DELETE_COMMENT', source.comment_id || '', 'moderation', user);

  if (sheetsGateway && spreadsheetId) {
    sheetsGateway.updateRowBy('Comments', 'comment_id', softDeleted.comment_id, softDeleted, {
      spreadsheetId: spreadsheetId
    });
    sheetsGateway.appendRow('AuditLogs', audit, { spreadsheetId: spreadsheetId });
  }

  return {
    ok: true,
    comment: softDeleted,
    audit: audit
  };
}

function reportActionRoute(body, actor, deps) {
  var payload = body || {};
  var user = actor || 'admin';
  var options = deps || {};
  var sheetsGateway = options.sheetsGateway || null;
  var spreadsheetId = options.spreadsheetId || '';
  var audit = createAudit(
    String(payload.type || 'REPORT_ACTION'),
    String(payload.target_id || ''),
    String(payload.reason || ''),
    user
  );

  if (sheetsGateway && spreadsheetId) {
    sheetsGateway.appendRow('AuditLogs', audit, { spreadsheetId: spreadsheetId });
  }

  return {
    ok: true,
    audit: audit
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    adminDeleteCommentRoute: adminDeleteCommentRoute,
    reportActionRoute: reportActionRoute
  };
}
