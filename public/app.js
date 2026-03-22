const form = document.getElementById('chatForm');
const input = document.getElementById('questionInput');
const sendBtn = document.getElementById('sendBtn');
const chat = document.getElementById('chat');
const excelInput = document.getElementById('excelInput');
const fileName = document.getElementById('fileName');

const history = [];
let lastExcelContext = null;
let isSending = false;

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function autoResize() {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 180) + 'px';
}

function toHtmlText(text) {
  return escapeHtml(text).replace(/\n/g, '<br>');
}

function scrollChatToBottom() {
  const container = document.querySelector('.chat-wrap');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
  chat.scrollTop = chat.scrollHeight;
}

function addMessage(text, role = 'bot', isHtml = false) {
  const article = document.createElement('article');
  article.className = `message ${role}`;
  article.innerHTML = `
    <div class="avatar">${role === 'bot' ? 'F' : 'B'}</div>
    <div class="bubble">${isHtml ? text : toHtmlText(text)}</div>
  `;
  chat.appendChild(article);
  article.scrollIntoView({ behavior: 'smooth', block: 'end' });
  scrollChatToBottom();
  return article;
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function typeBotMessage(text) {
  const article = document.createElement('article');
  article.className = 'message bot';
  article.innerHTML = `
    <div class="avatar">F</div>
    <div class="bubble typing-bubble"><span class="typed-text"></span><span class="caret"></span></div>
  `;
  chat.appendChild(article);
  const bubble = article.querySelector('.bubble');
  const typedText = article.querySelector('.typed-text');

  const content = String(text || '');
  const total = content.length;
  const baseDelay = total > 900 ? 4 : total > 500 ? 6 : 10;

  for (let i = 0; i < total; i += 1) {
    typedText.innerHTML = toHtmlText(content.slice(0, i + 1));
    if (i % 4 === 0 || i === total - 1) {
      article.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
    const ch = content[i];
    const delay = /[,.!?;:\n]/.test(ch) ? baseDelay * 6 : baseDelay;
    await wait(delay);
  }

  bubble.classList.remove('typing-bubble');
  const caret = article.querySelector('.caret');
  if (caret) caret.remove();
  article.scrollIntoView({ behavior: 'smooth', block: 'end' });
  scrollChatToBottom();
  return article;
}

function addTyping() {
  return addMessage(`
    <div class="typing-wrap">
      <span>Finiip đang suy nghĩ, vui lòng đợi khoảng 5 giây</span>
      <div class="typing-dots"><span></span><span></span><span></span></div>
    </div>
  `, 'bot', true);
}

function renderFlaggedRows(items = []) {
  if (!items.length) return '';
  const rows = items.slice(0, 10).map(item => `
    <tr>
      <td>${escapeHtml(item.rowNumber || '')}</td>
      <td><span class="flag ${escapeHtml(item.level || '')}">${escapeHtml(item.level || '')}</span></td>
      <td>${escapeHtml(item.message || '')}</td>
      <td>${escapeHtml(item.suggestedFix || '')}</td>
    </tr>
  `).join('');
  return `
    <h4>Dòng cần rà soát</h4>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Dòng</th><th>Mức độ</th><th>Vấn đề</th><th>Gợi ý sửa</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderCleanedSample(data) {
  const headers = data.cleanedHeaders || [];
  const rows = data.cleanedSample || [];
  if (!headers.length || !rows.length) return '';
  const thead = headers.map(h => `<th>${escapeHtml(h)}</th>`).join('');
  const tbody = rows.map(row => `<tr>${headers.map(h => `<td>${escapeHtml(row[h] ?? '')}</td>`).join('')}</tr>`).join('');
  return `
    <h4>Mẫu dữ liệu sạch</h4>
    <div class="table-wrap">
      <table>
        <thead><tr>${thead}</tr></thead>
        <tbody>${tbody}</tbody>
      </table>
    </div>
  `;
}

function renderExcelResult(data) {
  const insightRows = (data.insights || []).map(item => `
    <li><strong>${escapeHtml(item.name)}</strong>: tổng gần đúng ${Number(item.total || 0).toLocaleString('vi-VN')} trên ${item.rows} dòng</li>
  `).join('');

  return `
    <p>${escapeHtml(data.answer || '')}</p>
    <div class="stats-grid">
      <div class="stat"><span>Số dòng</span><strong>${data.rowCount || 0}</strong></div>
      <div class="stat"><span>Bút toán hợp lệ</span><strong>${data.entryCount || 0}</strong></div>
      <div class="stat"><span>Vấn đề gốc</span><strong>${data.issueCount || 0}</strong></div>
      <div class="stat"><span>Dòng gắn cờ</span><strong>${(data.flaggedRows || []).length}</strong></div>
    </div>
    ${insightRows ? `<ul>${insightRows}</ul>` : ''}
    ${renderFlaggedRows(data.flaggedRows)}
    ${renderCleanedSample(data)}
    ${data.downloadUrl ? `<p><a class="download-link" href="${data.downloadUrl}" target="_blank">Tải file sạch đã export</a></p>` : ''}
  `;
}

async function uploadExcel(file) {
  addMessage(`Mình muốn Finiip soát file này: ${file.name}`, 'user');
  const typing = addTyping();
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await fetch('/api/analyze-excel', { method: 'POST', body: formData });
    const data = await response.json();
    typing.remove();
    if (!response.ok || data.ok === false) throw new Error(data.error || 'Không phân tích được file.');
    lastExcelContext = data;
    addMessage(renderExcelResult(data), 'bot', true);
    history.push({ role: 'assistant', content: `${data.answer}\nDòng gắn cờ: ${(data.flaggedRows || []).length}.` });
  } catch (error) {
    typing.remove();
    addMessage(error.message || 'Không tải file lên được.', 'bot');
  }
}

async function sendMessage() {
  if (isSending) return;
  const question = input.value.trim();
  if (!question) return;

  isSending = true;
  sendBtn.disabled = true;
  addMessage(question, 'user');
  history.push({ role: 'user', content: question });
  input.value = '';
  autoResize();
  const typing = addTyping();

  try {
    const requestPromise = fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        history: history.slice(-12),
        excelContext: lastExcelContext
      })
    });

    const [response] = await Promise.all([requestPromise, wait(5000)]);
    const data = await response.json();
    typing.remove();
    if (!response.ok) throw new Error(data.error || 'Server phản hồi không thành công.');
    const answer = data.answer || 'Mình chưa có phản hồi phù hợp.';
    await typeBotMessage(answer);
    history.push({ role: 'assistant', content: answer });
  } catch (error) {
    typing.remove();
    addMessage(error.message || 'Mình chưa kết nối được tới server. Bạn kiểm tra terminal xem server đã chạy chưa.', 'bot');
  } finally {
    sendBtn.disabled = false;
    isSending = false;
    input.focus();
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  await sendMessage();
});

sendBtn.addEventListener('click', async (event) => {
  event.preventDefault();
  await sendMessage();
});

excelInput.addEventListener('change', () => {
  const file = excelInput.files?.[0];
  fileName.textContent = file ? file.name : 'Chưa chọn file';
  if (file) uploadExcel(file);
});

input.addEventListener('input', autoResize);
input.addEventListener('keydown', async (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    await sendMessage();
  }
});

autoResize();
