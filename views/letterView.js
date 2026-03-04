export function renderLetterView(container, state, handlers) {
  const letter = state.selectedLetter;
  if (!letter) {
    container.innerHTML = '<section class="card"><p>편지를 불러오는 중입니다.</p></section>';
    return;
  }
  const disabled = state.loading ? 'disabled' : '';

  const comments = (letter.comments || [])
    .map((comment) => `<li><strong>${comment.nickname}</strong>: ${comment.content}</li>`)
    .join('');

  container.innerHTML = `
    <section class="card">
      <button type="button" class="ghost" id="backToMailbox">목록으로</button>
      <h2>${letter.nickname} 님의 편지</h2>
      <p class="letter-content">${letter.content}</p>
      <h3>댓글</h3>
      ${state.error ? `<p class="error">${state.error}</p>` : ''}
      ${state.success ? `<p class="success">${state.success}</p>` : ''}
      <ul class="comment-list">${comments || '<li>첫 댓글을 남겨보세요.</li>'}</ul>
      <form id="commentForm" class="stack">
        <label for="commentNickname">닉네임</label>
        <input id="commentNickname" required ${disabled} />
        <label for="commentPassword">댓글 비밀번호</label>
        <input id="commentPassword" type="password" required ${disabled} />
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
      password: container.querySelector('#commentPassword').value,
      content: container.querySelector('#commentContent').value
    });
  });
}
