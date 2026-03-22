function formatCurrency(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return String(value);
  return value.toLocaleString("vi-VN");
}

function stepFormatter({
  title,
  question,
  formula,
  inputs = [],
  steps = [],
  result,
  note
}) {
  const lines = [];

  if (title) lines.push(`📘 ${title}`);
  if (question) lines.push(`- Bài toán: ${question}`);
  if (formula) lines.push(`- Công thức: ${formula}`);

  if (inputs.length) {
    lines.push(`- Dữ kiện:`);
    for (const item of inputs) {
      lines.push(`  + ${item.label}: ${item.value}`);
    }
  }

  if (steps.length) {
    lines.push(`- Các bước tính:`);
    steps.forEach((step, index) => {
      lines.push(`  ${index + 1}. ${step}`);
    });
  }

  if (result) lines.push(`- Kết quả: ${result}`);
  if (note) lines.push(`- Ghi chú: ${note}`);

  return lines.join("\n");
}

module.exports = {
  stepFormatter,
  formatCurrency
};