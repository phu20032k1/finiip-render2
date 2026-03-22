const extractMoneyValues = require("./extractMoneyValues");

const MONEY_LABELS = {
  doanh_thu: ["doanh thu thuan", "doanh thu", "revenue", "ban duoc", "ban hang"],
  gia_von: ["gia von", "cogs", "cost", "gia von hang ban"],
  chi_phi: ["chi phi", "expense", "chi phi ban hang", "chi phi quan ly"],
  thue: ["thue tndn", "thue thu nhap doanh nghiep", "thue", "tax"],
  giam_tru: ["giam tru doanh thu", "giam tru", "chiet khau", "giam gia", "hang ban bi tra lai"],
  ton_dau_ky: ["ton dau ky", "ton dau"],
  nhap_trong_ky: ["nhap trong ky", "nhap ky", "nhap"],
  ton_cuoi_ky: ["ton cuoi ky", "ton cuoi"],
  nguyen_gia: ["nguyen gia", "gia tri tai san"],
  gia_chua_vat: ["gia chua vat", "gia mua chua vat", "gia ban chua vat", "gia tinh thue", "chua vat", "truoc vat"],
  so_luong: ["so luong", "sl", "qty", "quantity"],
  don_gia: ["don gia", "gia 1", "gia mot", "unit price", "price each"]
};

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractLabeledMoney(text, labels) {
  for (const label of labels) {
    const pattern = new RegExp(`${escapeRegex(label)}\\s*(?:la|=|:)?\\s*(-?\\d[\\d.,\\s]*\\d|-?\\d)(?:\\s*(ty|tỷ|trieu|triệu|tr|nghin|nghìn|k))?`, "i");
    const match = text.match(pattern);
    if (match) {
      const parsed = extractMoneyValues(`${match[1]} ${match[2] || ""}`)[0];
      if (parsed) return parsed.value;
    }
  }
  return null;
}

function extractLabeledNumber(text, labels) {
  for (const label of labels) {
    const pattern = new RegExp(`${escapeRegex(label)}\\s*(?:la|=|:)?\\s*(-?\\d+(?:[.,]\\d+)?)`, 'i');
    const match = text.match(pattern);
    if (match) return Number(String(match[1]).replace(/\./g, '').replace(',', '.'));
  }
  return null;
}

function extractYears(text) {
  const patterns = [
    /(?:su dung|dung|khau hao|phan bo)?\s*(-?\d+(?:[.,]\d+)?)\s*nam/i,
    /(?:trong|voi)\s*(-?\d+(?:[.,]\d+)?)\s*nam/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return Number(String(match[1]).replace(",", "."));
  }

  return null;
}

function extractVatRate(text) {
  const match = text.match(/(\d+(?:[.,]\d+)?)\s*%/);
  if (!match) return null;
  return Number(match[1].replace(",", ".")) / 100;
}

function extractLooseQuantity(text) {
  const patterns = [
    /(mua|ban|xuat|nhap)\s+(\d+(?:[.,]\d+)?)\s*(?:sp|san pham|mat hang|hang|cai|kg|thung|hop|bo|don vi)?/i,
    /(\d+(?:[.,]\d+)?)\s*(?:sp|san pham|mat hang|hang|cai|kg|thung|hop|bo|don vi)\b/i
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    const raw = match?.[2] || match?.[1];
    if (raw) return Number(String(raw).replace(',', '.'));
  }
  return null;
}

function inferUnitPriceFromQuantity(totalAmount, quantity) {
  if (!quantity || !totalAmount) return null;
  const value = totalAmount / quantity;
  return Number.isFinite(value) ? Math.round(value) : null;
}

function extractAccountingEntities(text) {
  const entities = {};

  for (const [key, labels] of Object.entries(MONEY_LABELS)) {
    const value = ['so_luong'].includes(key)
      ? extractLabeledNumber(text, labels)
      : extractLabeledMoney(text, labels);
    if (value !== null) entities[key] = value;
  }

  const soNam = extractYears(text);
  if (soNam !== null) entities.so_nam = soNam;

  const vatRate = extractVatRate(text);
  if (vatRate !== null) entities.vat_rate = vatRate;

  if (entities.so_luong == null) {
    const looseQty = extractLooseQuantity(text);
    if (looseQty !== null) entities.so_luong = looseQty;
  }

  entities.all_numbers = extractMoneyValues(text).map(item => item.value);

  if (entities.don_gia == null) {
    const baseAmount = entities.gia_chua_vat || entities.doanh_thu || entities.gia_von || entities.nguyen_gia || entities.all_numbers?.[0];
    const inferredUnitPrice = inferUnitPriceFromQuantity(baseAmount, entities.so_luong);
    if (inferredUnitPrice !== null) entities.don_gia = inferredUnitPrice;
  }

  return entities;
}

module.exports = extractAccountingEntities;
