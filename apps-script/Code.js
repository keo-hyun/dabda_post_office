const { adminDeleteCommentRoute, reportActionRoute } = require('./routes/admin.js');
const { enterRoute, registerOrLoginRoute } = require('./routes/auth.js');
const { createCommentRoute, deleteCommentRoute, updateCommentRoute } = require('./routes/comments.js');
const { createLetterRoute, getLetterByIdRoute, getMailboxesRoute } = require('./routes/letters.js');
const { phaseRoute } = require('./routes/phase.js');
const { isApiPath, resolveRequestPath } = require('./routes/static.js');
const driveGateway = require('./lib/driveGateway.js');
const sheetsGateway = require('./lib/sheetsGateway.js');

function jsonResponse(payload) {
  return JSON.stringify(payload);
}

function parseBody(event = {}) {
  return JSON.parse(event?.postData?.contents || '{}');
}

function readScriptProperties() {
  if (typeof PropertiesService === 'undefined') {
    return {};
  }

  return PropertiesService.getScriptProperties().getProperties();
}

function buildRouteDeps() {
  const props = readScriptProperties();

  return {
    driveFolderId: props.DRIVE_FOLDER_ID || '',
    spreadsheetId: props.SPREADSHEET_ID || '',
    driveGateway,
    sheetsGateway
  };
}

function renderStatic(path) {
  if (typeof HtmlService === 'undefined') {
    return jsonResponse({ ok: true, path });
  }

  if (path === '/index.html') {
    return HtmlService.createHtmlOutputFromFile('index');
  }

  return HtmlService.createHtmlOutput('Not Found');
}

function doPost(event) {
  const path = resolveRequestPath(event, 'POST');
  const body = parseBody(event);
  const props = readScriptProperties();
  const deps = buildRouteDeps();

  if (path === '/api/enter') {
    return jsonResponse(enterRoute(body, { ENTRY_CODE: props.ENTRY_CODE || '', now: props.NOW || '' }));
  }

  if (path === '/api/register-or-login') {
    return jsonResponse(registerOrLoginRoute(body, null, deps));
  }

  if (path === '/api/letters') {
    return jsonResponse(createLetterRoute(body, deps));
  }

  if (path === '/api/comments') {
    return jsonResponse(createCommentRoute(body, deps));
  }

  if (path === '/api/admin/report-action') {
    return jsonResponse(reportActionRoute(body, 'admin', deps));
  }

  return jsonResponse({ ok: false, message: 'NOT_FOUND' });
}

function doGet(event) {
  const path = resolveRequestPath(event, 'GET');
  const deps = buildRouteDeps();

  if (!isApiPath(path)) {
    return renderStatic(path);
  }

  if (path === '/api/phase') {
    return jsonResponse(phaseRoute());
  }

  if (path === '/api/mailboxes') {
    return jsonResponse(getMailboxesRoute([], { phase: 'PHASE_2' }, deps));
  }

  if (path.startsWith('/api/letters/')) {
    const letterId = path.replace('/api/letters/', '');
    return jsonResponse(getLetterByIdRoute(null, { letterId }, deps));
  }

  return jsonResponse({ ok: false, message: 'NOT_FOUND' });
}

function doPatch(event) {
  const path = resolveRequestPath(event, 'PATCH');
  const body = parseBody(event);
  const deps = buildRouteDeps();

  if (path.startsWith('/api/comments/')) {
    const commentId = path.replace('/api/comments/', '');
    return jsonResponse(updateCommentRoute(null, { ...body, comment_id: commentId }, {}, deps));
  }

  return jsonResponse({ ok: false, message: 'NOT_FOUND' });
}

function doDelete(event) {
  const path = resolveRequestPath(event, 'DELETE');
  const body = parseBody(event);
  const deps = buildRouteDeps();

  if (path.startsWith('/api/admin/comments/')) {
    const commentId = path.replace('/api/admin/comments/', '');
    return jsonResponse(adminDeleteCommentRoute(null, 'admin', { ...deps, commentId }));
  }

  if (path.startsWith('/api/comments/')) {
    const commentId = path.replace('/api/comments/', '');
    return jsonResponse(deleteCommentRoute(null, { ...body, comment_id: commentId }, {}, deps));
  }

  return jsonResponse({ ok: false, message: 'NOT_FOUND' });
}

module.exports = {
  doDelete,
  doGet,
  doPatch,
  doPost
};
