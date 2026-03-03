function phaseRoute(env) {
  var runtime = env || {};
  var now = runtime.now ? new Date(runtime.now) : new Date();
  var phaseResolver = typeof resolvePhase === 'function' ? resolvePhase : require('../lib/core.js').resolvePhase;

  return {
    ok: true,
    phase: phaseResolver(now)
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    phaseRoute: phaseRoute
  };
}
