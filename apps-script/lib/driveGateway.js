function normalizeBase64Image(dataUri = '') {
  const [meta, base64 = ''] = String(dataUri).split(',');
  const mimeType = meta.replace('data:', '').replace(';base64', '');

  return {
    mimeType,
    base64
  };
}

function uploadImageToDrive(dataUri, folderId, filename, services = {}) {
  if (typeof services.upload === 'function') {
    return services.upload(dataUri, folderId, filename);
  }

  if (typeof DriveApp === 'undefined' || typeof Utilities === 'undefined') {
    throw new Error('Drive services are not available');
  }

  const normalized = normalizeBase64Image(dataUri);
  const bytes = Utilities.base64Decode(normalized.base64);
  const blob = Utilities.newBlob(bytes, normalized.mimeType, filename);
  const folder = DriveApp.getFolderById(folderId);
  const file = folder.createFile(blob);

  return {
    fileId: file.getId(),
    mimeType: normalized.mimeType
  };
}

module.exports = {
  normalizeBase64Image,
  uploadImageToDrive
};
