const MAX_LETTER_CONTENT_LENGTH = 1000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_VISIBILITIES = ['PUBLIC', 'PRIVATE'];

function validateContentLength(content = '') {
  return String(content).length <= MAX_LETTER_CONTENT_LENGTH;
}

function validateImageSize(imageBytes = 0) {
  return Number(imageBytes || 0) <= MAX_IMAGE_BYTES;
}

function validateVisibility(visibility = '') {
  return ALLOWED_VISIBILITIES.includes(String(visibility));
}

module.exports = {
  ALLOWED_VISIBILITIES,
  MAX_IMAGE_BYTES,
  MAX_LETTER_CONTENT_LENGTH,
  validateContentLength,
  validateImageSize,
  validateVisibility
};
