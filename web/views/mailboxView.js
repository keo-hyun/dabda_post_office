function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderMailboxView(container, state, handlers) {
  const items = state.letters
    .map(
      (letter) => `
        <li>
          <button type="button" class="mailbox-post-button" data-letter-id="${letter.letter_id}">
            <img class="mailbox-post-image" src="./assets/post.png" alt="우체통" loading="lazy" decoding="async" />
            <span class="mailbox-post-from">
              <strong class="mailbox-post-author">${escapeHtml(letter.nickname || '익명')}</strong>
            </span>
          </button>
        </li>
      `
    )
    .join('');

  container.innerHTML = `
    <section class="card">
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
