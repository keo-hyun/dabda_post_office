import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApiClient } from '../../web/api.js';

const GAS_WEB_APP_URL =
  'https://script.google.com/macros/s/AKfycbzLKag8DcYZC2EAZdBVIwUHmpq8X8cZh8JicQNo1IDrpM3i4YmpVZfMTo1iwWYFlmK1QA/exec';

afterEach(() => {
  delete globalThis.window;
  delete globalThis.fetch;
});

describe('frontend api client', () => {
  it('uses mock api on localhost by default', async () => {
    globalThis.window = {
      location: {
        hostname: '127.0.0.1',
        search: ''
      }
    };
    globalThis.fetch = vi.fn();

    const api = createApiClient();
    const result = await api.enter('DABDA2026');

    expect(result.ok).toBe(true);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('routes requests to GAS endpoint when apiMode=real and apiBase is set', async () => {
    globalThis.window = {
      location: {
        hostname: '127.0.0.1',
        search: `?apiMode=real&apiBase=${encodeURIComponent(GAS_WEB_APP_URL)}`
      }
    };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, phase: 'PHASE_1' })
    });

    const api = createApiClient();
    const result = await api.enter('DABDA2026');

    expect(result.ok).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${GAS_WEB_APP_URL}?path=%2Fapi%2Fenter`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' }
      })
    );
  });

  it('requires nickname only when creating comment in mock mode', async () => {
    globalThis.window = {
      location: {
        hostname: '127.0.0.1',
        search: ''
      }
    };
    globalThis.fetch = vi.fn();

    const api = createApiClient();
    const withNickname = await api.createComment('letter-1', {
      nickname: '테스터',
      content: '댓글 테스트'
    });

    expect(withNickname.ok).toBe(true);

    const missingNickname = await api.createComment('letter-1', {
      content: '댓글 테스트'
    });

    expect(missingNickname.ok).toBe(false);
  });

  it('reuses phase2 mailbox prefetch request when mailbox is requested immediately after entry', async () => {
    globalThis.window = {
      location: {
        hostname: '127.0.0.1',
        search: `?apiMode=real&apiBase=${encodeURIComponent(GAS_WEB_APP_URL)}`
      }
    };

    let resolveMailbox;
    globalThis.fetch = vi.fn().mockImplementation((url) => {
      if (String(url).includes('%2Fapi%2Fenter')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ ok: true, phase: 'PHASE_2' })
        });
      }

      if (String(url).includes('%2Fapi%2Fmailboxes')) {
        return new Promise((resolve) => {
          resolveMailbox = () =>
            resolve({
              ok: true,
              json: async () => ({ ok: true, letters: [{ letter_id: 'l1', visibility: 'PUBLIC' }] })
            });
        });
      }

      return Promise.reject(new Error(`Unexpected url: ${url}`));
    });

    const api = createApiClient();
    const entered = await api.enter('DABDA2026');
    expect(entered.phase).toBe('PHASE_2');
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);

    const mailboxesPromise = api.getMailboxes();
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);

    resolveMailbox();
    const mailboxes = await mailboxesPromise;
    expect(mailboxes.ok).toBe(true);
    expect(mailboxes.letters).toHaveLength(1);
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it('falls back to redirected googleusercontent base when script.google.com request fails', async () => {
    globalThis.window = {
      location: {
        hostname: 'keo-hyun.github.io',
        search: `?apiMode=real&apiBase=${encodeURIComponent(GAS_WEB_APP_URL)}`
      }
    };

    const redirectedBase =
      'https://script.googleusercontent.com/macros/echo?user_content_key=test_key&lib=test_lib';
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        json: async () => {
          throw new Error('non-json error body');
        }
      })
      .mockResolvedValueOnce({
        ok: true,
        url: redirectedBase,
        json: async () => ({ ok: true })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, phase: 'PHASE_1' })
      });

    const api = createApiClient();
    const result = await api.enter('DABDA2026');

    expect(result.ok).toBe(true);
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      1,
      `${GAS_WEB_APP_URL}?path=%2Fapi%2Fenter`,
      expect.objectContaining({ method: 'POST' })
    );
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      2,
      GAS_WEB_APP_URL,
      expect.objectContaining({ method: 'GET' })
    );
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      3,
      `${redirectedBase}&path=%2Fapi%2Fenter`,
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('reuses persisted apiBase when query parameter is missing later in same tab session', async () => {
    const storage = new Map();
    const sessionStorage = {
      getItem: vi.fn((key) => (storage.has(key) ? storage.get(key) : null)),
      setItem: vi.fn((key, value) => storage.set(key, String(value))),
      removeItem: vi.fn((key) => storage.delete(key))
    };

    globalThis.window = {
      location: {
        hostname: 'keo-hyun.github.io',
        search: `?apiMode=real&apiBase=${encodeURIComponent(GAS_WEB_APP_URL)}`
      },
      sessionStorage
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, phase: 'PHASE_2', letters: [] })
    });

    const firstClient = createApiClient();
    await firstClient.enter('DABDA2026');

    globalThis.window.location.search = '';
    globalThis.fetch.mockClear();

    const secondClient = createApiClient();
    await secondClient.enter('DABDA2026');

    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      1,
      `${GAS_WEB_APP_URL}?path=%2Fapi%2Fenter`,
      expect.objectContaining({ method: 'POST' })
    );
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      2,
      `${GAS_WEB_APP_URL}?path=%2Fapi%2Fmailboxes`,
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('warms redirected base and phase endpoint before entry request', async () => {
    globalThis.window = {
      location: {
        hostname: 'keo-hyun.github.io',
        search: `?apiMode=real&apiBase=${encodeURIComponent(GAS_WEB_APP_URL)}`
      }
    };

    const redirectedBase =
      'https://script.googleusercontent.com/macros/echo?user_content_key=test_key&lib=test_lib';
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        url: redirectedBase,
        json: async () => ({ ok: true })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, phase: 'PHASE_2' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, phase: 'PHASE_2' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, letters: [] })
      });

    const api = createApiClient();
    await api.warmup();
    const entered = await api.enter('DABDA2026');

    expect(entered.ok).toBe(true);
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      1,
      GAS_WEB_APP_URL,
      expect.objectContaining({ method: 'GET' })
    );
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      2,
      `${redirectedBase}&path=%2Fapi%2Fphase`,
      expect.objectContaining({ method: 'GET' })
    );
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      3,
      `${redirectedBase}&path=%2Fapi%2Fenter`,
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('prefetches and reuses letter detail cache for immediate open', async () => {
    globalThis.window = {
      location: {
        hostname: 'keo-hyun.github.io',
        search: `?apiMode=real&apiBase=${encodeURIComponent(GAS_WEB_APP_URL)}`
      }
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        letter: {
          letter_id: 'l1',
          nickname: '작성자',
          content: '내용',
          comments: []
        }
      })
    });

    const api = createApiClient();
    await api.prefetchLetter('l1');
    const letter = await api.getLetter('l1');

    expect(letter.ok).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });
});
