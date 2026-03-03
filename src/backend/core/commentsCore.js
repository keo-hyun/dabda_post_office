function canEditComment(comment = {}, context = {}) {
  return Boolean(context.isAdmin || context.passwordOk);
}

function softDeleteComment(comment = {}, now = new Date()) {
  return {
    ...comment,
    deleted_at: now.toISOString()
  };
}

module.exports = {
  canEditComment,
  softDeleteComment
};
