export function renderComposeView(container, state, handlers) {
  const disabled = state.loading ? 'disabled' : '';
  container.innerHTML = `
    <section class="card">
      <p class="eyebrow">PHASE 1</p>
      <h2>편지 보내기</h2>
      <form id="composeForm" class="stack">
        <div class="letter-paper-stage">
          <img
            class="letter-paper-image"
            src="./assets/letter-paper.png"
            alt="편지지"
            loading="lazy"
            decoding="async"
          />
          <div class="letter-paper-overlay">
            <label for="letterNickname" class="sr-only">작성자</label>
            <input id="letterNickname" class="letter-paper-nickname" required ${disabled} placeholder="작성자" />
            <label for="letterContent" class="sr-only">편지 내용</label>
            <textarea id="letterContent" class="letter-paper-content" maxlength="1000" required ${disabled} placeholder="이곳에 편지를 작성해 주세요."></textarea>
          </div>
        </div>
        <label for="letterVisibility">공개 설정</label>
        <select id="letterVisibility" ${disabled}>
          <option value="PUBLIC">공개</option>
          <option value="PRIVATE">비공개</option>
        </select>
        <button type="submit" ${disabled}>우체통에 넣기</button>
      </form>
      ${state.loading ? '<p class="muted">편지를 전송하고 있어요...</p>' : ''}
      ${state.error ? `<p class="error">${state.error}</p>` : ''}
      ${state.success ? `<p class="success">${state.success}</p>` : ''}
    </section>
  `;

  container.querySelector('#composeForm').addEventListener('submit', (event) => {
    event.preventDefault();
    handlers.onSubmitLetter({
      nickname: container.querySelector('#letterNickname').value,
      content: container.querySelector('#letterContent').value,
      visibility: container.querySelector('#letterVisibility').value
    });
  });
}
