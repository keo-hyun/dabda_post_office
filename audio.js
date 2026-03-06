const RETRY_EVENTS = ['pointerdown', 'touchstart', 'keydown'];

function defaultWindow() {
  if (typeof window === 'undefined') {
    return null;
  }
  return window;
}

export function startLoopingAudio(options = {}) {
  const windowObj = options.windowObj || defaultWindow();
  const source = options.src || './assets/audio_1.mp3';
  const createAudio =
    options.createAudio ||
    ((src) => {
      if (!windowObj || typeof windowObj.Audio !== 'function') {
        return null;
      }
      return new windowObj.Audio(src);
    });

  if (
    !windowObj ||
    typeof windowObj.addEventListener !== 'function' ||
    typeof windowObj.removeEventListener !== 'function'
  ) {
    return () => {};
  }

  const audio = createAudio(source);
  if (!audio || typeof audio.play !== 'function') {
    return () => {};
  }

  audio.loop = true;
  audio.preload = 'auto';

  let active = true;

  async function tryPlay() {
    if (!active) {
      return false;
    }

    try {
      const result = audio.play();
      if (result && typeof result.then === 'function') {
        await result;
      }
      cleanupListeners();
      return true;
    } catch (error) {
      return false;
    }
  }

  async function onInteraction() {
    await tryPlay();
  }

  function cleanupListeners() {
    RETRY_EVENTS.forEach((eventName) => {
      windowObj.removeEventListener(eventName, onInteraction);
    });
  }

  RETRY_EVENTS.forEach((eventName) => {
    windowObj.addEventListener(eventName, onInteraction, { passive: true });
  });

  void tryPlay();

  return () => {
    active = false;
    cleanupListeners();
    if (typeof audio.pause === 'function') {
      audio.pause();
    }
  };
}
