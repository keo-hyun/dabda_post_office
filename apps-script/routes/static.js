function resolvePath(pathname) {
  var raw = String(pathname || '/').trim();

  if (raw === '' || raw === '/') {
    return '/index.html';
  }

  return raw.startsWith('/') ? raw : '/' + raw;
}

function resolveRequestPath(event, method) {
  var e = event || {};
  var m = method || 'GET';
  var paramPath = (e.parameter && (e.parameter.path || e.parameter.route)) || '';
  var pathInfo = e.pathInfo ? '/' + String(e.pathInfo).replace(/^\/+/, '') : '';
  var candidate = paramPath || pathInfo || '/';

  if (m === 'GET') {
    return resolvePath(candidate);
  }

  return candidate.startsWith('/') ? candidate : '/' + candidate;
}

function isApiPath(pathname) {
  return String(pathname || '').startsWith('/api/');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    isApiPath: isApiPath,
    resolvePath: resolvePath,
    resolveRequestPath: resolveRequestPath
  };
}
