const { adminDeleteCommentRoute, reportActionRoute } = require('./routes/admin.js');
const { enterRoute, registerOrLoginRoute } = require('./routes/auth.js');
const { createCommentRoute, deleteCommentRoute, updateCommentRoute } = require('./routes/comments.js');
const { createLetterRoute, getLetterByIdRoute, getMailboxesRoute } = require('./routes/letters.js');
const { phaseRoute } = require('./routes/phase.js');

function jsonResponse(payload) {
  return JSON.stringify(payload);
}

function doPost(e) {
  const path = e?.parameter?.path || '';
  const body = JSON.parse(e?.postData?.contents || '{}');

  if (path === '/api/enter') {
    return jsonResponse(enterRoute(body, { ENTRY_CODE: body.expectedCode || '' }));
  }

  if (path === '/api/register-or-login') {
    return jsonResponse(registerOrLoginRoute(body, null));
  }

  if (path === '/api/letters') {
    return jsonResponse(createLetterRoute(body));
  }

  if (path === '/api/comments') {
    return jsonResponse(createCommentRoute(body));
  }

  if (path === '/api/admin/report-action') {
    return jsonResponse(reportActionRoute(body, 'admin'));
  }

  return jsonResponse({ ok: false, message: 'NOT_FOUND' });
}

function doGet(e) {
  const path = e?.parameter?.path || '';

  if (path === '/api/phase') {
    return jsonResponse(phaseRoute());
  }

  if (path === '/api/mailboxes') {
    return jsonResponse(getMailboxesRoute([], { phase: 'PHASE_2' }));
  }

  if (path.startsWith('/api/letters/')) {
    return jsonResponse(getLetterByIdRoute(null, {}));
  }

  return jsonResponse({ ok: false, message: 'NOT_FOUND' });
}

function doPatch(e) {
  const path = e?.parameter?.path || '';
  const body = JSON.parse(e?.postData?.contents || '{}');

  if (path.startsWith('/api/comments/')) {
    return jsonResponse(updateCommentRoute(null, body, {}));
  }

  return jsonResponse({ ok: false, message: 'NOT_FOUND' });
}

function doDelete(e) {
  const path = e?.parameter?.path || '';
  const body = JSON.parse(e?.postData?.contents || '{}');

  if (path.startsWith('/api/admin/comments/')) {
    return jsonResponse(adminDeleteCommentRoute(null, 'admin'));
  }

  if (path.startsWith('/api/comments/')) {
    return jsonResponse(deleteCommentRoute(null, body, {}));
  }

  return jsonResponse({ ok: false, message: 'NOT_FOUND' });
}

module.exports = {
  doDelete,
  doGet,
  doPatch,
  doPost
};
