import { describe, expect, it, vi } from 'vitest';
import { startLoopingAudio } from '../../web/audio.js';

describe('audio playback bootstrap', () => {
  it('starts looping audio immediately on app init', async () => {
    const handlers = {};
    const windowObj = {
      addEventListener: vi.fn((event, handler) => {
        handlers[event] = handler;
      }),
      removeEventListener: vi.fn()
    };
    const audio = {
      loop: false,
      preload: 'none',
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn()
    };

    startLoopingAudio({
      windowObj,
      createAudio: () => audio,
      src: './assets/audio_1.mp3'
    });

    await Promise.resolve();

    expect(audio.loop).toBe(true);
    expect(audio.preload).toBe('auto');
    expect(audio.play).toHaveBeenCalledTimes(1);
    expect(windowObj.addEventListener).toHaveBeenCalled();
    expect(windowObj.removeEventListener).toHaveBeenCalled();
  });

  it('retries playback on first user interaction when autoplay is blocked', async () => {
    const handlers = {};
    const windowObj = {
      addEventListener: vi.fn((event, handler) => {
        handlers[event] = handler;
      }),
      removeEventListener: vi.fn()
    };

    const audio = {
      loop: false,
      preload: 'none',
      play: vi
        .fn()
        .mockRejectedValueOnce(new Error('autoplay blocked'))
        .mockResolvedValueOnce(undefined),
      pause: vi.fn()
    };

    startLoopingAudio({
      windowObj,
      createAudio: () => audio,
      src: './assets/audio_1.mp3'
    });

    await Promise.resolve();
    await handlers.pointerdown();
    await Promise.resolve();

    expect(audio.play).toHaveBeenCalledTimes(2);
    expect(windowObj.removeEventListener).toHaveBeenCalled();
  });
});
