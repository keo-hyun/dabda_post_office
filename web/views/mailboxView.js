export function renderMailboxView(container, state, handlers) {
  const items = state.letters
    .map(
      (letter) => `
        <li>
          <button type="button" class="letter-button" data-letter-id="${letter.letter_id}">
            <strong>${letter.nickname}</strong>
            <span>${letter.content.slice(0, 60)}</span>
          </button>
        </li>
      `
    )
    .join('');

  container.innerHTML = `
    <section class="card">
      <p class="eyebrow">PHASE 2</p>
      <h2>우체통 둘러보기</h2>
      ${state.loading ? '<p class="muted">우체통을 불러오는 중...</p>' : ''}
      ${state.error ? `<p class="error">${state.error}</p>` : ''}
      <ul class="mailbox-list">${items || '<li>아직 공개된 편지가 없어요.</li>'}</ul>
    </section>
  `;

  container.querySelectorAll('[data-letter-id]').forEach((button) => {
    button.addEventListener('click', () => handlers.onOpenLetter(button.dataset.letterId));
  });
}
