import { describe, expect, it } from 'vitest';
import { createCommentRoute } from '../../apps-script/routes/comments.js';
import { createLetterRoute } from '../../apps-script/routes/letters.js';

describe('author-only submission policy', () => {
  it('requires author for letter creation', () => {
    const missingAuthor = createLetterRoute({
      content: '내용',
      visibility: 'PUBLIC'
    });

    expect(missingAuthor.ok).toBe(false);

    const withAuthor = createLetterRoute({
      nickname: '작성자',
      content: '내용',
      visibility: 'PUBLIC'
    });

    expect(withAuthor.ok).toBe(true);
    expect(withAuthor.letter.nickname).toBe('작성자');
  });

  it('creates comment without password when author exists', () => {
    const result = createCommentRoute({
      letter_id: 'l_1',
      nickname: '작성자',
      content: '댓글'
    });

    expect(result.ok).toBe(true);
    expect(result.comment.nickname).toBe('작성자');
  });
});
