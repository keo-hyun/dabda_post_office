const { REQUIRED_SCRIPT_PROPS } = require('./schema.js');

const PROVISIONED_RESOURCE_IDS = {
  SPREADSHEET_ID: '1GSKuJm9NyQYHWhB4SuZSqWe6CHEswFX5RGnEYZKnpI0'
};

function validateScriptProperties(props = {}) {
  const missing = REQUIRED_SCRIPT_PROPS.filter((key) => !props[key]);

  return {
    ok: missing.length === 0,
    missing
  };
}

module.exports = {
  PROVISIONED_RESOURCE_IDS,
  validateScriptProperties
};
