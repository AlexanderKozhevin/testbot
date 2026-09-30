(() => {
  'use strict';
  const config = window.DEMO_CONFIG;
  const status = document.querySelector('#connection-status');
  const dot = document.querySelector('#status-dot');
  const retry = document.querySelector('#retry');
  const controls = document.querySelectorAll('[data-open-chat], [data-prompt], #new-test');
  const toast = document.querySelector('#toast');
  const dialog = document.querySelector('#copy-dialog');
  let ready = false;
  let toastTimer;

  function notify(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 7000);
  }
  function openChat() {
    if (!ready || !window.$chatwoot) return;
    window.$chatwoot.toggle('open');
  }
  function failed() {
    if (ready) return;
    status.textContent = 'Чат недоступен. Проверьте соединение и доступ к тестовому контуру.';
    dot.className = 'status-dot error';
    retry.hidden = false;
  }
  retry.addEventListener('click', () => window.location.reload());
  document.querySelector('#new-test').addEventListener('click', () => {
    if (!ready || !window.$chatwoot) return;
    window.$chatwoot.reset();
    openChat();
    notify('Новый тест начат. Предыдущая переписка сохранена в операторской панели.');
  });
  document.querySelectorAll('[data-open-chat]').forEach(button => button.addEventListener('click', openChat));
  document.querySelectorAll('[data-prompt]').forEach(button => {
    button.addEventListener('click', async () => {
      if (!ready) return;
      const message = button.dataset.prompt;
      try {
        await navigator.clipboard.writeText(message);
        openChat();
        notify('Текст скопирован. Вставьте его в поле чата и отправьте.');
      } catch {
        document.querySelector('#copy-text').value = message;
        dialog.showModal();
        document.querySelector('#copy-text').select();
      }
    });
  });
  document.querySelector('#close-copy').addEventListener('click', () => { dialog.close(); openChat(); });
  if (config.agentConnected) document.querySelector('#agent-notice').hidden = true;

  window.chatwootSettings = {
    position: 'right',
    type: 'standard',
    locale: 'ru',
    darkMode: 'light',
  };
  const timeout = setTimeout(failed, 20000);
  window.addEventListener('chatwoot:ready', () => {
    ready = true;
    clearTimeout(timeout);
    status.textContent = 'Виджет готов к диалогу';
    dot.className = 'status-dot connected';
    retry.hidden = true;
    controls.forEach(button => { button.disabled = false; });
  }, { once: true });
  const sdk = document.createElement('script');
  sdk.src = config.baseUrl + '/packs/js/sdk.js';
  sdk.async = true;
  sdk.addEventListener('error', failed);
  sdk.addEventListener('load', () => {
    try {
      window.chatwootSDK.run({ websiteToken: config.websiteToken, baseUrl: config.baseUrl });
    } catch { failed(); }
  });
  document.head.appendChild(sdk);
})();
