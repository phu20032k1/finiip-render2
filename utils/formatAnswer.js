function formatTutorAnswer({
  title,
  definition,
  explanation,
  formula,
  example,
  note,
  result,
  steps
}) {
  const parts = [];

  if (title) parts.push(`📘 ${title}`);
  if (definition) parts.push(`- Định nghĩa: ${definition}`);
  if (explanation) parts.push(`- Giải thích: ${explanation}`);
  if (formula) parts.push(`- Công thức: ${formula}`);
  if (steps) parts.push(`- Cách tính: ${steps}`);
  if (result) parts.push(`- Kết quả: ${result}`);
  if (example) parts.push(`- Ví dụ: ${example}`);
  if (note) parts.push(`- Ghi chú: ${note}`);

  return parts.join("\n");
}

module.exports = formatTutorAnswer;