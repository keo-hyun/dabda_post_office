export function renderComposeView(container, handlers) {
  container.innerHTML = `
    <section class="card">
      <p class="eyebrow">PHASE 1</p>
      <h2>편지 보내기</h2>
      <form id="composeForm" class="stack">
        <label for="letterContent">편지 내용</label>
        <textarea id="letterContent" maxlength="1000" rows="7" required></textarea>
        <label for="letterVisibility">공개 설정</label>
        <select id="letterVisibility">
          <option value="PUBLIC">공개</option>
          <option value="PRIVATE">비공개</option>
        </select>
        <button type="submit">우체통에 넣기</button>
      </form>
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
