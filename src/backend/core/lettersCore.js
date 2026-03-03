const {
  validateContentLength,
  validateImageSize,
  validateVisibility
} = require('../../shared/validators.js');

function validateLetterPayload(payload = {}) {
  if (!validateContentLength(payload.content || '')) {
    return { ok: false, message: 'CONTENT_TOO_LONG' };
  }

  const imageBytes = payload.imageBytes ?? payload.image?.size ?? 0;
  if (!validateImageSize(imageBytes)) {
    return { ok: false, message: 'IMAGE_TOO_LARGE' };
  }

  if (!validateVisibility(payload.visibility || 'PUBLIC')) {
    return { ok: false, message: 'INVALID_VISIBILITY' };
  }

  return { ok: true };
}

function canViewLetter(letter = {}, context = {}) {
  if (context.isAdmin || context.isOwner) {
    return true;
  }

  if (letter.visibility === 'PRIVATE') {
    return false;
  }

  return context.phase === 'PHASE_2';
}

module.exports = {
  canViewLetter,
  validateLetterPayload
};
