const { enterRoute, registerOrLoginRoute } = require('./routes/auth.js');

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

  return jsonResponse({ ok: false, message: 'NOT_FOUND' });
}

module.exports = {
  doPost
};
