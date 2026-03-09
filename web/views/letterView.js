function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderLetterView(container, state, handlers) {
  const letter = state.selectedLetter;
  if (!letter) {
    container.innerHTML = '<section class="card"><p>편지를 불러오는 중입니다.</p></section>';
    return;
  }
  const disabled = state.loading ? 'disabled' : '';

  const comments = (letter.comments || [])
    .map((comment) => `<li><strong>${escapeHtml(comment.nickname)}</strong>: ${escapeHtml(comment.content)}</li>`)
    .join('');

  container.innerHTML = `
    <section class="card">
      <button type="button" class="ghost" id="backToMailbox">목록으로</button>
      <div class="letter-paper-stage letter-read-stage">
        <div class="compose-paper-header">
          <img
            class="compose-dear-image"
            src="./assets/Dear_Hope.png"
            alt="Dear Hope"
            loading="lazy"
            decoding="async"
          />
          <div class="compose-from-group">
            <img
              class="compose-from-image"
              src="./assets/From.png"
              alt="From"
              loading="lazy"
              decoding="async"
            />
            <span class="compose-author-readonly">${escapeHtml(letter.nickname || '익명')}</span>
          </div>
        </div>
        <div class="letter-paper-content letter-paper-content-readonly">${escapeHtml(letter.content)}</div>
      </div>
      <h3>댓글</h3>
      ${state.error ? `<p class="error">${state.error}</p>` : ''}
      ${state.success ? `<p class="success">${state.success}</p>` : ''}
      <ul class="comment-list">${comments || '<li>첫 댓글을 남겨보세요.</li>'}</ul>
      <form id="commentForm" class="stack">
        <label for="commentNickname">작성자</label>
        <input id="commentNickname" required ${disabled} />
        <label for="commentContent">댓글</label>
        <textarea id="commentContent" rows="3" required ${disabled}></textarea>
        <button type="submit" ${disabled}>댓글 남기기</button>
      </form>
    </section>
  `;

  container.querySelector('#backToMailbox').addEventListener('click', handlers.onBack);
  container.querySelector('#commentForm').addEventListener('submit', (event) => {
    event.preventDefault();
    handlers.onSubmitComment({
      nickname: container.querySelector('#commentNickname').value,
      content: container.querySelector('#commentContent').value
    });
  });
}
