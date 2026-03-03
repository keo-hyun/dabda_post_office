export function renderEntryView(container, state, handlers) {
  container.innerHTML = `
    <section class="card">
      <p class="eyebrow">DABDA POST OFFICE 2026</p>
      <h1>입장 코드를 입력해 우체국 문을 열어주세요.</h1>
      <form id="entryForm" class="stack">
        <label for="entryCode">입장 코드</label>
        <input id="entryCode" name="entryCode" value="${state.entryCode || ''}" autocomplete="off" />
        <button type="submit">입장하기</button>
      </form>
      ${state.error ? `<p class="error">${state.error}</p>` : ''}
    </section>
  `;

  const form = container.querySelector('#entryForm');
  const input = container.querySelector('#entryCode');

  input.addEventListener('input', (event) => handlers.onEntryCodeChange(event.target.value));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    handlers.onEnter(input.value);
  });
}
