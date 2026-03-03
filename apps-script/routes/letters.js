const { canViewLetter, validateLetterPayload } = require('../../src/backend/core/lettersCore.js');
const { buildMetricEvent } = require('../../src/backend/core/metricsCore.js');

function createLetterRoute(body = {}) {
  const validation = validateLetterPayload(body);
  if (!validation.ok) {
    return validation;
  }

  return {
    ok: true,
    message: 'LETTER_CREATED',
    metric: buildMetricEvent('LETTER_SUBMITTED', { userId: body.user_id || '' })
  };
}

function getMailboxesRoute(letters = [], context = {}) {
  return {
    ok: true,
    letters: letters.filter((letter) => canViewLetter(letter, context) && letter.visibility === 'PUBLIC'),
    metric: buildMetricEvent('MAILBOX_VIEW', { userId: context.userId || '' })
  };
}

function getLetterByIdRoute(letter = null, context = {}) {
  if (!letter) {
    return { ok: false, message: 'LETTER_NOT_FOUND' };
  }

  if (!canViewLetter(letter, context)) {
    return { ok: false, message: 'FORBIDDEN' };
  }

  return { ok: true, letter };
}

module.exports = {
  createLetterRoute,
  getLetterByIdRoute,
  getMailboxesRoute
};
