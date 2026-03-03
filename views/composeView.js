export function renderComposeView(container, state, handlers) {
  const disabled = state.loading ? 'disabled' : '';
  container.innerHTML = `
    <section class="card">
      <p class="eyebrow">PHASE 1</p>
      <h2>편지 보내기</h2>
      <form id="composeForm" class="stack">
        <label for="letterContent">편지 내용</label>
        <textarea id="letterContent" maxlength="1000" rows="7" required ${disabled}></textarea>
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
      content: container.querySelector('#letterContent').value,
      visibility: container.querySelector('#letterVisibility').value
    });
  });
}
