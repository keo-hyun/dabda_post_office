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
});
