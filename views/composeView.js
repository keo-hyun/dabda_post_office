export function renderComposeView(container, state, handlers) {
  const disabled = state.loading ? 'disabled' : '';
  container.innerHTML = `
    <section class="card">
      <p class="eyebrow">PHASE 1</p>
      <h2>편지 보내기</h2>
      <form id="composeForm" class="stack">
        <div class="letter-paper-stage compose-paper">
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
              <label for="letterNickname" class="sr-only">작성자</label>
              <input id="letterNickname" class="compose-author-input" required ${disabled} placeholder="작성자" />
            </div>
          </div>
          <label for="letterContent" class="sr-only">편지 내용</label>
          <textarea
            id="letterContent"
            class="letter-paper-content"
            maxlength="1000"
            required
            ${disabled}
            placeholder="이곳에 편지를 작성해 주세요."
          ></textarea>
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
