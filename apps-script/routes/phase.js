const { resolvePhase } = require('../../src/shared/phase.js');

function phaseRoute(env = {}) {
  const now = env.now ? new Date(env.now) : new Date();

  return {
    ok: true,
    phase: resolvePhase(now)
  };
}

module.exports = {
  phaseRoute
};
