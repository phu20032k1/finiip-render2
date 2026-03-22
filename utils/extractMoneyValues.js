function cleanNumericPart(raw) {
  return String(raw || "")
    .replace(/\s+/g, "")
    .replace(/đ|d|vnd/gi, "");
}

function normalizeNumber(raw) {
  if (!raw) return NaN;
  let cleaned = cleanNumericPart(raw);

  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");

  if (hasComma && hasDot) {
    const lastComma = cleaned.lastIndexOf(",");
    const lastDot = cleaned.lastIndexOf(".");
    if (lastComma > lastDot) {
      cleaned = cleaned.replace(/\./g, "").replace(",", ".");
    } else {
      cleaned = cleaned.replace(/,/g, "");
    }
  } else if (hasComma) {
    const commaCount = (cleaned.match(/,/g) || []).length;
    if (commaCount > 1) {
      cleaned = cleaned.replace(/,/g, "");
    } else {
      cleaned = cleaned.replace(",", ".");
    }
  } else if (hasDot) {
    const dotCount = (cleaned.match(/\./g) || []).length;
    if (dotCount > 1) {
      cleaned = cleaned.replace(/\./g, "");
    }
  }

  return Number(cleaned);
}

function getUnitMultiplier(unitText = "") {
  const unit = unitText.toLowerCase().trim();
  if (unit.includes("ty") || unit.includes("tỷ")) return 1_000_000_000;
  if (unit.includes("trieu") || unit.includes("triệu") || unit === "tr") return 1_000_000;
  if (unit.includes("nghin") || unit.includes("nghìn") || unit === "k") return 1_000;
  return 1;
}

function extractMoneyValues(text) {
  const regex = /(-?\d[\d.,\s]*\d|-?\d)(?:\s*)(ty|tỷ|trieu|triệu|tr|nghin|nghìn|k)?(?=\b|\s|$|đ|d|vnd)/gi;
  const matches = [...text.matchAll(regex)];

  return matches
    .map(match => {
      const rawNumber = match[1];
      const rawUnit = match[2] || "";
      const baseNumber = normalizeNumber(rawNumber);
      const multiplier = getUnitMultiplier(rawUnit);
      const value = baseNumber * multiplier;

      return {
        raw: match[0],
        number: baseNumber,
        unit: rawUnit,
        value
      };
    })
    .filter(item => !Number.isNaN(item.value));
}

module.exports = extractMoneyValues;
