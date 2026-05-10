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

  let editingMessageId = null; // ID сообщения, которое редактируем

  textarea.addEventListener('input', () => {
    const len = textarea.value.length;
    charCount.textContent = len;
    charCount.style.color = len > 200 ? 'var(--error)' : '';
  });

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
                <div class="message-card" data-id="${msg.message_id}">
                    <div class="message-text">${escapeHtml(msg.message)}</div>
                    <div class="message-meta">
                        <span class="message-id" title="${msg.message_id}">${shortId}</span>
                        <span class="message-time">${time}</span>
                        <div class="message-actions">
                            <button class="action-btn edit-btn" data-id="${msg.message_id}" data-text="${escapeHtml(msg.message)}" title="Редактировать">
                                ✏️
                            </button>
                            <button class="action-btn delete-btn" data-id="${msg.message_id}" title="Удалить">
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            `;
    }).join('');
    messagesContainer.innerHTML = html;

    // Навешиваем обработчики на кнопки
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteMessage(btn.dataset.id));
    });
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => startEdit(btn.dataset.id, btn.dataset.text));
    });
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

  async function deleteMessage(id) {
    if (!confirm('Удалить это сообщение?')) return;
    try {
      await apiClient.delete(`/messages/${id}`);
      sendStatus.textContent = 'Сообщение удалено';
      sendStatus.className = 'status-message success';
      await loadMessages();
    } catch (error) {
      sendStatus.textContent = `Ошибка удаления: ${error.message}`;
      sendStatus.className = 'status-message error';
    }
  }

  function startEdit(id, text) {
    editingMessageId = id;
    textarea.value = text;
    textarea.focus();
    charCount.textContent = text.length;
    btnText.textContent = 'Сохранить';
    sendBtn.style.background = 'var(--primary)'; // фиолетовый
    sendStatus.textContent = `Редактирование сообщения...`;
    sendStatus.className = 'status-message';
  }

  function cancelEdit() {
    editingMessageId = null;
    textarea.value = '';
    charCount.textContent = '0';
    btnText.textContent = 'Отправить';
    sendBtn.style.background = '';
    sendStatus.textContent = '';
  }

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
      if (editingMessageId) {
        // Режим редактирования
        await apiClient.patch(`/messages/${editingMessageId}`, { message: text });
        sendStatus.textContent = 'Сообщение обновлено!';
      } else {
        // Режим создания
        await apiClient.post('/messages', { message: text });
        sendStatus.textContent = 'Сообщение отправлено!';
      }
      sendStatus.className = 'status-message success';
      cancelEdit();
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

  refreshBtn.addEventListener('click', () => {
    cancelEdit();
    loadMessages();
  });

  loadMessages();
});