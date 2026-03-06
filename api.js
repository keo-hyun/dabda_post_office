const mockDb = {
  letters: [
    {
      letter_id: 'letter-1',
      nickname: '초대된 손님',
      content: '오늘의 마음을 우체통에 남겨요.',
      visibility: 'PUBLIC',
      comments: []
    }
  ]
};

function readPhaseOverride() {
  if (typeof window === 'undefined') {
    return 'PHASE_1';
  }

  const phase = new URLSearchParams(window.location.search).get('phase');
  if (phase === 'PHASE_1' || phase === 'TRANSITION' || phase === 'PHASE_2') {
    return phase;
  }

  return 'PHASE_1';
}

async function requestJson(path, options = {}) {
  const response = await fetch(path, options);
  let payload = null;

  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.message || '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.');
  }

  return payload || { ok: true };
}

function resolveApiUrl(baseUrl, path) {
  if (!baseUrl) {
    return path;
  }

  const trimmed = String(baseUrl).trim().replace(/\/+$/, '');
  const delimiter = trimmed.includes('?') ? '&' : '?';
  return `${trimmed}${delimiter}path=${encodeURIComponent(path)}`;
}

function isScriptGoogleExecUrl(baseUrl) {
  try {
    const parsed = new URL(String(baseUrl || ''));
    return parsed.hostname === 'script.google.com' && parsed.pathname.includes('/macros/s/');
  } catch (error) {
    return false;
  }
}

function mockApi() {
  return {
    async enter(entryCode) {
      if (entryCode !== 'DABDA2026') {
        return { ok: false, message: '입장 코드가 올바르지 않아요.' };
      }
      return { ok: true, phase: readPhaseOverride() };
    },
    async submitLetter(payload) {
      const next = {
        letter_id: `letter-${mockDb.letters.length + 1}`,
        nickname: payload.nickname || '익명',
        content: payload.content,
        visibility: payload.visibility || 'PUBLIC',
        comments: []
      };
      mockDb.letters.unshift(next);
      return { ok: true, letter: next };
    },
    async getMailboxes() {
      return { ok: true, letters: mockDb.letters.filter((letter) => letter.visibility === 'PUBLIC') };
    },
    async getLetter(letterId) {
      const letter = mockDb.letters.find((item) => item.letter_id === letterId);
      if (!letter) return { ok: false, message: '편지를 찾을 수 없어요.' };
      return { ok: true, letter };
    },
    async createComment(letterId, payload) {
      const letter = mockDb.letters.find((item) => item.letter_id === letterId);
      if (!letter) return { ok: false, message: '편지를 찾을 수 없어요.' };
      const nickname = String(payload.nickname || '').trim();
      if (!nickname) {
        return { ok: false, message: '작성자를 입력해 주세요.' };
      }
      const comment = {
        comment_id: `comment-${Date.now()}`,
        nickname,
        content: payload.content
      };
      letter.comments.push(comment);
      return { ok: true, comment };
    }
  };
}

function realApi(baseUrl = '') {
  const useCorsSafePost = Boolean(baseUrl);
  const postHeaders = {
    'Content-Type': useCorsSafePost ? 'text/plain;charset=UTF-8' : 'application/json'
  };
  const canUseRedirectFallback = isScriptGoogleExecUrl(baseUrl);
  let redirectedBase = '';
  let redirectedBasePromise = null;
  let mailboxCache = null;
  let mailboxRequestedAt = 0;
  let mailboxInflight = null;
  const MAILBOX_CACHE_TTL_MS = 10 * 1000;

  async function resolveRedirectedBase() {
    if (!canUseRedirectFallback) {
      return baseUrl;
    }

    if (redirectedBase) {
      return redirectedBase;
    }

    if (redirectedBasePromise) {
      return redirectedBasePromise;
    }

    redirectedBasePromise = fetch(baseUrl, { method: 'GET' })
      .then((response) => {
        const resolvedUrl = String(response?.url || '').trim();
        if (resolvedUrl.includes('script.googleusercontent.com')) {
          redirectedBase = resolvedUrl;
          return redirectedBase;
        }
        return baseUrl;
      })
      .catch(() => baseUrl)
      .finally(() => {
        redirectedBasePromise = null;
      });

    return redirectedBasePromise;
  }

  async function requestWithBaseFallback(path, optionsFactory) {
    const primaryBase = redirectedBase || baseUrl;
    try {
      return await requestJson(resolveApiUrl(primaryBase, path), optionsFactory());
    } catch (error) {
      if (!canUseRedirectFallback || redirectedBase) {
        throw error;
      }

      const resolvedBase = await resolveRedirectedBase();
      if (!resolvedBase || resolvedBase === primaryBase) {
        throw error;
      }

      return requestJson(resolveApiUrl(resolvedBase, path), optionsFactory());
    }
  }

  function postJson(path, payload) {
    return requestWithBaseFallback(path, () => ({
      method: 'POST',
      headers: postHeaders,
      body: JSON.stringify(payload)
    }));
  }

  function getJson(path) {
    return requestWithBaseFallback(path, () => ({
      method: 'GET'
    }));
  }

  function fetchMailboxes() {
    if (mailboxInflight) {
      return mailboxInflight;
    }

    mailboxInflight = getJson('/api/mailboxes')
      .then((result) => {
        mailboxCache = result;
        mailboxRequestedAt = Date.now();
        return result;
      })
      .finally(() => {
        mailboxInflight = null;
      });

    return mailboxInflight;
  }

  return {
    async enter(entryCode) {
      const result = await postJson('/api/enter', { entryCode });
      if (result?.ok && result.phase === 'PHASE_2') {
        // Start mailbox fetch early to cut phase2 perceived wait.
        void fetchMailboxes().catch(() => null);
      }
      return result;
    },
    async submitLetter(payload) {
      return postJson('/api/letters', payload);
    },
    async getMailboxes() {
      if (mailboxCache && Date.now() - mailboxRequestedAt < MAILBOX_CACHE_TTL_MS) {
        return mailboxCache;
      }
      return fetchMailboxes();
    },
    async getLetter(letterId) {
      return getJson(`/api/letters/${letterId}`);
    },
    async createComment(letterId, payload) {
      return postJson('/api/comments', { letter_id: letterId, ...payload });
    }
  };
}

export function createApiClient() {
  const runtimeFlag = typeof window !== 'undefined' ? window.__DABDA_USE_REAL_API__ : undefined;
  const query = typeof window !== 'undefined' ? new URLSearchParams(window.location.search || '') : null;
  const queryMode = query ? String(query.get('apiMode') || '').toLowerCase() : '';
  const queryBase = query ? String(query.get('apiBase') || '').trim() : '';
  const runtimeBase =
    typeof window !== 'undefined' && typeof window.__DABDA_API_BASE_URL__ === 'string'
      ? window.__DABDA_API_BASE_URL__.trim()
      : '';
  const isLocal =
    typeof window !== 'undefined' &&
    (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost');
  const useReal =
    queryMode === 'real' ? true : queryMode === 'mock' ? false : runtimeFlag !== false && (runtimeFlag === true || !isLocal);
  const baseUrl = runtimeBase || queryBase;

  return useReal ? realApi(baseUrl) : mockApi();
}
