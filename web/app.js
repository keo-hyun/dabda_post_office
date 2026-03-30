import { createApiClient } from './api.js';
import { startLoopingAudio } from './audio.js';
import { initialState, reduceAppState } from './state.js';
import { renderComposeView } from './views/composeView.js';
import { renderEntryView } from './views/entryView.js';
import { renderLetterView } from './views/letterView.js';
import { renderMailboxView } from './views/mailboxView.js';
import { renderTransitionView } from './views/transitionView.js';

const ENTRY_SESSION_KEY = 'dabda-post-office-entry-phase';
const APP_HISTORY_KEY = 'dabda-post-office-history';
const api = createApiClient();
const root = document.getElementById('app');
let state = { ...initialState };
startLoopingAudio();

function getSessionStorage() {
  try {
    return window.sessionStorage;
  } catch (error) {
    return null;
  }
}

function persistEntryPhase(phase) {
  const storage = getSessionStorage();
  if (!storage) return;

  if (phase === 'PHASE_2') {
    storage.setItem(ENTRY_SESSION_KEY, phase);
    return;
  }

  storage.removeItem(ENTRY_SESSION_KEY);
}

function readPersistedEntryPhase() {
  const storage = getSessionStorage();
  if (!storage) return '';
  return String(storage.getItem(ENTRY_SESSION_KEY) || '');
}

function getHistoryState() {
  if (typeof window === 'undefined' || !window.history) {
    return null;
  }

  return window.history.state || null;
}

function replaceAppHistory(screen, options = {}) {
  if (typeof window === 'undefined' || !window.history?.replaceState) {
    return;
  }

  const nextState = {
    [APP_HISTORY_KEY]: true,
    screen,
    letterId: options.letterId || ''
  };

  window.history.replaceState(nextState, '', window.location.href);
}

function pushAppHistory(screen, options = {}) {
  if (typeof window === 'undefined' || !window.history?.pushState) {
    return;
  }

  const nextState = {
    [APP_HISTORY_KEY]: true,
    screen,
    letterId: options.letterId || ''
  };

  window.history.pushState(nextState, '', window.location.href);
}

function dispatch(action) {
  state = reduceAppState(state, action);
  render();
}

function updateEntryCode(value) {
  state = reduceAppState(state, { type: 'SET_ENTRY_CODE', value });
}

async function loadMailbox() {
  dispatch({ type: 'REQUEST_START' });
  try {
    const result = await api.getMailboxes();
    if (!result.ok) {
      throw new Error(result.message || '우체통을 불러오지 못했어요.');
    }
    dispatch({ type: 'MAILBOX_LOADED', letters: result.letters });
    dispatch({ type: 'REQUEST_SUCCESS' });
    replaceAppHistory('MAILBOX');

    const letters = Array.isArray(result.letters) ? result.letters : [];
    letters.slice(0, 6).forEach((letter) => {
      const letterId = String(letter?.letter_id || '');
      if (!letterId || typeof api.prefetchLetter !== 'function') return;
      void api.prefetchLetter(letterId).catch(() => null);
    });
  } catch (error) {
    dispatch({ type: 'REQUEST_ERROR', message: error.message });
  }
}

async function openLetter(letterOrId, options = {}) {
  const letterId =
    typeof letterOrId === 'string' ? letterOrId : letterOrId && letterOrId.letter_id ? String(letterOrId.letter_id) : '';
  if (!letterId) return;
  const syncHistory = options.syncHistory !== false;

  const previewLetter =
    (letterOrId && typeof letterOrId === 'object' ? letterOrId : null) ||
    state.letters.find((item) => String(item.letter_id) === letterId) ||
    (state.selectedLetterId === letterId ? state.selectedLetter : null);

  if (syncHistory) {
    pushAppHistory('LETTER', { letterId });
  }

  dispatch({ type: 'OPEN_LETTER', letterId, letter: previewLetter });
  dispatch({ type: 'REQUEST_START' });
  try {
    const result = await api.getLetter(letterId);
    if (!result.ok) {
      throw new Error(result.message || '편지를 불러오지 못했어요.');
    }
    dispatch({ type: 'LETTER_LOADED', letter: result.letter });
    dispatch({ type: 'REQUEST_SUCCESS' });
  } catch (error) {
    dispatch({ type: 'REQUEST_ERROR', message: error.message });
  }
}

async function submitComment(payload) {
  if (!state.selectedLetterId) return;
  dispatch({ type: 'REQUEST_START' });
  try {
    const result = await api.createComment(state.selectedLetterId, payload);
    if (!result.ok) {
      throw new Error(result.message || '댓글 저장에 실패했어요.');
    }
    if (result.comment) {
      dispatch({ type: 'COMMENT_ADDED', comment: result.comment });
    }
    dispatch({ type: 'REQUEST_SUCCESS', message: '댓글을 저장했어요.' });
  } catch (error) {
    dispatch({ type: 'REQUEST_ERROR', message: error.message });
  }
}

async function onEnter(entryCode) {
  dispatch({ type: 'REQUEST_START' });
  try {
    const result = await api.enter(entryCode);
    if (!result.ok) {
      dispatch({ type: 'AUTH_ERROR', message: result.message });
      return;
    }

    dispatch({ type: 'AUTH_OK', phase: result.phase });
    persistEntryPhase(result.phase);

    if (result.phase === 'PHASE_2') {
      await loadMailbox();
      return;
    }
    dispatch({ type: 'REQUEST_SUCCESS' });
  } catch (error) {
    dispatch({ type: 'REQUEST_ERROR', message: error.message });
  }
}

async function onSubmitLetter(payload) {
  dispatch({ type: 'REQUEST_START' });
  try {
    const result = await api.submitLetter(payload);
    if (!result.ok) {
      throw new Error(result.message || '편지 저장에 실패했어요.');
    }
    dispatch({ type: 'REQUEST_SUCCESS', message: '편지를 전송했어요.' });
    dispatch({ type: 'SHOW_TRANSITION' });
  } catch (error) {
    dispatch({ type: 'REQUEST_ERROR', message: error.message });
  }
}

function backToMailbox() {
  const currentHistory = getHistoryState();

  if (currentHistory?.[APP_HISTORY_KEY] && currentHistory.screen === 'LETTER' && typeof window !== 'undefined' && window.history?.back) {
    window.history.back();
    return;
  }

  dispatch({ type: 'BACK_TO_MAILBOX' });
  replaceAppHistory('MAILBOX');
}

function handlePopState(event) {
  const nextState = event.state || null;
  if (!nextState?.[APP_HISTORY_KEY]) {
    return;
  }

  if (nextState.screen === 'MAILBOX') {
    dispatch({ type: 'BACK_TO_MAILBOX' });
    if (!Array.isArray(state.letters) || state.letters.length === 0) {
      void loadMailbox();
    }
    return;
  }

  if (nextState.screen === 'LETTER' && nextState.letterId) {
    void openLetter(nextState.letterId, { syncHistory: false });
  }
}

function render() {
  if (!root) return;
  const shouldRestoreEntryFocus = document.activeElement?.id === 'entryCode';

  if (state.screen === 'ENTRY') {
    renderEntryView(root, state, {
      onEntryCodeChange: updateEntryCode,
      onEnter
    }, {
      restoreInputFocus: shouldRestoreEntryFocus
    });
    return;
  }

  if (state.screen === 'COMPOSE') {
    renderComposeView(root, state, { onSubmitLetter });
    return;
  }

  if (state.screen === 'TRANSITION') {
    renderTransitionView(root);
    return;
  }

  if (state.screen === 'MAILBOX') {
    renderMailboxView(root, state, { onOpenLetter: openLetter });
    return;
  }

  if (state.screen === 'LETTER') {
    renderLetterView(root, state, {
      onBack: backToMailbox,
      onSubmitComment: submitComment
    });
  }
}

async function bootstrap() {
  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', handlePopState);
  }

  if (typeof api.warmup === 'function') {
    void api.warmup().catch(() => null);
  }

  const persistedPhase = readPersistedEntryPhase();
  if (persistedPhase === 'PHASE_2') {
    dispatch({ type: 'AUTH_OK', phase: 'PHASE_2' });
    await loadMailbox();
    return;
  }

  replaceAppHistory('ENTRY');
  render();
}

void bootstrap();
