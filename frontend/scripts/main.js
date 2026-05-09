document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('message-form');
  const textarea = document.getElementById('message-text');
  const charCount = document.getElementById('char-count');
  const sendBtn = document.getElementById('send-btn');
  const btnText = sendBtn.querySelector('.btn-text');
  const btnLoader = sendBtn.querySelector('.btn-loader');
  const refreshBtn = document.getElementById('refresh-btn');
  const messagesContainer = document.getElementById('messages-container');
  const sendStatus = document.getElementById('send-status');

  // Обновление счётчика символов
  textarea.addEventListener('input', () => {
    const len = textarea.value.length;
    charCount.textContent = len;
    charCount.style.color = len > 200 ? 'var(--error)' : '';
  });

  // Рендер сообщений
  function renderMessages(messages) {
    if (!messages || messages.length === 0) {
      messagesContainer.innerHTML = '<div class="empty">Нет сообщений. Будь первым!</div>';
      return;
    }

    const sorted = [...messages].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const html = sorted.map(msg => {
      const time = new Date(msg.created_at).toLocaleString('ru-RU');
      const shortId = msg.message_id.substring(0, 8) + '...';
      return `
                <div class="message-card">
                    <div class="message-text">${escapeHtml(msg.message)}</div>
                    <div class="message-meta">
                        <span class="message-id" title="${msg.message_id}">${shortId}</span>
                        <span class="message-time">${time}</span>
                    </div>
                </div>
            `;
    }).join('');
    messagesContainer.innerHTML = html;
  }

  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  // Загрузка сообщений
  async function loadMessages() {
    try {
      messagesContainer.innerHTML = '<div class="loading">Загрузка...</div>';
      const data = await apiClient.get('/messages');
      renderMessages(data);
      sendStatus.textContent = '';
    } catch (error) {
      messagesContainer.innerHTML = '<div class="error-state">⚠️ Ошибка загрузки сообщений</div>';
      console.error(error);
    }
  }

  // Отправка формы
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = textarea.value.trim();
    if (!text || text.length < 3) {
      sendStatus.textContent = 'Минимум 3 символа';
      sendStatus.className = 'status-message error';
      return;
    }

    sendBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';

    try {
      const result = await apiClient.post('/messages', { message: text });
      sendStatus.textContent = result.message || 'Отправлено!';
      sendStatus.className = 'status-message success';
      textarea.value = '';
      charCount.textContent = '0';
      await loadMessages();
    } catch (error) {
      sendStatus.textContent = `Ошибка: ${error.message}`;
      sendStatus.className = 'status-message error';
    } finally {
      sendBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoader.style.display = 'none';
    }
  });

  // Ручное обновление
  refreshBtn.addEventListener('click', loadMessages);

  // Первоначальная загрузка
  loadMessages();
});