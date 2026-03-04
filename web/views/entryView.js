export function renderEntryView(container, state, handlers, options = {}) {
  const disabled = state.loading ? 'disabled' : '';
  const loadingText = state.loading ? '<p class="muted">확인 중...</p>' : '';
  container.innerHTML = `
    <section class="card">
      <p class="eyebrow">DABDA POST OFFICE 2026</p>
      <h1>입장 코드를 입력해 우체국 문을 열어주세요.</h1>
      <form id="entryForm" class="stack">
        <label for="entryCode">입장 코드</label>
        <input id="entryCode" name="entryCode" value="${state.entryCode || ''}" autocomplete="off" ${disabled} />
        <button type="submit" ${disabled}>입장하기</button>
      </form>
      ${loadingText}
      ${state.error ? `<p class="error">${state.error}</p>` : ''}
      ${state.success ? `<p class="success">${state.success}</p>` : ''}
    </section>
  `;

  const form = container.querySelector('#entryForm');
  const input = container.querySelector('#entryCode');

  input.addEventListener('input', (event) => handlers.onEntryCodeChange(event.target.value));
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
