const https = require('https');

const SYSTEM_PROMPT = `Bạn là Finiip, AI kế toán nói tiếng Việt tự nhiên, mềm mại, ngắn gọn nhưng hữu ích.\n\nNguyên tắc:\n- Trả lời như người hướng dẫn thân thiện, không cứng nhắc.\n- Khi thiếu dữ liệu, nói rõ thiếu gì, nhưng vẫn gợi ý cách xử lý.\n- Với kế toán, ưu tiên đúng bản chất nghiệp vụ và giải thích ngắn dễ hiểu.\n- Nếu người dùng hỏi tiếp theo dựa trên câu trước, hãy tận dụng ngữ cảnh hội thoại.\n- Nếu có dữ liệu phân tích file Excel kèm theo, hãy dùng nó để nhận xét lỗi, rủi ro và hướng sửa.\n- Không bịa quy định pháp lý cụ thể khi không chắc; hãy nói theo hướng nguyên tắc thực hành an toàn.`;

function isLlmEnabled() {
  return Boolean(process.env.OPENAI_API_KEY);
}

function postJson(url, payload, headers = {}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...headers
      }
    }, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(data || `HTTP ${res.statusCode}`));
        }
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function generateLlmReply({ history = [], userMessage, excelContext = null }) {
  const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
  for (const item of history.slice(-10)) {
    if (!item?.content) continue;
    messages.push({ role: item.role === 'assistant' ? 'assistant' : 'user', content: String(item.content) });
  }
  let content = String(userMessage || '').trim();
  if (excelContext) content += `\n\nNgữ cảnh file Excel đang phân tích:\n${JSON.stringify(excelContext).slice(0, 7000)}`;
  messages.push({ role: 'user', content });

  const data = await postJson('https://api.openai.com/v1/chat/completions', {
    model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    messages,
    temperature: 0.45,
    max_tokens: 900
  }, {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
  });

  const answer = data?.choices?.[0]?.message?.content?.trim();
  if (!answer) throw new Error('LLM_EMPTY_RESPONSE');
  return answer;
}

module.exports = { isLlmEnabled, generateLlmReply };
