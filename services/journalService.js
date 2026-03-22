const extractAccountingEntities = require('../utils/extractAccountingEntities');
const { createEntry, createCompoundEntry, formatEntry } = require('../engine/journal');
const { getAccount, getNormalSideLabel } = require('../engine/coa');

function detectAccountCode(text) {
  const match = text.match(/\b(?:tk\s*)?(111|112|131|1331|152|153|156|211|214|331|3331|334|421|511|515|521|531|532|632|635|641|642|811|911)\b/);
  return match ? match[1] : null;
}

function describeAccount(text) {
  const code = detectAccountCode(text);
  const account = getAccount(code);
  if (!account) return null;

  const normalSide = getNormalSideLabel(account);
  const typeLabelMap = {
    asset: 'tài sản', contra_asset: 'tài sản điều chỉnh giảm', liability: 'nợ phải trả', equity: 'vốn chủ sở hữu',
    income: 'doanh thu', contra_income: 'giảm trừ doanh thu', expense: 'chi phí', intermediate: 'tài khoản trung gian'
  };

  const asksIncrease = /(tang ben nao|tinh chat|du ben nao|so du ben nao|binh thuong ben nao)/.test(text);
  const asksDecrease = /(giam ben nao)/.test(text);
  let extra = `- Tính chất: ${typeLabelMap[account.type] || account.type}\n- Số dư / tăng thông thường: ${normalSide}`;
  if (asksDecrease) extra += `\n- Giảm thường ghi ở ${account.normal === 'debit' ? 'bên Có' : 'bên Nợ'}.`;
  else if (asksIncrease) extra += `\n- Khi tăng thường ghi ở ${normalSide}.`;
  return `📘 Tài khoản ${account.code} - ${account.name}\n${extra}`;
}

function inferAmount(entities) {
  return entities.amount || entities.so_tien || entities.gia_chua_vat || entities.doanh_thu || entities.nguyen_gia || entities.all_numbers?.[0] || null;
}

function inferPaymentAccount(text) {
  if (/(chuyen khoan|ngan hang)/.test(text)) return '112';
  if (/(tien mat)/.test(text)) return '111';
  return null;
}

function buildVatLines(text, entities, baseAmount, mode) {
  const rate = entities.vat_rate || (/8\s*%/.test(text) ? 0.08 : ((/10\s*%/.test(text) || /(vat|thue gtgt)/.test(text)) ? 0.1 : 0));
  if (!rate) return null;
  const vatAmount = Math.round(baseAmount * rate);
  if (mode === 'purchase') return { vatAmount, debitVat: { code: '1331', amount: vatAmount } };
  if (mode === 'sale') return { vatAmount, creditVat: { code: '3331', amount: vatAmount } };
  return null;
}

function buildSalesEntries(text, entities, meta) {
  const revenue = entities.doanh_thu || entities.gia_chua_vat || entities.all_numbers?.[0];
  if (!revenue) return null;
  const cashOrBank = inferPaymentAccount(text);
  const debitCode = /ban chiu|chua thu tien|khach hang no/.test(text) ? '131' : (cashOrBank || '111');
  const vat = buildVatLines(text, entities, revenue, 'sale');
  const saleEntry = createCompoundEntry({
    description: text,
    debits: [{ code: debitCode, amount: revenue + (vat?.vatAmount || 0) }],
    credits: [{ code: '511', amount: revenue }, ...(vat?.creditVat ? [vat.creditVat] : [])],
    meta
  });
  const entries = [saleEntry];

  const giaVon = entities.gia_von || (entities.all_numbers && entities.all_numbers.length > 1 ? entities.all_numbers[1] : null);
  if (giaVon && /(gia von|xuat kho|kem gia von|dong thoi gia von)/.test(text)) {
    entries.push(createEntry('632', '156', giaVon, `${text} - bút toán giá vốn`, meta));
  }
  return entries;
}

function buildPurchaseEntries(text, entities, meta) {
  const baseAmount = entities.gia_chua_vat || entities.all_numbers?.[0];
  if (!baseAmount) return null;
  const creditCode = /chua thanh toan|mua chiu/.test(text) ? '331' : (inferPaymentAccount(text) || '111');
  const inventoryCode = /(nguyen vat lieu|vat lieu)/.test(text) ? '152' : /(ccdc|cong cu dung cu)/.test(text) ? '153' : /(tai san co dinh|tscd|may moc|mua xe)/.test(text) ? '211' : '156';
  const vat = buildVatLines(text, entities, baseAmount, 'purchase');
  return [createCompoundEntry({
    description: text,
    debits: [{ code: inventoryCode, amount: baseAmount }, ...(vat?.debitVat ? [vat.debitVat] : [])],
    credits: [{ code: creditCode, amount: baseAmount + (vat?.vatAmount || 0) }],
    meta
  })];
}

function buildClosingEntries(text, entities, meta) {
  const amount = inferAmount(entities);
  if (!amount) throw new Error('Đây là câu hỏi kết chuyển nhưng chưa có số tiền rõ ràng.');
  if (/ket chuyen doanh thu tai chinh/.test(text)) return [createEntry('515', '911', amount, text, meta)];
  if (/ket chuyen doanh thu/.test(text)) return [createEntry('511', '911', amount, text, meta)];
  if (/ket chuyen giam tru|ket chuyen chiet khau|ket chuyen hang ban bi tra lai|ket chuyen giam gia/.test(text)) return [createEntry('911', '521', amount, text, meta)];
  if (/ket chuyen gia von/.test(text)) return [createEntry('911', '632', amount, text, meta)];
  if (/ket chuyen chi phi ban hang/.test(text)) return [createEntry('911', '641', amount, text, meta)];
  if (/ket chuyen chi phi quan ly/.test(text)) return [createEntry('911', '642', amount, text, meta)];
  if (/ket chuyen chi phi tai chinh/.test(text)) return [createEntry('911', '635', amount, text, meta)];
  if (/ket chuyen loi nhuan|xac dinh ket qua kinh doanh|ket chuyen lai/.test(text)) return [createEntry('911', '421', amount, text, meta)];
  if (/ket chuyen lo/.test(text)) return [createEntry('421', '911', amount, text, meta)];
  throw new Error('Chưa hỗ trợ mẫu kết chuyển này.');
}

function buildJournalEntryObject(text, meta = {}) {
  const entities = extractAccountingEntities(text);
  const amount = inferAmount(entities);
  const enrichedMeta = {
    ...meta,
    quantity: meta.quantity || entities.so_luong || 0,
    unitPrice: meta.unitPrice || entities.don_gia || 0,
    object: meta.object || '',
    item: meta.item || ''
  };

  if (/ket chuyen|xac dinh ket qua kinh doanh/.test(text)) return { entries: buildClosingEntries(text, entities, enrichedMeta) };
  if (/(ban hang)/.test(text)) {
    const entries = buildSalesEntries(text, entities, enrichedMeta);
    if (!entries) throw new Error('Nghiệp vụ bán hàng chưa có số tiền rõ ràng.');
    return { entries };
  }
  if (/(mua hang|mua hang hoa|mua nguyen vat lieu|mua vat lieu|mua ccdc|cong cu dung cu|mua tai san co dinh|mua tscd|mua may moc|mua xe)/.test(text)) {
    const entries = buildPurchaseEntries(text, entities, enrichedMeta);
    if (!entries) throw new Error('Nghiệp vụ mua vào chưa có giá trị rõ ràng.');
    return { entries };
  }

  const scenarios = [
    { test: /(thu no khach hang|khach hang thanh toan|khach hang tra no).*(tien mat)|(?:tien mat).*(thu no khach hang|khach hang thanh toan|khach hang tra no)/, fn: () => [createEntry('111', '131', amount, text, enrichedMeta)] },
    { test: /(thu no khach hang|khach hang thanh toan|khach hang tra no).*(chuyen khoan|ngan hang)|(?:chuyen khoan|ngan hang).*(thu no khach hang|khach hang thanh toan|khach hang tra no)/, fn: () => [createEntry('112', '131', amount, text, enrichedMeta)] },
    { test: /(tra no nguoi ban|thanh toan no nguoi ban|tra tien nguoi ban).*(tien mat)|(?:tien mat).*(tra no nguoi ban|thanh toan no nguoi ban|tra tien nguoi ban)/, fn: () => [createEntry('331', '111', amount, text, enrichedMeta)] },
    { test: /(tra no nguoi ban|thanh toan no nguoi ban|tra tien nguoi ban).*(chuyen khoan|ngan hang)|(?:chuyen khoan|ngan hang).*(tra no nguoi ban|thanh toan no nguoi ban|tra tien nguoi ban)/, fn: () => [createEntry('331', '112', amount, text, enrichedMeta)] },
    { test: /(trich khau hao|khau hao tai san co dinh|khau hao tscd)/, fn: () => [createEntry('642', '214', amount, text, enrichedMeta)] },
    { test: /(tinh luong|luong phai tra|ghi nhan luong)/, fn: () => [createEntry('642', '334', amount, text, enrichedMeta)] }
  ];

  const matched = scenarios.find(item => item.test.test(text));
  if (!matched) throw new Error('Chưa map được mẫu nghiệp vụ này.');
  return { entries: matched.fn() };
}

function buildJournalEntry(text, meta = {}) {
  try {
    const result = buildJournalEntryObject(text, meta);
    return result.entries.map(formatEntry).join('\n');
  } catch (error) {
    return `Mình đã nhận ra đây là câu hỏi định khoản, nhưng ${error.message}`;
  }
}

module.exports = { buildJournalEntry, buildJournalEntryObject, describeAccount, detectAccountCode };
