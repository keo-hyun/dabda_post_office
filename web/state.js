export const initialState = {
  screen: 'ENTRY',
  phase: 'CLOSED',
  entryCode: '',
  error: '',
  success: '',
  loading: false,
  letters: [],
  commentCacheByLetter: {},
  selectedLetterId: '',
  selectedLetter: null
};

function screenFromPhase(phase) {
  if (phase === 'PHASE_1') return 'COMPOSE';
  if (phase === 'TRANSITION') return 'TRANSITION';
  if (phase === 'PHASE_2') return 'MAILBOX';
  return 'ENTRY';
}

function mergeComments(...commentLists) {
  const merged = new Map();
  commentLists.forEach((comments, listIndex) => {
    const safeList = Array.isArray(comments) ? comments : [];
    safeList.forEach((comment, index) => {
      const key = String(comment?.comment_id || `list-${listIndex}-${index}`);
      merged.set(key, comment);
    });
  });

  return Array.from(merged.values());
}

export function reduceAppState(state, action) {
  switch (action.type) {
    case 'SET_ENTRY_CODE':
      return { ...state, entryCode: action.value, error: '' };
    case 'REQUEST_START':
      return { ...state, loading: true, error: '', success: '' };
    case 'REQUEST_SUCCESS':
      return { ...state, loading: false, success: action.message || '' };
    case 'REQUEST_ERROR':
      return { ...state, loading: false, error: action.message || '요청 처리 중 오류가 발생했어요.' };
    case 'AUTH_OK':
      return {
        ...state,
        phase: action.phase,
        screen: screenFromPhase(action.phase),
        error: '',
        success: '',
        loading: false
      };
    case 'AUTH_ERROR':
      return { ...state, loading: false, error: action.message || '입장에 실패했어요.' };
    case 'MAILBOX_LOADED':
      return { ...state, letters: action.letters || [], screen: 'MAILBOX', error: '' };
    case 'OPEN_LETTER':
      return {
        ...state,
        screen: 'LETTER',
        selectedLetterId: action.letterId,
        selectedLetter: action.letter || null,
        error: ''
      };
    case 'LETTER_LOADED':
      if (!action.letter) {
        return { ...state, screen: 'LETTER', selectedLetter: null, error: '' };
      }
      var letterId = String(action.letter.letter_id || '');
      var cachedComments = letterId ? state.commentCacheByLetter?.[letterId] : [];
      var mergedComments = mergeComments(cachedComments, state.selectedLetter?.comments, action.letter.comments);
      return {
        ...state,
        screen: 'LETTER',
        selectedLetter: {
          ...action.letter,
          comments: mergedComments
        },
        commentCacheByLetter: letterId
          ? {
              ...state.commentCacheByLetter,
              [letterId]: mergedComments
            }
          : state.commentCacheByLetter,
        error: ''
      };
    case 'COMMENT_ADDED':
      if (!state.selectedLetter || !action.comment) {
        return state;
      }
      var selectedId = String(state.selectedLetter.letter_id || state.selectedLetterId || '');
      var nextComments = mergeComments(state.selectedLetter.comments, [action.comment]);
      return {
        ...state,
        selectedLetter: {
          ...state.selectedLetter,
          comments: nextComments
        },
        commentCacheByLetter: selectedId
          ? {
              ...state.commentCacheByLetter,
              [selectedId]: nextComments
            }
          : state.commentCacheByLetter
      };
    case 'BACK_TO_MAILBOX':
      return { ...state, screen: 'MAILBOX', selectedLetter: null, selectedLetterId: '', error: '' };
    case 'SHOW_TRANSITION':
      return { ...state, screen: 'TRANSITION', error: '' };
    default:
      return state;
  }
}
