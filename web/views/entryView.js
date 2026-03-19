export function renderEntryView(container, state, handlers, options = {}) {
  const disabled = state.loading ? 'disabled' : '';
  const loadingText = state.loading ? '<p class="muted">확인 중...</p>' : '';
  container.innerHTML = `
    <section class="card">
      <p class="eyebrow subtitle">2026 New Single [Dear Hope]</p>
      <h1>Dabda PostOffice</h1>
      <img class="house" src="./assets/house.png" alt="house" />
      <p class="house_text">
        다브다 우체국에 오신 것을 환영합니다.<br />
        당신의 희망씨에게 편지를 전해드릴게요.
      </p>
      <form id="entryForm" class="stack">
        <label for="entryCode">입장 코드</label>
        <input
          id="entryCode"
          name="entryCode"
          value="${state.entryCode || ''}"
          autocomplete="off"
          autocapitalize="none"
          autocorrect="off"
          spellcheck="false"
          inputmode="text"
          ${disabled}
        />
        <button class="enter_btn" type="submit" ${disabled}>입장하기</button>
      </form>
      ${loadingText}
      ${state.error ? `<p class="error">${state.error}</p>` : ''}
      ${state.success ? `<p class="success">${state.success}</p>` : ''}
    </section>
  `;

  const form = container.querySelector('#entryForm');
  const input = container.querySelector('#entryCode');

  input.addEventListener('input', (event) => {
    handlers.onEntryCodeChange(event.target.value);
    container.querySelector('.error')?.remove();
    container.querySelector('.success')?.remove();
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    handlers.onEnter(input.value);
  });

  if (options.restoreInputFocus && !state.loading) {
    input.focus();
    const cursorPosition = input.value.length;
    input.setSelectionRange(cursorPosition, cursorPosition);
  }
}
