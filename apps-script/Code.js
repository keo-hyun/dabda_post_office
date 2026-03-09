function routeFns() {
  if (typeof enterRoute === 'function') {
    return {
      adminDeleteCommentRoute: adminDeleteCommentRoute,
      createCommentRoute: createCommentRoute,
      createLetterRoute: createLetterRoute,
      deleteCommentRoute: deleteCommentRoute,
      enterRoute: enterRoute,
      getLetterByIdRoute: getLetterByIdRoute,
      getMailboxesRoute: getMailboxesRoute,
      isApiPath: isApiPath,
      phaseRoute: phaseRoute,
      registerOrLoginRoute: registerOrLoginRoute,
      reportActionRoute: reportActionRoute,
      resolveRequestPath: resolveRequestPath,
      updateCommentRoute: updateCommentRoute
    };
  }

  var auth = require('./routes/auth.js');
  var comments = require('./routes/comments.js');
  var letters = require('./routes/letters.js');
  var admin = require('./routes/admin.js');
  var phase = require('./routes/phase.js');
  var staticRoute = require('./routes/static.js');

  return {
    adminDeleteCommentRoute: admin.adminDeleteCommentRoute,
    createCommentRoute: comments.createCommentRoute,
    createLetterRoute: letters.createLetterRoute,
    deleteCommentRoute: comments.deleteCommentRoute,
    enterRoute: auth.enterRoute,
    getLetterByIdRoute: letters.getLetterByIdRoute,
    getMailboxesRoute: letters.getMailboxesRoute,
    isApiPath: staticRoute.isApiPath,
    phaseRoute: phase.phaseRoute,
    registerOrLoginRoute: auth.registerOrLoginRoute,
    reportActionRoute: admin.reportActionRoute,
    resolveRequestPath: staticRoute.resolveRequestPath,
    updateCommentRoute: comments.updateCommentRoute
  };
}

function gatewayFns() {
  if (typeof appendRow === 'function') {
    return {
      driveGateway: {
        normalizeBase64Image: normalizeBase64Image,
        uploadImageToDrive: uploadImageToDrive
      },
      sheetsGateway: {
        appendRow: appendRow,
        findRowBy: findRowBy,
        getAllRows: getAllRows,
        mapHeaderRow: mapHeaderRow,
        updateRowBy: updateRowBy
      }
    };
  }

  var drive = require('./lib/driveGateway.js');
  var sheets = require('./lib/sheetsGateway.js');

  return {
    driveGateway: drive,
    sheetsGateway: sheets
  };
}

function jsonResponse(payload) {
  if (typeof ContentService !== 'undefined') {
    return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
  }

  return JSON.stringify(payload);
}

function parseBody(event) {
  var e = event || {};
  return JSON.parse((e.postData && e.postData.contents) || '{}');
}

function readScriptProperties() {
  if (typeof PropertiesService === 'undefined') {
    return {};
  }

  return PropertiesService.getScriptProperties().getProperties();
}

function buildRouteDeps() {
  var props = readScriptProperties();
  var gateways = gatewayFns();
  var cacheGateway = null;

  if (typeof CacheService !== 'undefined') {
    try {
      var scriptCache = CacheService.getScriptCache();
      cacheGateway = {
        get: function (key) {
          return scriptCache.get(String(key || '')) || '';
        },
        set: function (key, value, ttlSeconds) {
          scriptCache.put(String(key || ''), String(value || ''), Number(ttlSeconds) || 15);
        },
        remove: function (key) {
          scriptCache.remove(String(key || ''));
        }
      };
    } catch (error) {
      cacheGateway = null;
    }
  }

  return {
    cacheGateway: cacheGateway,
    driveFolderId: props.DRIVE_FOLDER_ID || '',
    spreadsheetId: props.SPREADSHEET_ID || '',
    driveGateway: gateways.driveGateway,
    sheetsGateway: gateways.sheetsGateway
  };
}

function renderStatic(path) {
  if (typeof HtmlService === 'undefined') {
    return jsonResponse({ ok: true, path: path });
  }

  var html =
    '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Dabda Post Office</title></head><body><main style="font-family:sans-serif;padding:24px;max-width:760px;margin:0 auto;">' +
    '<h1>Dabda Post Office API</h1><p>Web app is deployed. Use API paths with <code>?path=/api/...</code>.</p>' +
    '<p>Example: <code>POST ?path=/api/enter</code></p></main></body></html>';

  return HtmlService.createHtmlOutput(html);
}

function routeErrorResponse(error) {
  var message = (error && error.message) || 'INTERNAL_ERROR';
  return jsonResponse({ ok: false, message: String(message) });
}

function persistMetricIfPresent(response, deps) {
  var payload = response || {};
  var options = deps || {};
  var sheetsGateway = options.sheetsGateway || null;
  var spreadsheetId = options.spreadsheetId || '';

  if (!payload.metric || !sheetsGateway || !spreadsheetId) {
    return payload;
  }

  try {
    sheetsGateway.appendRow('Metrics', payload.metric, { spreadsheetId: spreadsheetId });
  } catch (error) {
    // Metrics persistence is best-effort and must not block main API flow.
  }

  return payload;
}

function doPost(event) {
  try {
    var routes = routeFns();
    var path = routes.resolveRequestPath(event, 'POST');
    var body = parseBody(event);
    var props = readScriptProperties();
    var deps = buildRouteDeps();

    if (path === '/api/enter') {
      var enterResult = routes.enterRoute(body, {
        ENTRY_CODE: props.ENTRY_CODE || '',
        PHASE_MODE: props.PHASE_MODE || '',
        now: props.NOW || ''
      });
      return jsonResponse(persistMetricIfPresent(enterResult, deps));
    }

    if (path === '/api/register-or-login') {
      return jsonResponse(routes.registerOrLoginRoute(body, null, deps));
    }

    if (path === '/api/letters') {
      return jsonResponse(persistMetricIfPresent(routes.createLetterRoute(body, deps), deps));
    }

    if (path === '/api/comments') {
      return jsonResponse(persistMetricIfPresent(routes.createCommentRoute(body, deps), deps));
    }

    if (path === '/api/admin/report-action') {
      return jsonResponse(routes.reportActionRoute(body, 'admin', deps));
    }

    return jsonResponse({ ok: false, message: 'NOT_FOUND' });
  } catch (error) {
    return routeErrorResponse(error);
  }
}

function doGet(event) {
  try {
    var routes = routeFns();
    var path = routes.resolveRequestPath(event, 'GET');
    var props = readScriptProperties();
    var deps = buildRouteDeps();

    if (!routes.isApiPath(path)) {
      return renderStatic(path);
    }

    if (path === '/api/phase') {
      return jsonResponse(routes.phaseRoute({ PHASE_MODE: props.PHASE_MODE || '', now: props.NOW || '' }));
    }

    if (path === '/api/mailboxes') {
      return jsonResponse(persistMetricIfPresent(routes.getMailboxesRoute([], { phase: 'PHASE_2' }, deps), deps));
    }

    if (path.indexOf('/api/letters/') === 0) {
      var letterId = path.replace('/api/letters/', '');
      var phaseResult = routes.phaseRoute({ PHASE_MODE: props.PHASE_MODE || '', now: props.NOW || '' });
      return jsonResponse(routes.getLetterByIdRoute(null, { letterId: letterId, phase: phaseResult.phase }, deps));
    }

    return jsonResponse({ ok: false, message: 'NOT_FOUND' });
  } catch (error) {
    return routeErrorResponse(error);
  }
}

function doPatch(event) {
  try {
    var routes = routeFns();
    var path = routes.resolveRequestPath(event, 'PATCH');
    var body = parseBody(event);
    var deps = buildRouteDeps();

    if (path.indexOf('/api/comments/') === 0) {
      var commentId = path.replace('/api/comments/', '');
      return jsonResponse(
        persistMetricIfPresent(routes.updateCommentRoute(null, Object.assign({}, body, { comment_id: commentId }), {}, deps), deps)
      );
    }

    return jsonResponse({ ok: false, message: 'NOT_FOUND' });
  } catch (error) {
    return routeErrorResponse(error);
  }
}

function doDelete(event) {
  try {
    var routes = routeFns();
    var path = routes.resolveRequestPath(event, 'DELETE');
    var body = parseBody(event);
    var deps = buildRouteDeps();

    if (path.indexOf('/api/admin/comments/') === 0) {
      var adminCommentId = path.replace('/api/admin/comments/', '');
      return jsonResponse(
        routes.adminDeleteCommentRoute(null, 'admin', Object.assign({}, deps, { commentId: adminCommentId }))
      );
    }

    if (path.indexOf('/api/comments/') === 0) {
      var commentId = path.replace('/api/comments/', '');
      return jsonResponse(
        persistMetricIfPresent(routes.deleteCommentRoute(null, Object.assign({}, body, { comment_id: commentId }), {}, deps), deps)
      );
    }

    return jsonResponse({ ok: false, message: 'NOT_FOUND' });
  } catch (error) {
    return routeErrorResponse(error);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    doDelete: doDelete,
    doGet: doGet,
    doPatch: doPatch,
    doPost: doPost
  };
}
