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
      const comment = {
        comment_id: `comment-${Date.now()}`,
        nickname: payload.nickname || '방문자',
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

  function postJson(path, payload) {
    return requestJson(resolveApiUrl(baseUrl, path), {
      method: 'POST',
      headers: postHeaders,
      body: JSON.stringify(payload)
    });
  }

  return {
    async enter(entryCode) {
      return postJson('/api/enter', { entryCode });
    },
    async submitLetter(payload) {
      return postJson('/api/letters', payload);
    },
    async getMailboxes() {
      return requestJson(resolveApiUrl(baseUrl, '/api/mailboxes'));
    },
    async getLetter(letterId) {
      return requestJson(resolveApiUrl(baseUrl, `/api/letters/${letterId}`));
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
