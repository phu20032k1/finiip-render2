const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { importTransactionsFromFile, parseAmount } = require('./importService');

function isSupported(filePath) {
  return /\.(xlsx|xls|csv|txt|json)$/i.test(filePath || '');
}

function detectNumericColumns(rawRows = []) {
  const stats = {};
  for (const row of rawRows) {
    const map = row.map || {};
    for (const [key, value] of Object.entries(map)) {
      const amount = parseAmount(value);
      const normalized = String(value ?? '').trim();
      if (!normalized) continue;
      const numericLike = /\d/.test(normalized) && amount !== 0;
      if (!stats[key]) stats[key] = { nonEmpty: 0, numericCount: 0, total: 0 };
      stats[key].nonEmpty += 1;
      if (numericLike) {
        stats[key].numericCount += 1;
        stats[key].total += amount;
      }
    }
  }
  return Object.entries(stats)
    .filter(([, s]) => s.numericCount >= Math.max(2, Math.floor(s.nonEmpty * 0.5)))
    .slice(0, 8)
    .map(([name, s]) => ({ name, total: s.total, rows: s.numericCount }));
}

function buildPreview(records = [], limit = 8) {
  return records.slice(0, limit).map(r => ({
    row: r.rowNumber,
    date: r.date,
    documentNo: r.documentNo,
    description: r.description,
    amountHint: r.amountHint,
    object: r.object,
    item: r.item
  }));
}

function detectColumnIssues(headers = [], rawRows = []) {
  const issues = [];
  const normalizedHeaders = headers.map(h => String(h || '').trim());
  const duplicates = normalizedHeaders.filter((h, i) => h && normalizedHeaders.indexOf(h) !== i);
  if (duplicates.length) {
    issues.push({ type: 'duplicate_header', message: `Có cột bị lặp: ${[...new Set(duplicates)].join(', ')}` });
  }

  const rowLengths = rawRows.map(r => (r.cells || []).filter(Boolean).length).filter(Boolean);
  const maxLen = Math.max(0, ...rowLengths);
  rawRows.forEach(r => {
    const len = (r.cells || []).filter(Boolean).length;
    if (maxLen && len < Math.max(2, maxLen - 2)) {
      issues.push({ type: 'short_row', rowNumber: r.rowNumber, message: 'Dòng này có ít cột hơn mặt bằng chung, có thể đang lệch cột.' });
    }
  });

  const amountLike = detectNumericColumns(rawRows);
  return { issues, amountLike };
}

function inferCleanedRows(imported) {
  const headers = imported.headers || [];
  const rawRows = imported.rawRows || [];
  const issues = [];
  const cleaned = [];

  if (imported.importMode === 'paired') {
    const cols = ['row_number', 'date', 'document_no', 'description', 'debit_account', 'credit_account', 'amount', 'status', 'notes'];
    for (const row of rawRows) {
      const map = row.map || {};
      let debit = String(map['tk no'] || map['tai khoan no'] || map['debit account'] || '').match(/\d{3,4}/)?.[0] || '';
      let credit = String(map['tk co'] || map['tai khoan co'] || map['credit account'] || '').match(/\d{3,4}/)?.[0] || '';
      let amount = parseAmount(map['so tien'] || map['amount'] || map['value']);
      const description = map['dien giai'] || map['diễn giải'] || map['mo ta'] || map['description'] || '';
      const notes = [];
      let status = 'ok';

      if (!debit || !credit) {
        status = 'review';
        notes.push('Thiếu tài khoản Nợ hoặc Có.');
      }
      if (!amount) {
        status = 'review';
        notes.push('Thiếu số tiền hoặc số tiền không đọc được.');
      }
      if (amount < 0) {
        amount = Math.abs(amount);
        notes.push('Đã chuẩn hóa số tiền âm thành dương để dễ rà soát.');
        status = status === 'ok' ? 'fixed' : status;
      }

      cleaned.push(cols.reduce((acc, c) => (acc[c] = '', acc), {}));
      const target = cleaned[cleaned.length - 1];
      Object.assign(target, {
        row_number: row.rowNumber,
        date: map['ngay'] || map['date'] || '',
        document_no: map['so ct'] || map['so chung tu'] || map['voucher'] || '',
        description,
        debit_account: debit,
        credit_account: credit,
        amount,
        status,
        notes: notes.join(' ')
      });
      if (status !== 'ok') issues.push({ rowNumber: row.rowNumber, message: notes.join(' ') || 'Cần kiểm tra lại bút toán.' });
    }
    return { headers: cols, rows: cleaned, issues };
  }

  if (imported.importMode === 'lines') {
    const cols = ['row_number', 'date', 'document_no', 'description', 'account', 'side', 'amount', 'status', 'notes'];
    for (const row of rawRows) {
      const map = row.map || {};
      const account = String(map['tai khoan'] || map['tk'] || map['account'] || '').match(/\d{3,4}/)?.[0] || '';
      let side = String(map['ben'] || map['side'] || map['drcr'] || '').trim().toLowerCase();
      let amount = parseAmount(map['so tien'] || map['amount'] || map['value']);
      const description = map['dien giai'] || map['diễn giải'] || map['mo ta'] || map['description'] || '';
      const notes = [];
      let status = 'ok';
      if (/^n[ợo]$|^no$|^debit$|^dr$/.test(side)) {
        side = 'Nợ';
      } else if (/^c[óo]$|^co$|^credit$|^cr$/.test(side)) {
        side = 'Có';
      } else {
        status = 'review';
        notes.push('Chưa nhận diện được bên Nợ/Có.');
      }
      if (!account) {
        status = 'review';
        notes.push('Thiếu tài khoản.');
      }
      if (!amount) {
        status = 'review';
        notes.push('Thiếu số tiền.');
      }
      if (amount < 0) {
        amount = Math.abs(amount);
        status = status === 'ok' ? 'fixed' : status;
        notes.push('Đã đổi số tiền âm sang dương để dễ soát.');
      }
      const target = cols.reduce((acc, c) => (acc[c] = '', acc), {});
      Object.assign(target, {
        row_number: row.rowNumber,
        date: map['ngay'] || map['date'] || '',
        document_no: map['so ct'] || map['so chung tu'] || map['voucher'] || '',
        description,
        account,
        side,
        amount,
        status,
        notes: notes.join(' ')
      });
      cleaned.push(target);
      if (status !== 'ok') issues.push({ rowNumber: row.rowNumber, message: notes.join(' ') || 'Cần kiểm tra.' });
    }
    return { headers: cols, rows: cleaned, issues };
  }

  const cols = ['row_number', 'date', 'document_no', 'description', 'amount_hint', 'object', 'item', 'suggestion'];
  const rows = (imported.records || []).map(r => ({
    row_number: r.rowNumber,
    date: r.date || '',
    document_no: r.documentNo || '',
    description: r.description || '',
    amount_hint: r.amountHint || '',
    object: r.object || '',
    item: r.item || '',
    suggestion: 'Đây là dữ liệu mô tả nghiệp vụ. Bạn nên bổ sung cột TK Nợ, TK Có và Số tiền để Finiip auto soát và làm sạch sâu hơn.'
  }));
  return { headers: cols, rows, issues };
}

function writeWorkbook(payload) {
  const helper = path.join(__dirname, '..', 'scripts', 'xlsx_helper.py');
  const uploadDir = path.join(__dirname, '..', 'uploads');
  fs.mkdirSync(uploadDir, { recursive: true });
  const temp = path.join(uploadDir, `export-${Date.now()}.json`);
  fs.writeFileSync(temp, JSON.stringify(payload), 'utf8');
  const result = spawnSync('python3', [helper, 'write', temp], { encoding: 'utf8' });
  fs.unlinkSync(temp);
  if (result.status !== 0) throw new Error((result.stderr || result.stdout || 'Không ghi được file sạch.').trim());
  return JSON.parse(result.stdout || '{}');
}

function createCleanWorkbook(imported, analysis) {
  const outDir = path.join(__dirname, '..', 'generated_reports');
  fs.mkdirSync(outDir, { recursive: true });
  const output = path.join(outDir, `finiip_cleaned_${Date.now()}.xlsx`);
  const issueRows = (analysis.flaggedRows || []).map(x => [x.rowNumber || '', x.level || '', x.message || '', x.suggestedFix || '']);
  const summaryRows = [
    ['Tên file', imported.fileName],
    ['Sheet', imported.sheetName || ''],
    ['Số dòng dữ liệu', imported.records.length],
    ['Chế độ nhập', imported.importMode],
    ['Số bút toán hợp lệ', imported.templateJournal.entries.length],
    ['Số vấn đề gốc', imported.templateJournal.issues.length],
    ['Số dòng cần rà soát sau khi làm sạch', analysis.flaggedRows.length]
  ];
  const payload = {
    output,
    sheets: [
      { name: 'Tong_quan', rows: [['Chỉ tiêu', 'Giá trị'], ...summaryRows] },
      { name: 'Du_lieu_sach', rows: [analysis.cleaned.headers, ...analysis.cleaned.rows.map(r => analysis.cleaned.headers.map(h => r[h] ?? ''))] },
      { name: 'Can_kiem_tra', rows: [['Dòng', 'Mức độ', 'Vấn đề', 'Gợi ý sửa'], ...issueRows] }
    ]
  };
  return writeWorkbook(payload);
}

function buildNarrative(imported, analysis, columnReview) {
  const pieces = [];
  pieces.push(`Mình đã đọc file **${imported.fileName}**.`);
  if (imported.sheetName) pieces.push(`Sheet đang phân tích là **${imported.sheetName}**.`);
  pieces.push(`Có **${imported.records.length}** dòng dữ liệu và **${imported.headers.length || 0}** cột nhận diện được.`);
  if (imported.importMode === 'paired') {
    pieces.push(`Mình nhận ra đây là mẫu bút toán ghép cặp TK Nợ/TK Có, với **${imported.templateJournal.entries.length}** bút toán hợp lệ.`);
  } else if (imported.importMode === 'lines') {
    pieces.push(`Mình nhận ra đây là mẫu nhật ký theo từng dòng Nợ/Có, với **${imported.templateJournal.entries.length}** chứng từ cân đối được.`);
  } else {
    pieces.push('Dữ liệu hiện giống danh sách nghiệp vụ hơn là mẫu bút toán hoàn chỉnh.');
  }
  if (columnReview.issues.length) {
    pieces.push(`Mình thấy **${columnReview.issues.length}** dấu hiệu lệch cột hoặc trùng tiêu đề.`);
  }
  if (analysis.flaggedRows.length) {
    pieces.push(`Ngoài ra có **${analysis.flaggedRows.length}** dòng mình gắn cờ để bạn rà soát thêm.`);
  }
  if (analysis.cleaned.rows.length && imported.importMode !== 'transactions') {
    pieces.push('Mình cũng đã chuẩn hóa một bản “dữ liệu sạch” để bạn xuất lại thành file mới.');
  }
  const numericColumns = detectNumericColumns(imported.rawRows || []);
  if (numericColumns.length) {
    pieces.push(`Các cột số nổi bật: ${numericColumns.slice(0, 3).map(c => `${c.name} (${c.rows} dòng)`).join('; ')}.`);
  }
  return pieces.join(' ');
}

function analyzeExcelFile(filePath) {
  if (!isSupported(filePath)) throw new Error('Hiện Finiip chỉ phân tích file csv, txt, json, xls, xlsx.');
  const imported = importTransactionsFromFile(filePath);
  const columnReview = detectColumnIssues(imported.headers, imported.rawRows || []);
  const cleaned = inferCleanedRows(imported);
  const flaggedRows = [
    ...(imported.templateJournal.issues || []).map(item => ({
      rowNumber: item.rowNumber || item.rows?.join(', ') || item.documentNo || '',
      level: item.type === 'imbalance' ? 'high' : 'medium',
      message: item.message || `Chứng từ lệch Nợ/Có ${item.debitTotal || 0} / ${item.creditTotal || 0}`,
      suggestedFix: item.type === 'imbalance' ? 'Kiểm tra lại các dòng cùng chứng từ để cân bằng tổng Nợ và Có.' : 'Bổ sung tài khoản hoặc số tiền còn thiếu.'
    })),
    ...(columnReview.issues || []).map(item => ({
      rowNumber: item.rowNumber || '',
      level: 'medium',
      message: item.message,
      suggestedFix: 'So lại tiêu đề cột và số ô dữ liệu trên dòng này.'
    })),
    ...(cleaned.issues || []).map(item => ({
      rowNumber: item.rowNumber || '',
      level: 'medium',
      message: item.message,
      suggestedFix: 'Rà lại tài khoản, bên Nợ/Có và số tiền trước khi import lại.'
    }))
  ];

  const exportResult = createCleanWorkbook(imported, { cleaned, flaggedRows });
  return {
    ok: true,
    fileName: imported.fileName,
    fileType: imported.fileType,
    sheetName: imported.sheetName,
    rowCount: imported.records.length,
    headers: imported.headers,
    importMode: imported.importMode,
    issueCount: imported.templateJournal.issues.length,
    entryCount: imported.templateJournal.entries.length,
    preview: buildPreview(imported.records),
    insights: detectNumericColumns(imported.rawRows || []),
    columnIssues: columnReview.issues,
    flaggedRows,
    cleanedSample: cleaned.rows.slice(0, 8),
    cleanedHeaders: cleaned.headers,
    exportPath: path.basename(exportResult.output || ''),
    downloadUrl: exportResult.output ? `/generated_reports/${path.basename(exportResult.output)}` : null,
    answer: buildNarrative(imported, { cleaned, flaggedRows }, columnReview)
  };
}

module.exports = { analyzeExcelFile };
