const spreadsheetCache = new Map();
const headerCache = new Map();

function mapHeaderRow(headers = [], values = []) {
  return headers.reduce((acc, key, idx) => {
    acc[key] = values[idx] ?? '';
    return acc;
  }, {});
}

function resolveSpreadsheet(spreadsheetId, services = {}) {
  if (services.spreadsheet) {
    return services.spreadsheet;
  }

  const cacheKey = spreadsheetId ? String(spreadsheetId) : '';
  if (cacheKey && spreadsheetCache.has(cacheKey)) {
    return spreadsheetCache.get(cacheKey);
  }

  let spreadsheet = null;

  if (typeof services.openById === 'function') {
    spreadsheet = services.openById(spreadsheetId);
  } else if (typeof SpreadsheetApp !== 'undefined') {
    spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  }
  if (!spreadsheet) {
    throw new Error('Spreadsheet service is not available');
  }

  if (cacheKey) {
    spreadsheetCache.set(cacheKey, spreadsheet);
  }

  return spreadsheet;
}

function getSheet(spreadsheet, sheetName) {
  const sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`Sheet not found: ${sheetName}`);
  }
  return sheet;
}

function getHeaders(sheet, cacheKey = '') {
  if (cacheKey && headerCache.has(cacheKey)) {
    return headerCache.get(cacheKey);
  }

  const lastColumn = sheet.getLastColumn();
  if (lastColumn === 0) return [];
  const headerRow = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  const headers = headerRow.map((header) => String(header));

  if (cacheKey) {
    headerCache.set(cacheKey, headers);
  }

  return headers;
}

function getAllRows(sheetName, options = {}) {
  const spreadsheet = resolveSpreadsheet(options.spreadsheetId, options.services);
  const sheet = getSheet(spreadsheet, sheetName);
  const values = sheet.getDataRange().getValues();

  if (values.length <= 1) return [];

  const headers = values[0].map((header) => String(header));
  return values.slice(1).map((row) => mapHeaderRow(headers, row));
}

function appendRow(sheetName, payload = {}, options = {}) {
  const spreadsheet = resolveSpreadsheet(options.spreadsheetId, options.services);
  const sheet = getSheet(spreadsheet, sheetName);
  const headerCacheKey = options.spreadsheetId ? `${options.spreadsheetId}:${sheetName}` : '';
  const headers = options.headers || getHeaders(sheet, headerCacheKey);
  const row = headers.map((key) => payload[key] ?? '');

  sheet.appendRow(row);
  return mapHeaderRow(headers, row);
}

function findRowBy(sheetName, column, value, options = {}) {
  const spreadsheet = resolveSpreadsheet(options.spreadsheetId, options.services);
  const sheet = getSheet(spreadsheet, sheetName);
  const values = sheet.getDataRange().getValues();

  if (values.length <= 1) return null;

  const headers = values[0].map((header) => String(header));
  const columnIndex = headers.indexOf(column);
  if (columnIndex === -1) return null;

  for (let rowIndex = 1; rowIndex < values.length; rowIndex += 1) {
    if (String(values[rowIndex][columnIndex]) === String(value)) {
      return {
        row: mapHeaderRow(headers, values[rowIndex]),
        rowIndex: rowIndex + 1,
        headers
      };
    }
  }

  return null;
}

function updateRowBy(sheetName, column, value, patch = {}, options = {}) {
  const spreadsheet = resolveSpreadsheet(options.spreadsheetId, options.services);
  const sheet = getSheet(spreadsheet, sheetName);
  const found = findRowBy(sheetName, column, value, options);

  if (!found) return null;

  const merged = {
    ...found.row,
    ...patch
  };
  const rowValues = found.headers.map((key) => merged[key] ?? '');

  sheet.getRange(found.rowIndex, 1, 1, found.headers.length).setValues([rowValues]);

  return {
    row: mapHeaderRow(found.headers, rowValues),
    rowIndex: found.rowIndex,
    headers: found.headers
  };
}

function clearGatewayCache() {
  spreadsheetCache.clear();
  headerCache.clear();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    appendRow,
    clearGatewayCache,
    findRowBy,
    getAllRows,
    mapHeaderRow,
    updateRowBy
  };
}
