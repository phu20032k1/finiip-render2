const { getAccount } = require('./coa');

function ensureAccount(code) {
  const account = getAccount(code);
  if (!account) throw new Error(`Tài khoản ${code} không tồn tại trong hệ thống.`);
  return account;
}

function toLine(code, amount) {
  const account = ensureAccount(code);
  if (!(amount > 0)) throw new Error('Số tiền phải lớn hơn 0.');
  return { code: account.code, name: account.name, amount };
}

function createEntry(debitAccount, creditAccount, amount, description = '', meta = {}) {
  return createCompoundEntry({
    description,
    debits: [{ code: debitAccount, amount }],
    credits: [{ code: creditAccount, amount }],
    meta
  });
}

function createCompoundEntry({ description = '', debits = [], credits = [], meta = {} }) {
  const debitLines = debits.map(item => toLine(item.code, item.amount));
  const creditLines = credits.map(item => toLine(item.code, item.amount));
  const debitTotal = debitLines.reduce((sum, item) => sum + item.amount, 0);
  const creditTotal = creditLines.reduce((sum, item) => sum + item.amount, 0);

  if (Math.abs(debitTotal - creditTotal) > 1) {
    throw new Error(`Bút toán không cân: Nợ ${debitTotal.toLocaleString('vi-VN')} khác Có ${creditTotal.toLocaleString('vi-VN')}.`);
  }

  return {
    description,
    debits: debitLines,
    credits: creditLines,
    debitTotal,
    creditTotal,
    meta: {
      date: meta.date || '',
      documentNo: meta.documentNo || '',
      rowNumber: meta.rowNumber || '',
      source: meta.source || ''
    }
  };
}

function formatEntry(entry) {
  const lines = ['📘 Bút toán'];
  if (entry.meta?.date || entry.meta?.documentNo) {
    lines.push(`- Chứng từ: ${entry.meta?.documentNo || '-'} | Ngày: ${entry.meta?.date || '-'}`);
  }
  if (entry.description) lines.push(`- Nghiệp vụ: ${entry.description}`);
  lines.push('- Dòng hạch toán:');
  entry.debits.forEach((line, index) => lines.push(`  ${index + 1}. Nợ ${line.code} - ${line.name}: ${line.amount.toLocaleString('vi-VN')} đồng`));
  entry.credits.forEach((line, index) => lines.push(`  ${index + 1}. Có ${line.code} - ${line.name}: ${line.amount.toLocaleString('vi-VN')} đồng`));
  lines.push(`- Tổng Nợ = Tổng Có = ${entry.debitTotal.toLocaleString('vi-VN')} đồng`);
  return lines.join('\n');
}

module.exports = { createEntry, createCompoundEntry, formatEntry };
