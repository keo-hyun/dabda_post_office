import { createApiClient } from './api.js';
import { initialState, reduceAppState } from './state.js';
import { renderComposeView } from './views/composeView.js';
import { renderEntryView } from './views/entryView.js';
import { renderLetterView } from './views/letterView.js';
import { renderMailboxView } from './views/mailboxView.js';
import { renderTransitionView } from './views/transitionView.js';

const api = createApiClient();
const root = document.getElementById('app');
let state = { ...initialState };

function dispatch(action) {
  state = reduceAppState(state, action);
  render();
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
  } catch (error) {
    dispatch({ type: 'REQUEST_ERROR', message: error.message });
  }
}

async function openLetter(letterId) {
  dispatch({ type: 'OPEN_LETTER', letterId });
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
    dispatch({ type: 'REQUEST_SUCCESS', message: '댓글을 저장했어요.' });
    await openLetter(state.selectedLetterId);
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

function render() {
  if (!root) return;
  const shouldRestoreEntryFocus = document.activeElement?.id === 'entryCode';

  if (state.screen === 'ENTRY') {
    renderEntryView(root, state, {
      onEntryCodeChange: (value) => dispatch({ type: 'SET_ENTRY_CODE', value }),
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
      onBack: () => dispatch({ type: 'BACK_TO_MAILBOX' }),
      onSubmitComment: submitComment
    });
  }
}

render();
