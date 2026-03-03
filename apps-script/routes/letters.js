const { canViewLetter, validateLetterPayload } = require('../../src/backend/core/lettersCore.js');
const { buildMetricEvent } = require('../../src/backend/core/metricsCore.js');
const driveGatewayLib = require('../lib/driveGateway.js');

function createLetterRoute(body = {}, deps = {}) {
  const sheetsGateway = deps.sheetsGateway || null;
  const driveGateway = deps.driveGateway || driveGatewayLib;
  const driveFolderId = deps.driveFolderId || body.drive_folder_id || '';
  const spreadsheetId = deps.spreadsheetId || '';
  const validation = validateLetterPayload(body);
  if (!validation.ok) {
    return validation;
  }

  const letter = {
    letter_id: body.letter_id || `l_${Date.now()}`,
    user_id: body.user_id || '',
    nickname: body.nickname || '',
    content: body.content || '',
    image_file_id: body.image_file_id || '',
    visibility: body.visibility || 'PUBLIC',
    phase_created: body.phase_created || '',
    created_at: body.created_at || new Date().toISOString()
  };

  if (body.imageDataUri && driveFolderId) {
    const uploaded = driveGateway.uploadImageToDrive(
      body.imageDataUri,
      driveFolderId,
      body.imageFilename || `${letter.letter_id}.png`,
      deps.driveServices || {}
    );
    letter.image_file_id = uploaded.fileId || '';
  }

  if (sheetsGateway && spreadsheetId) {
    sheetsGateway.appendRow('Letters', letter, { spreadsheetId });
  }

  return {
    ok: true,
    message: 'LETTER_CREATED',
    letter,
    metric: buildMetricEvent('LETTER_SUBMITTED', { userId: body.user_id || '' })
  };
}

function getMailboxesRoute(letters = [], context = {}, deps = {}) {
  const sheetsGateway = deps.sheetsGateway || null;
  const spreadsheetId = deps.spreadsheetId || '';
  const source = letters.length
    ? letters
    : sheetsGateway && spreadsheetId
      ? sheetsGateway.getAllRows('Letters', { spreadsheetId })
      : [];

  return {
    ok: true,
    letters: source.filter((letter) => canViewLetter(letter, context) && letter.visibility === 'PUBLIC'),
    metric: buildMetricEvent('MAILBOX_VIEW', { userId: context.userId || '' })
  };
}

function getLetterByIdRoute(letter = null, context = {}, deps = {}) {
  const sheetsGateway = deps.sheetsGateway || null;
  const spreadsheetId = deps.spreadsheetId || '';
  let source = letter;

  if (!source && sheetsGateway && spreadsheetId && context.letterId) {
    const found = sheetsGateway.findRowBy('Letters', 'letter_id', context.letterId, { spreadsheetId });
    source = found ? found.row : null;
  }

  if (!source) {
    return { ok: false, message: 'LETTER_NOT_FOUND' };
  }

  if (!canViewLetter(source, context)) {
    return { ok: false, message: 'FORBIDDEN' };
  }

  return { ok: true, letter: source };
}

module.exports = {
  createLetterRoute,
  getLetterByIdRoute,
  getMailboxesRoute
};
