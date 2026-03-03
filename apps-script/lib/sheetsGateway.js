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

  if (typeof services.openById === 'function') {
    return services.openById(spreadsheetId);
  }

  if (typeof SpreadsheetApp !== 'undefined') {
    return SpreadsheetApp.openById(spreadsheetId);
  }

  throw new Error('Spreadsheet service is not available');
}

function getSheet(spreadsheet, sheetName) {
  const sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`Sheet not found: ${sheetName}`);
  }
  return sheet;
}

function getHeaders(sheet) {
  const lastColumn = sheet.getLastColumn();
  if (lastColumn === 0) return [];
  const headerRow = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  return headerRow.map((header) => String(header));
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
  const headers = options.headers || getHeaders(sheet);
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

module.exports = {
  appendRow,
  findRowBy,
  getAllRows,
  mapHeaderRow,
  updateRowBy
};
