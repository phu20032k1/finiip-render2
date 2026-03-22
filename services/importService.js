const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { createEntry, createCompoundEntry } = require('../engine/journal');

function ensureExists(filePath) {
  if (!filePath) throw new Error('Chưa có đường dẫn file.');
  if (!fs.existsSync(filePath)) throw new Error(`Không tìm thấy file: ${filePath}`);
}

function extractPathFromText(text) {
  const direct = text.match(/(?:duong\s*dan|path|file)\s*[:=]\s*([^\n]+)/i);
  if (direct) {
    const cleaned = direct[1].split(/\s+(?:va|rồi|roi|sau do|sau đó)\b/i)[0].trim();
    return cleaned.replace(/^['"]|['"]$/g, '');
  }
  const anyFile = text.match(/((?:[A-Za-z]:)?[^\n]*?\.(?:csv|txt|json|xls|xlsx))/i);
  if (anyFile) return anyFile[1].trim().replace(/^['"]|['"]$/g, '');
  return null;
}

function normalizeCellValue(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function normalizeKey(value) {
  return normalizeCellValue(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[_-]/g, ' ');
}

function normalizeAccountCode(value) {
  const m = String(value || '').match(/\b(111|112|131|1331|152|153|156|211|214|331|3331|334|421|511|515|521|531|532|632|635|641|642|811|911)\b/);
  return m ? m[1] : '';
}

function parseAmount(value) {
  const raw = normalizeCellValue(value).toLowerCase();
  if (!raw) return 0;
  let txt = raw.replace(/đ|dong|vnd/g, '').replace(/\s+/g, '');
  let factor = 1;
  if (/ty|tỷ/.test(raw)) factor = 1_000_000_000;
  else if (/tr|triệu/.test(raw)) factor = 1_000_000;
  else if (/nghin|nghìn|k\b/.test(raw)) factor = 1_000;
  txt = txt.replace(/ty|tỷ|trieu|triệu|tr|nghin|nghìn|k/g, '');
  if (/^[\d.]+,[\d]+$/.test(txt)) txt = txt.replace(/\./g, '').replace(',', '.');
  else txt = txt.replace(/,/g, '');
  const num = Number(txt);
  if (!Number.isFinite(num)) return 0;
  return Math.round(num * factor);
}

function parseNumber(value) {
  const raw = normalizeCellValue(value);
  if (!raw) return 0;
  const cleaned = raw.replace(/,/g, '.').replace(/[^\d.-]/g, '');
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

function detectColumns(headers = []) {
  const idx = pattern => headers.findIndex(h => pattern.test(h));
  return {
    date: idx(/^(ngay|date)$/),
    doc: idx(/(so ct|so chung tu|voucher|reference|ref)/),
    desc: idx(/(nghiep vu|di[eễ]n giai|mo ta|description|transaction)/),
    amount: idx(/(so tien|amount|value)/),
    debitAccount: idx(/(tk no|tai khoan no|debit account|account debit)/),
    creditAccount: idx(/(tk co|tai khoan co|credit account|account credit)/),
    account: idx(/^(tai khoan|tk|account)$/),
    side: idx(/^(ben|side|drcr|debit\/credit)$/),
    object: idx(/(doi tuong|khach hang|nha cung cap|customer|vendor|object|counterparty)/),
    item: idx(/(mat hang|hang hoa|item|sku|product)/),
    quantity: idx(/(so luong|sl|qty|quantity)/),
    unitPrice: idx(/(don gia|gia ban|gia mua|unit price|price each)/)
  };
}

function parseDelimitedContent(content) {
  const lines = String(content).split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  if (!lines.length) return { headers: [], rawRows: [], records: [], transactions: [] };
  const hasSeparator = lines.some(line => /[;,\t]/.test(line));
  if (!hasSeparator) {
    const records = lines.map((description, index) => ({ rowNumber: index + 1, description, date: '', documentNo: '', amountHint: '', quantity: 0, unitPrice: 0, object: '', item: '' }));
    return { headers: [], rawRows: [], records, transactions: records.map(r => r.description) };
  }
  const rows = lines.map(line => line.split(/[;,\t]/).map(normalizeCellValue));
  const headers = rows[0].map(normalizeKey);
  const cols = detectColumns(headers);
  const rawRows = rows.slice(1).map((r, i) => {
    const cells = [...r];
    while (cells.length < headers.length) cells.push('');
    const map = Object.fromEntries(headers.map((h, idx) => [h, cells[idx] || '']));
    return { rowNumber: i + 2, cells, map };
  }).filter(r => r.cells.some(Boolean));
  const records = rawRows.map(r => ({
    rowNumber: r.rowNumber,
    description: cols.desc >= 0 ? normalizeCellValue(r.cells[cols.desc]) : normalizeCellValue(r.cells.join(' ')),
    date: cols.date >= 0 ? normalizeCellValue(r.cells[cols.date]) : '',
    documentNo: cols.doc >= 0 ? normalizeCellValue(r.cells[cols.doc]) : '',
    amountHint: cols.amount >= 0 ? normalizeCellValue(r.cells[cols.amount]) : '',
    quantity: cols.quantity >= 0 ? parseNumber(r.cells[cols.quantity]) : 0,
    unitPrice: cols.unitPrice >= 0 ? parseAmount(r.cells[cols.unitPrice]) : 0,
    object: cols.object >= 0 ? normalizeCellValue(r.cells[cols.object]) : '',
    item: cols.item >= 0 ? normalizeCellValue(r.cells[cols.item]) : ''
  })).filter(r => r.description);
  return { headers, rawRows, records, transactions: records.map(r => r.description) };
}

function parseJson(content) {
  const data = JSON.parse(content);
  const arr = Array.isArray(data) ? data : (Array.isArray(data.transactions) ? data.transactions : null);
  if (!arr) throw new Error('File JSON chưa đúng cấu trúc danh sách nghiệp vụ.');
  const headers = [];
  const rawRows = [];
  const records = arr.map((item, index) => {
    if (typeof item === 'string') {
      return { rowNumber: index + 1, description: item.trim(), date: '', documentNo: '', amountHint: '', quantity: 0, unitPrice: 0, object: '', item: '' };
    }
    const map = {};
    Object.keys(item || {}).forEach(k => { map[normalizeKey(k)] = normalizeCellValue(item[k]); });
    rawRows.push({ rowNumber: index + 1, cells: Object.values(map), map });
    return {
      rowNumber: index + 1,
      description: normalizeCellValue(item.nghiep_vu || item.nghiepVu || item.description || item.dien_giai || item.mo_ta || ''),
      date: normalizeCellValue(item.date || item.ngay || ''),
      documentNo: normalizeCellValue(item.documentNo || item.so_ct || item.reference || ''),
      amountHint: normalizeCellValue(item.amountHint || item.so_tien || item.amount || ''),
      quantity: parseNumber(item.so_luong || item.quantity || item.qty || ''),
      unitPrice: parseAmount(item.don_gia || item.unitPrice || item['unit_price'] || ''),
      object: normalizeCellValue(item.doi_tuong || item.object || item.customer || item.vendor || ''),
      item: normalizeCellValue(item.mat_hang || item.item || item.product || item.sku || '')
    };
  }).filter(r => r.description);
  return { headers, rawRows, records, transactions: records.map(r => r.description) };
}

function stripXml(value) {
  return String(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ').trim();
}

function parseSpreadsheetXml(content) {
  const worksheetRegex = /<Worksheet[^>]*ss:Name="([^"]+)"[^>]*>([\s\S]*?)<\/Worksheet>/gi;
  const sheets = [];
  let m;
  while ((m = worksheetRegex.exec(content))) sheets.push({ name: m[1], xml: m[2] });
  let targetSheet = sheets.find(s => /(input|nghiep vu|transactions?|journal|nhat ky)/i.test(s.name)) || sheets[0];
  if (!targetSheet) return { headers: [], rawRows: [], transactions: [], records: [], sheetName: '' };

  const rows = [...targetSheet.xml.matchAll(/<Row>([\s\S]*?)<\/Row>/gi)].map(x => x[1]);
  const dataRows = rows.map(row => [...row.matchAll(/<Data[^>]*>([\s\S]*?)<\/Data>/gi)].map(c => stripXml(c[1]))).filter(r => r.some(Boolean));
  if (!dataRows.length) return { headers: [], rawRows: [], transactions: [], records: [], sheetName: targetSheet.name };
  const headers = dataRows[0].map(normalizeKey);
  const cols = detectColumns(headers);
  const rawRows = dataRows.slice(1).map((r, i) => {
    const cells = [...r];
    while (cells.length < headers.length) cells.push('');
    const map = Object.fromEntries(headers.map((h, idx) => [h, cells[idx] || '']));
    return { rowNumber: i + 2, cells, map };
  }).filter(r => r.cells.some(Boolean));
  const records = rawRows.map(r => ({
    rowNumber: r.rowNumber,
    description: cols.desc >= 0 ? normalizeCellValue(r.cells[cols.desc]) : normalizeCellValue(r.cells.join(' ')),
    date: cols.date >= 0 ? normalizeCellValue(r.cells[cols.date]) : '',
    documentNo: cols.doc >= 0 ? normalizeCellValue(r.cells[cols.doc]) : '',
    amountHint: cols.amount >= 0 ? normalizeCellValue(r.cells[cols.amount]) : '',
    quantity: cols.quantity >= 0 ? parseNumber(r.cells[cols.quantity]) : 0,
    unitPrice: cols.unitPrice >= 0 ? parseAmount(r.cells[cols.unitPrice]) : 0,
    object: cols.object >= 0 ? normalizeCellValue(r.cells[cols.object]) : '',
    item: cols.item >= 0 ? normalizeCellValue(r.cells[cols.item]) : ''
  })).filter(r => r.description);
  return { headers, rawRows, records, transactions: records.map(r => r.description), sheetName: targetSheet.name };
}

function parseXlsxWithPython(filePath) {
  const helper = path.join(__dirname, '..', 'scripts', 'xlsx_helper.py');
  const result = spawnSync('python3', [helper, 'read', filePath], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error((result.stderr || result.stdout || 'Không đọc được file xlsx.').trim());
  const parsed = JSON.parse(result.stdout || '{}');
  return {
    transactions: (parsed.transactions || []).map(normalizeCellValue).filter(Boolean),
    records: (parsed.records || []).map(item => ({ rowNumber: item.rowNumber || '', description: normalizeCellValue(item.description), date: normalizeCellValue(item.date), documentNo: normalizeCellValue(item.documentNo), amountHint: normalizeCellValue(item.amountHint), quantity: parseNumber(item.quantity), unitPrice: parseAmount(item.unitPrice), object: normalizeCellValue(item.object), item: normalizeCellValue(item.item) })).filter(r => r.description),
    headers: (parsed.headers || []).map(normalizeKey),
    rawRows: (parsed.rawRows || []).map(r => ({ rowNumber: r.rowNumber || '', cells: (r.cells || []).map(normalizeCellValue), map: Object.fromEntries(Object.entries(r.map || {}).map(([k, v]) => [normalizeKey(k), normalizeCellValue(v)])) })),
    sheetName: parsed.sheet || ''
  };
}

function buildMetaFromRow(row) {
  const map = row.map || {};
  const quantity = parseNumber(map['so luong'] || map['sl'] || map['qty'] || map['quantity']);
  const unitPrice = parseAmount(map['don gia'] || map['gia ban'] || map['gia mua'] || map['unit price'] || map['price each']);
  return {
    rowNumber: row.rowNumber,
    date: map['ngay'] || map['date'] || '',
    documentNo: map['so ct'] || map['so chung tu'] || map['voucher'] || map['reference'] || map['ref'] || `ROW${row.rowNumber}`,
    source: 'imported_template',
    object: map['doi tuong'] || map['khach hang'] || map['nha cung cap'] || map['customer'] || map['vendor'] || map['object'] || map['counterparty'] || '',
    item: map['mat hang'] || map['hang hoa'] || map['item'] || map['sku'] || map['product'] || '',
    quantity,
    unitPrice
  };
}

function detectImportMode(headers = [], rawRows = []) {
  const cols = detectColumns(headers);
  if (cols.debitAccount >= 0 && cols.creditAccount >= 0) return 'paired';
  if (cols.account >= 0 && cols.side >= 0) return 'lines';
  const sample = rawRows[0]?.map || {};
  if (sample['tk no'] && sample['tk co']) return 'paired';
  if (sample['tai khoan'] && sample['ben']) return 'lines';
  return 'transactions';
}

function extractTemplateJournalEntries(imported) {
  const headers = imported.headers || [];
  const rawRows = imported.rawRows || [];
  const mode = detectImportMode(headers, rawRows);
  const issues = [];
  const entries = [];
  if (mode === 'paired') {
    rawRows.forEach(row => {
      const map = row.map || {};
      const debitCode = normalizeAccountCode(map['tk no'] || map['tai khoan no'] || map['debit account'] || map['account debit']);
      const creditCode = normalizeAccountCode(map['tk co'] || map['tai khoan co'] || map['credit account'] || map['account credit']);
      const amount = parseAmount(map['so tien'] || map['amount'] || map['value']);
      if (!debitCode || !creditCode || !amount) {
        issues.push({ type: 'invalid_row', rowNumber: row.rowNumber, message: 'Thiếu TK Nợ / TK Có / số tiền.' });
        return;
      }
      const description = map['dien giai'] || map['diễn giải'] || map['mo ta'] || map['mô tả'] || map['description'] || `Bút toán dòng ${row.rowNumber}`;
      entries.push(createEntry(debitCode, creditCode, amount, description, buildMetaFromRow(row)));
    });
  } else if (mode === 'lines') {
    const groups = {};
    rawRows.forEach(row => {
      const map = row.map || {};
      const accountCode = normalizeAccountCode(map['tai khoan'] || map['tk'] || map['account']);
      const sideRaw = normalizeKey(map['ben'] || map['side'] || map['drcr'] || map['debit credit']);
      const amount = parseAmount(map['so tien'] || map['amount'] || map['value']);
      const description = map['dien giai'] || map['diễn giải'] || map['mo ta'] || map['mô tả'] || map['description'] || `Chứng từ ${map['so ct'] || row.rowNumber}`;
      const side = /^(no|nợ|debit|dr)$/.test(sideRaw) ? 'debit' : (/^(co|có|credit|cr)$/.test(sideRaw) ? 'credit' : '');
      const key = [map['date'] || map['ngay'] || '', map['so ct'] || map['so chung tu'] || `ROW${row.rowNumber}`, description].join('|');
      groups[key] = groups[key] || { meta: buildMetaFromRow(row), description, debits: [], credits: [], rows: [] };
      groups[key].rows.push(row.rowNumber);
      if (!accountCode || !side || !amount) {
        issues.push({ type: 'invalid_row', rowNumber: row.rowNumber, message: 'Thiếu tài khoản / bên Nợ-Có / số tiền.' });
        return;
      }
      const line = { code: accountCode, amount };
      if (side === 'debit') groups[key].debits.push(line); else groups[key].credits.push(line);
    });
    Object.values(groups).forEach(group => {
      const debitTotal = group.debits.reduce((s, x) => s + x.amount, 0);
      const creditTotal = group.credits.reduce((s, x) => s + x.amount, 0);
      if (!group.debits.length || !group.credits.length || debitTotal !== creditTotal) {
        issues.push({ type: 'imbalance', documentNo: group.meta.documentNo, description: group.description, debitTotal, creditTotal, difference: debitTotal - creditTotal, rows: group.rows });
        return;
      }
      entries.push(createCompoundEntry({ description: group.description, debits: group.debits, credits: group.credits, meta: group.meta }));
    });
  }
  return { mode, entries, issues };
}

function importTransactionsFromFile(filePath) {
  ensureExists(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const content = ['.csv', '.txt', '.json', '.xls'].includes(ext) ? fs.readFileSync(filePath, 'utf8') : null;

  let parsed = { transactions: [], records: [], headers: [], rawRows: [], sheetName: '' };
  if (ext === '.json') parsed = parseJson(content);
  else if (ext === '.csv' || ext === '.txt') parsed = parseDelimitedContent(content);
  else if (ext === '.xls') parsed = parseSpreadsheetXml(content);
  else if (ext === '.xlsx') parsed = parseXlsxWithPython(filePath);
  else throw new Error(`Chưa hỗ trợ định dạng ${ext}`);

  const importMode = detectImportMode(parsed.headers, parsed.rawRows);
  const templateJournal = importMode === 'transactions' ? { mode: importMode, entries: [], issues: [] } : extractTemplateJournalEntries(parsed);

  return {
    filePath,
    fileName: path.basename(filePath),
    fileType: ext,
    sheetName: parsed.sheetName || '',
    count: (parsed.transactions || []).length,
    transactions: (parsed.transactions || []).map(normalizeCellValue).filter(Boolean),
    records: parsed.records || [],
    headers: parsed.headers || [],
    rawRows: parsed.rawRows || [],
    importMode,
    templateJournal
  };
}

module.exports = { importTransactionsFromFile, extractPathFromText, extractTemplateJournalEntries, parseAmount };
