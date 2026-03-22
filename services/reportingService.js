const Ledger = require('../engine/ledger');
const { getAccount } = require('../engine/coa');
const { formatCurrency } = require('../utils/stepFormatter');
const { formatEntry } = require('../engine/journal');
const { buildJournalEntryObject } = require('./journalService');
const { exportWorkbook } = require('./excelExportService');

function splitTransactions(text) {
  const cleaned = String(text).replace(/^\s*(nhieu nghiep vu|danh sach nghiep vu|chuoi nghiep vu|xuat excel cho danh sach nghiep vu)\s*:?/i, '').replace(/\r/g, '\n');
  const seed = cleaned.split(/[\n;]+/).map(x => x.trim()).filter(Boolean);
  const chunks = [];
  const starter = /(?=\b(?:mua|ban|thu|tra|trich|ket chuyen|xac dinh ket qua kinh doanh)\b)/i;
  seed.forEach(part => chunks.push(...part.split(starter).map(x => x.trim()).filter(Boolean)));
  return chunks;
}

function buildEntriesFromText(text) {
  const parts = splitTransactions(text);
  const entries = [];
  const errors = [];
  parts.forEach((part, index) => {
    try {
      const result = buildJournalEntryObject(part, { rowNumber: index + 1 });
      if (!result?.entries?.length) {
        errors.push(`- Nghiệp vụ ${index + 1}: chưa nhận diện được -> ${part}`);
        return;
      }
      result.entries.forEach(entry => entries.push(entry));
    } catch (error) {
      errors.push(`- Nghiệp vụ ${index + 1}: ${error.message}`);
    }
  });
  return { parts, entries, errors, records: parts.map((description, i) => ({ rowNumber: i + 1, description })) };
}

function formatJournal(entries) {
  if (!entries.length) return '📘 Nhật ký chung\n- Chưa có bút toán hợp lệ.';
  const lines = ['📘 Nhật ký chung'];
  entries.forEach((entry, index) => {
    const meta = entry.meta || {};
    const header = [`\nNghiệp vụ ${index + 1}`, meta.date ? `Ngày ${meta.date}` : null, meta.documentNo ? `CT ${meta.documentNo}` : null, meta.item ? `MH ${meta.item}` : null].filter(Boolean).join(' | ');
    lines.push(header);
    lines.push(formatEntry(entry));
    if (meta.quantity || meta.unitPrice) {
      lines.push(`- SL: ${meta.quantity || 0} | Đơn giá: ${formatCurrency(meta.unitPrice || 0)} đồng`);
    }
  });
  return lines.join('\n');
}

function formatGeneralLedger(ledgerMap) {
  const accounts = Object.values(ledgerMap).sort((a, b) => String(a.code).localeCompare(String(b.code), 'vi'));
  if (!accounts.length) return '📘 Sổ cái\n- Chưa có số liệu.';
  const lines = ['📘 Sổ cái'];
  accounts.forEach(account => {
    lines.push(`\n- TK ${account.code} - ${account.name}`);
    account.lines.forEach(line => {
      const prefix = [line.date || '', line.documentNo || '', `NV${line.ref}`, line.side].filter(Boolean).join(' | ');
      lines.push(`  + ${prefix} | ${formatCurrency(line.amount)} đồng | ${line.description}`);
    });
    lines.push(`  + Cộng phát sinh Nợ: ${formatCurrency(account.debitTotal)} đồng`);
    lines.push(`  + Cộng phát sinh Có: ${formatCurrency(account.creditTotal)} đồng`);
    lines.push(`  + Số dư cuối kỳ: ${account.balance >= 0 ? 'Nợ' : 'Có'} ${formatCurrency(Math.abs(account.balance))} đồng`);
  });
  return lines.join('\n');
}

function formatTrialBalance(rows) {
  if (!rows.length) return '📘 Bảng cân đối số phát sinh\n- Chưa có số liệu.';
  const lines = ['📘 Bảng cân đối số phát sinh'];
  let totalDebit = 0, totalCredit = 0, totalEndDebit = 0, totalEndCredit = 0;
  rows.forEach(row => {
    totalDebit += row.debitTotal; totalCredit += row.creditTotal; totalEndDebit += row.endingDebit; totalEndCredit += row.endingCredit;
    lines.push(`- TK ${row.code} - ${row.name}: PS Nợ ${formatCurrency(row.debitTotal)} | PS Có ${formatCurrency(row.creditTotal)} | Dư Nợ ${formatCurrency(row.endingDebit)} | Dư Có ${formatCurrency(row.endingCredit)}`);
  });
  lines.push(`- Tổng phát sinh Nợ: ${formatCurrency(totalDebit)} đồng`);
  lines.push(`- Tổng phát sinh Có: ${formatCurrency(totalCredit)} đồng`);
  lines.push(`- Tổng dư Nợ cuối kỳ: ${formatCurrency(totalEndDebit)} đồng`);
  lines.push(`- Tổng dư Có cuối kỳ: ${formatCurrency(totalEndCredit)} đồng`);
  return lines.join('\n');
}

function calculateFinancialStatements(ledgerMap, entries = []) {
  const map = ledgerMap || {};
  const getBalance = code => (map[code] ? map[code].balance : 0);
  const creditAbs = code => Math.max(0, -getBalance(code));
  const debitAbs = code => Math.max(0, getBalance(code));
  const nonClosingEntries = entries.filter(entry => !/(ket chuyen|xac dinh ket qua kinh doanh)/i.test(entry.description || ''));
  const movement = {};
  nonClosingEntries.forEach(entry => {
    (entry.debits || []).forEach(line => { movement[line.code] = movement[line.code] || { debit: 0, credit: 0 }; movement[line.code].debit += Number(line.amount || 0); });
    (entry.credits || []).forEach(line => { movement[line.code] = movement[line.code] || { debit: 0, credit: 0 }; movement[line.code].credit += Number(line.amount || 0); });
  });
  const mvDebit = code => (movement[code] ? movement[code].debit : 0);
  const mvCredit = code => (movement[code] ? movement[code].credit : 0);
  const doanhThuBanHang = mvCredit('511');
  const doanhThuTaiChinh = mvCredit('515');
  const giamTru = mvDebit('521') + mvDebit('531') + mvDebit('532');
  const doanhThuThuan = doanhThuBanHang - giamTru;
  const giaVon = mvDebit('632');
  const loiNhuanGop = doanhThuThuan - giaVon;
  const chiPhiBanHang = mvDebit('641');
  const chiPhiQuanLy = mvDebit('642');
  const chiPhiTaiChinh = mvDebit('635');
  const chiPhiKhac = mvDebit('811');
  const loiNhuanThuan = loiNhuanGop + doanhThuTaiChinh - chiPhiBanHang - chiPhiQuanLy - chiPhiTaiChinh - chiPhiKhac;
  const thueTNDN = mvDebit('821');
  const loiNhuanSauThue = loiNhuanThuan - thueTNDN;
  const currentAssets = ['111', '112', '131', '1331', '152', '153', '156'].map(code => ({ code, name: getAccount(code)?.name || code, amount: debitAbs(code) }));
  const fixedAssetsGross = ['211'].map(code => ({ code, name: getAccount(code)?.name || code, amount: debitAbs(code) }));
  const accumulatedDepreciation = creditAbs('214');
  const liabilities = ['331', '3331', '334'].map(code => ({ code, name: getAccount(code)?.name || code, amount: creditAbs(code) }));
  const equity = ['421'].map(code => ({ code, name: getAccount(code)?.name || code, amount: creditAbs(code) }));
  const totalCurrentAssets = currentAssets.reduce((s, x) => s + x.amount, 0);
  const totalNonCurrentAssets = Math.max(0, fixedAssetsGross.reduce((s, x) => s + x.amount, 0) - accumulatedDepreciation);
  const totalAssets = totalCurrentAssets + totalNonCurrentAssets;
  const totalLiabilities = liabilities.reduce((s, x) => s + x.amount, 0);
  const totalEquity = equity.reduce((s, x) => s + x.amount, 0);
  return {
    incomeStatement: { doanhThuBanHang, doanhThuTaiChinh, giamTru, doanhThuThuan, giaVon, loiNhuanGop, chiPhiBanHang, chiPhiQuanLy, chiPhiTaiChinh, chiPhiKhac, loiNhuanThuan, thueTNDN, loiNhuanSauThue },
    balanceSheet: { currentAssets, fixedAssetsGross, accumulatedDepreciation, totalCurrentAssets, totalNonCurrentAssets, totalAssets, liabilities, equity, totalLiabilities, totalEquity, totalSources: totalLiabilities + totalEquity, balancingDifference: totalAssets - (totalLiabilities + totalEquity) }
  };
}

function inferObjectName(entry) {
  return entry.meta?.object || (entry.description || '').match(/(?:khach hang|nha cung cap|doi tuong)\s+([\wÀ-ỹ .-]+)/i)?.[1]?.trim() || 'Chưa rõ đối tượng';
}
function inferItemName(entry) {
  return entry.meta?.item || (entry.description || '').match(/(?:mat hang|hang hoa|san pham|item)\s+([\wÀ-ỹ .-]+)/i)?.[1]?.trim() || 'Chưa rõ mặt hàng';
}
function inferQuantity(entry) {
  const q = Number(entry.meta?.quantity || 0);
  if (q > 0) return q;
  const m = String(entry.description || '').match(/(?:so luong|sl|qty)\s*[:=]?\s*(\d+(?:[.,]\d+)?)/i);
  return m ? Number(m[1].replace(',', '.')) : 0;
}
function inferUnitPrice(entry, amount, quantity) {
  const p = Number(entry.meta?.unitPrice || 0);
  if (p > 0) return p;
  if (quantity > 0 && amount > 0) return Math.round(amount / quantity);
  return 0;
}
function pushDetail(container, key, movement) {
  container[key] = container[key] || { key, debit: 0, credit: 0, balance: 0, movements: [] };
  if (movement.debit) {
    container[key].debit += movement.debit;
    container[key].balance += movement.debit;
  }
  if (movement.credit) {
    container[key].credit += movement.credit;
    container[key].balance -= movement.credit;
  }
  container[key].movements.push(movement);
}

function calculateSubledgers(ledgerMap, entries = []) {
  const map = ledgerMap || {};
  const account = code => map[code] || { debitTotal: 0, creditTotal: 0, balance: 0, name: getAccount(code)?.name || code };
  const receivables = ['131'].map(code => ({ code, name: account(code).name, phatSinhNo: account(code).debitTotal, phatSinhCo: account(code).creditTotal, duCuoiKy: Math.max(0, account(code).balance) }));
  const payables = ['331', '3331', '334'].map(code => ({ code, name: account(code).name, phatSinhNo: account(code).debitTotal, phatSinhCo: account(code).creditTotal, duCuoiKy: Math.max(0, -account(code).balance) }));
  const inventory = ['152', '153', '156'].map(code => ({ code, name: account(code).name, nhap: account(code).debitTotal, xuat: account(code).creditTotal, tonCuoiKy: Math.max(0, account(code).balance) }));

  const receivableObjects = {};
  const payableObjects = {};
  const inventoryCards = {};

  entries.forEach((entry, idx) => {
    const objectName = inferObjectName(entry);
    const itemName = inferItemName(entry);
    const inventoryAmount = [...(entry.debits || []), ...(entry.credits || [])].filter(x => ['152', '153', '156'].includes(x.code)).reduce((s, x) => s + Number(x.amount || 0), 0);
    const quantity = inferQuantity(entry);
    const unitPrice = inferUnitPrice(entry, inventoryAmount, quantity);
    const baseMeta = { ref: idx + 1, date: entry.meta?.date || '', documentNo: entry.meta?.documentNo || '', description: entry.description || '' };

    (entry.debits || []).forEach(line => {
      if (line.code === '131') pushDetail(receivableObjects, objectName, { ...baseMeta, debit: line.amount, credit: 0, amount: line.amount, side: 'Nợ' });
      if (line.code === '331') pushDetail(payableObjects, objectName, { ...baseMeta, debit: line.amount, credit: 0, amount: line.amount, side: 'Nợ' });
      if (['152', '153', '156'].includes(line.code)) {
        inventoryCards[itemName] = inventoryCards[itemName] || { item: itemName, nhap: 0, xuat: 0, ton: 0, nhapQty: 0, xuatQty: 0, tonQty: 0, movements: [] };
        inventoryCards[itemName].nhap += line.amount;
        inventoryCards[itemName].ton += line.amount;
        inventoryCards[itemName].nhapQty += quantity;
        inventoryCards[itemName].tonQty += quantity;
        inventoryCards[itemName].movements.push({ ...baseMeta, type: 'Nhập', amount: line.amount, quantity, unitPrice });
      }
    });
    (entry.credits || []).forEach(line => {
      if (line.code === '131') pushDetail(receivableObjects, objectName, { ...baseMeta, debit: 0, credit: line.amount, amount: line.amount, side: 'Có' });
      if (line.code === '331') pushDetail(payableObjects, objectName, { ...baseMeta, debit: 0, credit: line.amount, amount: line.amount, side: 'Có' });
      if (['152', '153', '156'].includes(line.code)) {
        inventoryCards[itemName] = inventoryCards[itemName] || { item: itemName, nhap: 0, xuat: 0, ton: 0, nhapQty: 0, xuatQty: 0, tonQty: 0, movements: [] };
        inventoryCards[itemName].xuat += line.amount;
        inventoryCards[itemName].ton -= line.amount;
        inventoryCards[itemName].xuatQty += quantity;
        inventoryCards[itemName].tonQty -= quantity;
        inventoryCards[itemName].movements.push({ ...baseMeta, type: 'Xuất', amount: line.amount, quantity, unitPrice });
      }
    });
  });

  return {
    receivables,
    payables,
    inventory,
    receivableObjects: Object.values(receivableObjects).map(x => ({ object: x.key, debit: x.debit, credit: x.credit, balance: x.balance })),
    payableObjects: Object.values(payableObjects).map(x => ({ object: x.key, debit: x.debit, credit: x.credit, balance: -x.balance })),
    inventoryCards: Object.values(inventoryCards),
    receivableDetails: Object.values(receivableObjects),
    payableDetails: Object.values(payableObjects),
    totals: {
      receivables: receivables.reduce((s, x) => s + x.duCuoiKy, 0),
      payables: payables.reduce((s, x) => s + x.duCuoiKy, 0),
      inventory: inventory.reduce((s, x) => s + x.tonCuoiKy, 0),
      inventoryQty: Object.values(inventoryCards).reduce((s, x) => s + x.tonQty, 0)
    }
  };
}

function calculateTemplateDiscrepancies(importIssues = [], entries = []) {
  const issues = [...(importIssues || [])];
  const byDoc = {};
  entries.forEach(entry => {
    const key = entry.meta?.documentNo || `ROW${entry.meta?.rowNumber || ''}`;
    byDoc[key] = byDoc[key] || { documentNo: key, debit: 0, credit: 0, rows: [] };
    byDoc[key].debit += (entry.debits || []).reduce((s, x) => s + x.amount, 0);
    byDoc[key].credit += (entry.credits || []).reduce((s, x) => s + x.amount, 0);
  });
  Object.values(byDoc).forEach(item => {
    if (item.debit !== item.credit) issues.push({ type: 'imbalance', documentNo: item.documentNo, debitTotal: item.debit, creditTotal: item.credit, difference: item.debit - item.credit, rows: item.rows });
  });
  return issues;
}

function buildWorkbookData(records, entries, ledgerMap, trialBalance, statements, subledgers, discrepancies = []) {
  const inputRows = [['STT', 'Ngày', 'Số CT', 'Diễn giải', 'Số tiền gợi ý', 'Số lượng', 'Đơn giá', 'Đối tượng', 'Mặt hàng']];
  (records || []).forEach((record, index) => inputRows.push([record.rowNumber || index + 1, record.date || '', record.documentNo || '', record.description || '', record.amountHint || '', record.quantity || '', record.unitPrice || '', record.object || '', record.item || '']));

  const journalRows = [['STT', 'Ngày', 'Số CT', 'Diễn giải', 'TK Nợ', 'Tên TK Nợ', 'TK Có', 'Tên TK Có', 'Số tiền', 'Đối tượng', 'Mặt hàng', 'Số lượng', 'Đơn giá']];
  entries.forEach((entry, index) => {
    const debitLines = entry.debits || [];
    const creditLines = entry.credits || [];
    const loops = Math.max(debitLines.length, creditLines.length);
    for (let i = 0; i < loops; i += 1) {
      const debitLine = debitLines[i] || {};
      const creditLine = creditLines[i] || {};
      journalRows.push([
        index + 1,
        entry.meta?.date || '',
        entry.meta?.documentNo || '',
        i === 0 ? entry.description : '',
        debitLine.code || '',
        debitLine.name || '',
        creditLine.code || '',
        creditLine.name || '',
        debitLine.amount || creditLine.amount || '',
        i === 0 ? (entry.meta?.object || '') : '',
        i === 0 ? (entry.meta?.item || '') : '',
        i === 0 ? (entry.meta?.quantity || '') : '',
        i === 0 ? (entry.meta?.unitPrice || '') : ''
      ]);
    }
  });

  const ledgerRows = [['TK', 'Tên tài khoản', 'Ngày', 'Số CT', 'Ref', 'Diễn giải', 'Bên', 'Số tiền', 'PS Nợ', 'PS Có', 'Số dư cuối kỳ']];
  Object.values(ledgerMap).sort((a, b) => String(a.code).localeCompare(String(b.code), 'vi')).forEach(acc => {
    acc.lines.forEach(line => ledgerRows.push([acc.code, acc.name, line.date || '', line.documentNo || '', line.ref, line.description, line.side, line.amount, '', '', '']));
    ledgerRows.push([acc.code, acc.name, '', '', '', 'Cộng phát sinh', '', '', acc.debitTotal, acc.creditTotal, Math.abs(acc.balance)]);
  });

  const tbRows = [['TK', 'Tên tài khoản', 'PS Nợ', 'PS Có', 'Dư Nợ cuối kỳ', 'Dư Có cuối kỳ']];
  trialBalance.forEach(r => tbRows.push([r.code, r.name, r.debitTotal, r.creditTotal, r.endingDebit, r.endingCredit]));

  const isRows = [['Chỉ tiêu', 'Số tiền']];
  Object.entries({ 'Doanh thu bán hàng': statements.incomeStatement.doanhThuBanHang, 'Doanh thu tài chính': statements.incomeStatement.doanhThuTaiChinh, 'Giảm trừ doanh thu': statements.incomeStatement.giamTru, 'Doanh thu thuần': statements.incomeStatement.doanhThuThuan, 'Giá vốn': statements.incomeStatement.giaVon, 'Lợi nhuận gộp': statements.incomeStatement.loiNhuanGop, 'Chi phí bán hàng': statements.incomeStatement.chiPhiBanHang, 'Chi phí quản lý': statements.incomeStatement.chiPhiQuanLy, 'Chi phí tài chính': statements.incomeStatement.chiPhiTaiChinh, 'Chi phí khác': statements.incomeStatement.chiPhiKhac, 'Lợi nhuận thuần': statements.incomeStatement.loiNhuanThuan, 'Thuế TNDN': statements.incomeStatement.thueTNDN, 'Lợi nhuận sau thuế': statements.incomeStatement.loiNhuanSauThue }).forEach(([label, value]) => isRows.push([label, value]));

  const bsRows = [['Chỉ tiêu', 'Số tiền']];
  statements.balanceSheet.currentAssets.forEach(item => bsRows.push([`TSNH - ${item.code} ${item.name}`, item.amount]));
  bsRows.push(['Tổng tài sản ngắn hạn', statements.balanceSheet.totalCurrentAssets]);
  statements.balanceSheet.fixedAssetsGross.forEach(item => bsRows.push([`TSDH - ${item.code} ${item.name}`, item.amount]));
  bsRows.push(['Hao mòn lũy kế', statements.balanceSheet.accumulatedDepreciation]);
  bsRows.push(['Tổng tài sản dài hạn', statements.balanceSheet.totalNonCurrentAssets]);
  bsRows.push(['Tổng tài sản', statements.balanceSheet.totalAssets]);
  statements.balanceSheet.liabilities.forEach(item => bsRows.push([`Nợ phải trả - ${item.code} ${item.name}`, item.amount]));
  bsRows.push(['Tổng nợ phải trả', statements.balanceSheet.totalLiabilities]);
  statements.balanceSheet.equity.forEach(item => bsRows.push([`Vốn CSH - ${item.code} ${item.name}`, item.amount]));
  bsRows.push(['Tổng vốn chủ sở hữu', statements.balanceSheet.totalEquity]);
  bsRows.push(['Tổng nguồn vốn', statements.balanceSheet.totalSources]);
  bsRows.push(['Chênh lệch kiểm tra cân đối', statements.balanceSheet.balancingDifference]);

  const receivableRows = [['TK', 'Tên tài khoản', 'PS Nợ', 'PS Có', 'Dư cuối kỳ']];
  subledgers.receivables.forEach(r => receivableRows.push([r.code, r.name, r.phatSinhNo, r.phatSinhCo, r.duCuoiKy]));
  const payableRows = [['TK', 'Tên tài khoản', 'PS Nợ', 'PS Có', 'Dư cuối kỳ']];
  subledgers.payables.forEach(r => payableRows.push([r.code, r.name, r.phatSinhNo, r.phatSinhCo, r.duCuoiKy]));
  const inventoryRows = [['TK', 'Tên tài khoản', 'Nhập', 'Xuất', 'Tồn cuối kỳ']];
  subledgers.inventory.forEach(r => inventoryRows.push([r.code, r.name, r.nhap, r.xuat, r.tonCuoiKy]));

  const receivableObjectRows = [['Đối tượng', 'PS Nợ', 'PS Có', 'Dư cuối kỳ']];
  subledgers.receivableObjects.forEach(r => receivableObjectRows.push([r.object, r.debit, r.credit, Math.max(0, r.balance)]));
  const payableObjectRows = [['Đối tượng', 'PS Nợ', 'PS Có', 'Dư cuối kỳ']];
  subledgers.payableObjects.forEach(r => payableObjectRows.push([r.object, r.debit, r.credit, Math.max(0, r.balance)]));

  const inventoryCardRows = [['Mặt hàng', 'Ngày', 'Số CT', 'Loại', 'Số lượng', 'Đơn giá', 'Số tiền', 'Tồn SL sau GD', 'Tồn tiền sau GD', 'Diễn giải']];
  subledgers.inventoryCards.forEach(card => {
    let runningQty = 0;
    let runningAmount = 0;
    card.movements.forEach(m => {
      runningQty += m.type === 'Nhập' ? (m.quantity || 0) : -(m.quantity || 0);
      runningAmount += m.type === 'Nhập' ? m.amount : -m.amount;
      inventoryCardRows.push([card.item, m.date, m.documentNo, m.type, m.quantity || 0, m.unitPrice || 0, m.amount, runningQty, runningAmount, m.description]);
    });
    if (!card.movements.length) inventoryCardRows.push([card.item, '', '', '', '', '', '', card.tonQty, card.ton, '']);
  });

  const receivableDetailRows = [['Đối tượng', 'Ngày', 'Số CT', 'Diễn giải', 'Phát sinh Nợ', 'Phát sinh Có', 'Dư sau giao dịch']];
  subledgers.receivableDetails.forEach(group => {
    let running = 0;
    group.movements.forEach(m => {
      running += (m.debit || 0) - (m.credit || 0);
      receivableDetailRows.push([group.key, m.date, m.documentNo, m.description, m.debit || 0, m.credit || 0, running]);
    });
  });

  const payableDetailRows = [['Đối tượng', 'Ngày', 'Số CT', 'Diễn giải', 'Phát sinh Nợ', 'Phát sinh Có', 'Dư sau giao dịch']];
  subledgers.payableDetails.forEach(group => {
    let running = 0;
    group.movements.forEach(m => {
      running += (m.credit || 0) - (m.debit || 0);
      payableDetailRows.push([group.key, m.date, m.documentNo, m.description, m.debit || 0, m.credit || 0, running]);
    });
  });

  const discrepancyRows = [['Loại', 'Số CT', 'Dòng', 'Mô tả', 'Tổng Nợ', 'Tổng Có', 'Chênh lệch']];
  discrepancies.forEach(d => discrepancyRows.push([d.type || '', d.documentNo || '', (d.rows || []).join(', '), d.message || d.description || '', d.debitTotal || 0, d.creditTotal || 0, d.difference || 0]));

  return [
    { name: 'Input', rows: inputRows },
    { name: 'NhatKyChung', rows: journalRows },
    { name: 'SoCai', rows: ledgerRows },
    { name: 'CanDoiPS', rows: tbRows },
    { name: 'KQKD', rows: isRows },
    { name: 'BangCDKT', rows: bsRows },
    { name: 'CongNoPhaiThu', rows: receivableRows },
    { name: 'CongNoPhaiTra', rows: payableRows },
    { name: 'TonKho', rows: inventoryRows },
    { name: 'PTTheoDoiTuong', rows: receivableObjectRows },
    { name: 'PTraTheoDoiTuong', rows: payableObjectRows },
    { name: 'TheKho', rows: inventoryCardRows },
    { name: 'CTietPhaiThu', rows: receivableDetailRows },
    { name: 'CTietPhaiTra', rows: payableDetailRows },
    { name: 'DoiChieuLech', rows: discrepancyRows }
  ];
}

function buildAccountingReport(text, options = {}) {
  let parsed;
  if (options.parts && options.entries) parsed = { parts: options.parts, entries: options.entries, errors: options.errors || [], records: options.records || [] };
  else if (options.records && options.entries) parsed = { parts: options.records.map(r => r.description), entries: options.entries, errors: options.errors || [], records: options.records };
  else if (options.records) {
    const entries = [];
    const errors = [];
    const parts = [];
    options.records.forEach((record, index) => {
      parts.push(record.description);
      try {
        const result = buildJournalEntryObject(record.description, record);
        if (!result?.entries?.length) {
          errors.push(`- Nghiệp vụ ${index + 1}: chưa nhận diện được -> ${record.description}`);
          return;
        }
        result.entries.forEach(entry => entries.push(entry));
      } catch (error) {
        errors.push(`- Nghiệp vụ ${index + 1}: ${error.message}`);
      }
    });
    parsed = { parts, entries, errors, records: options.records };
  } else if (options.parts) {
    const temp = buildEntriesFromText((options.parts || []).join('\n'));
    parsed = { ...temp, records: (options.parts || []).map((description, i) => ({ rowNumber: i + 1, description })) };
  } else parsed = buildEntriesFromText(text);

  const ledger = new Ledger();
  ledger.addEntries(parsed.entries);
  const ledgerMap = ledger.getLedgerMap();
  const trialBalance = ledger.getTrialBalance();
  const statements = calculateFinancialStatements(ledgerMap, parsed.entries);
  const subledgers = calculateSubledgers(ledgerMap, parsed.entries);
  const discrepancies = calculateTemplateDiscrepancies(options.importIssues, parsed.entries);

  let exportPath = null;
  if (options.exportExcel) {
    const timestamp = new Date().toISOString().replace(/[.:]/g, '-');
    const format = (options.exportFormat || 'xlsx').toLowerCase();
    const filename = format === 'xlsx' ? `bao_cao_ke_toan_lv9_${timestamp}.xlsx` : `bao_cao_ke_toan_lv9_${timestamp}.xls`;
    exportPath = exportWorkbook(filename, buildWorkbookData(parsed.records || [], parsed.entries, ledgerMap, trialBalance, statements, subledgers, discrepancies), { format });
  }

  const answerSections = [
    formatJournal(parsed.entries),
    '',
    formatGeneralLedger(ledgerMap),
    '',
    formatTrialBalance(trialBalance),
    '',
    `📘 Báo cáo kết quả kinh doanh sơ bộ\n- Doanh thu thuần: ${formatCurrency(statements.incomeStatement.doanhThuThuan)} đồng\n- Giá vốn: ${formatCurrency(statements.incomeStatement.giaVon)} đồng\n- Lợi nhuận gộp: ${formatCurrency(statements.incomeStatement.loiNhuanGop)} đồng\n- Lợi nhuận sau thuế: ${formatCurrency(statements.incomeStatement.loiNhuanSauThue)} đồng`,
    '',
    `📘 Công nợ theo đối tượng\n- Số đối tượng phải thu: ${subledgers.receivableObjects.length}\n- Số đối tượng phải trả: ${subledgers.payableObjects.length}`,
    '',
    `📘 Thẻ kho\n- Số mặt hàng theo dõi: ${subledgers.inventoryCards.length}\n- Tổng tồn số lượng cuối kỳ: ${subledgers.totals.inventoryQty || 0}`
  ];
  if (discrepancies.length) answerSections.push('', `⚠️ Đối chiếu lệch: phát hiện ${discrepancies.length} vấn đề. Xem sheet DoiChieuLech để rà soát.`);
  if (parsed.errors.length) answerSections.push('', '⚠️ Nghiệp vụ chưa map được:', ...parsed.errors);
  if (exportPath) answerSections.push('', `📁 File Excel đã xuất: ${exportPath}`);
  return { type: 'accounting_report', exportPath, records: parsed.records || [], journalEntries: parsed.entries, ledger: ledgerMap, trialBalance, statements, subledgers, discrepancies, errors: parsed.errors, answer: answerSections.join('\n') };
}

module.exports = { buildAccountingReport, splitTransactions, buildEntriesFromText, calculateTemplateDiscrepancies };
