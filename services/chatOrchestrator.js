const answerQuestion = require('./answerQuestion');
const { enrichFollowUp } = require('./conversationService');
const { isLlmEnabled, generateLlmReply } = require('./llmService');

function softenLocalAnswer(text) {
  const raw = typeof text === 'string' ? text : String(text || '');
  if (!raw) return 'Mình chưa bắt được ý chính của câu này. Bạn gửi lại theo cách tự nhiên hơn một chút, mình sẽ tách ý và trả lời từng phần.';

  const replacements = [
    [/Bạn cần/gi, 'Bạn chỉ cần'],
    [/Mình hiểu đây là/gi, 'Mình đang hiểu đây là'],
    [/Mình chưa có/gi, 'Mình chưa có sẵn'],
    [/Phát hiện/gi, 'Mình thấy có'],
    [/Lưu ý/gi, 'Mình nhắc nhẹ'],
  ];
  let out = raw;
  for (const [a, b] of replacements) out = out.replace(a, b);
  if (!/[.!?…]$/.test(out.trim())) out += '.';
  return out;
}

async function getChatReply({ question, history = [], excelContext = null }) {
  const enrichedQuestion = enrichFollowUp(question, history);
  const local = answerQuestion(enrichedQuestion);
  const localAnswer = local?.answer || 'Mình chưa có câu trả lời phù hợp.';

  if (isLlmEnabled()) {
    try {
      const answer = await generateLlmReply({ history, userMessage: enrichedQuestion, excelContext: excelContext || local?.excelContext || null });
      return { ...local, answer, mode: 'llm' };
    } catch (error) {
      return {
        ...local,
        answer: `${softenLocalAnswer(localAnswer)}\n\nMình có thử dùng AI nâng cao nhưng hiện kết nối model chưa sẵn sàng, nên mình tạm trả lời bằng chế độ nội bộ của Finiip.`,
        mode: 'fallback-local',
        technicalNote: error.message
      };
    }
  }

  return { ...local, answer: softenLocalAnswer(localAnswer), mode: 'local' };
}

module.exports = { getChatReply };
