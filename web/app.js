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
  const result = await api.getMailboxes();
  if (result.ok) {
    dispatch({ type: 'MAILBOX_LOADED', letters: result.letters });
  }
}

async function openLetter(letterId) {
  dispatch({ type: 'OPEN_LETTER', letterId });
  const result = await api.getLetter(letterId);
  if (result.ok) {
    dispatch({ type: 'LETTER_LOADED', letter: result.letter });
  }
}

async function submitComment(payload) {
  if (!state.selectedLetterId) return;
  const result = await api.createComment(state.selectedLetterId, payload);
  if (result.ok) {
    await openLetter(state.selectedLetterId);
  }
}

async function onEnter(entryCode) {
  const result = await api.enter(entryCode);
  if (!result.ok) {
    dispatch({ type: 'AUTH_ERROR', message: result.message });
    return;
  }

  dispatch({ type: 'AUTH_OK', phase: result.phase });

  if (result.phase === 'PHASE_2') {
    await loadMailbox();
  }
}

async function onSubmitLetter(payload) {
  const result = await api.submitLetter(payload);
  if (result.ok) {
    dispatch({ type: 'SHOW_TRANSITION' });
  }
}

function render() {
  if (!root) return;

  if (state.screen === 'ENTRY') {
    renderEntryView(root, state, {
      onEntryCodeChange: (value) => dispatch({ type: 'SET_ENTRY_CODE', value }),
      onEnter
    });
    return;
  }

  if (state.screen === 'COMPOSE') {
    renderComposeView(root, { onSubmitLetter });
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
