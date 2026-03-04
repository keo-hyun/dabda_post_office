function canEditComment(comment = {}, context = {}) {
  return Boolean(context.isAdmin || context.passwordOk);
}

function buildSoftDeletePatch(now = new Date()) {
  return {
    deleted_at: now.toISOString()
  };
}

function softDeleteComment(comment = {}, now = new Date()) {
  return {
    ...comment,
    ...buildSoftDeletePatch(now)
  };
}

module.exports = {
  buildSoftDeletePatch,
  canEditComment,
  softDeleteComment
};
