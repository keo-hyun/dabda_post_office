import { describe, expect, it } from 'vitest';
import { reduceAppState } from '../../web/state.js';

describe('app state comment handling', () => {
  it('adds posted comment to selected letter immediately', () => {
    const state = {
      screen: 'LETTER',
      selectedLetterId: 'l1',
      selectedLetter: {
        letter_id: 'l1',
        comments: []
      }
    };

    const next = reduceAppState(state, {
      type: 'COMMENT_ADDED',
      comment: {
        comment_id: 'c1',
        nickname: '테스터',
        content: '첫 댓글'
      }
    });

    expect(next.selectedLetter.comments).toHaveLength(1);
    expect(next.selectedLetter.comments[0].comment_id).toBe('c1');
  });

  it('keeps locally added comments when detail reload returns stale list', () => {
    const state = {
      screen: 'LETTER',
      selectedLetterId: 'l1',
      selectedLetter: {
        letter_id: 'l1',
        comments: [
          {
            comment_id: 'c1',
            nickname: '테스터',
            content: '첫 댓글'
          }
        ]
      }
    };

    const next = reduceAppState(state, {
      type: 'LETTER_LOADED',
      letter: {
        letter_id: 'l1',
        comments: []
      }
    });

    expect(next.selectedLetter.comments).toHaveLength(1);
    expect(next.selectedLetter.comments[0].comment_id).toBe('c1');
  });
});
