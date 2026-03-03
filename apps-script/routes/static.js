function resolvePath(pathname = '/') {
  const raw = String(pathname || '/').trim();

  if (raw === '' || raw === '/') {
    return '/index.html';
  }

  return raw.startsWith('/') ? raw : `/${raw}`;
}

function resolveRequestPath(event = {}, method = 'GET') {
  const paramPath = event?.parameter?.path || event?.parameter?.route || '';
  const pathInfo = event?.pathInfo ? `/${String(event.pathInfo).replace(/^\/+/, '')}` : '';
  const candidate = paramPath || pathInfo || '/';

  if (method === 'GET') {
    return resolvePath(candidate);
  }

  return candidate.startsWith('/') ? candidate : `/${candidate}`;
}

function isApiPath(pathname = '') {
  return String(pathname).startsWith('/api/');
}

module.exports = {
  isApiPath,
  resolvePath,
  resolveRequestPath
};
