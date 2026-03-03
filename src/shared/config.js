const { REQUIRED_SCRIPT_PROPS } = require('./schema.js');

function validateScriptProperties(props = {}) {
  const missing = REQUIRED_SCRIPT_PROPS.filter((key) => !props[key]);

  return {
    ok: missing.length === 0,
    missing
  };
}

module.exports = {
  validateScriptProperties
};
