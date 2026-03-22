function takeRecentTopics(history = []) {
  const recent = history.slice(-8).map(x => String(x.content || '').toLowerCase());
  return {
    has111: recent.some(x => x.includes('111')),
    has112: recent.some(x => x.includes('112')),
    has131: recent.some(x => x.includes('131')),
    has331: recent.some(x => x.includes('331')),
    hasVat: recent.some(x => x.includes('vat') || x.includes('gtgt')),
    hasDepreciation: recent.some(x => x.includes('khấu hao') || x.includes('khau hao')),
    hasPurchaseSale: recent.some(x => x.includes('mua hàng') || x.includes('mua hang') || x.includes('bán hàng') || x.includes('ban hang'))
  };
}

function enrichFollowUp(question, history = []) {
  const q = String(question || '').trim();
  if (!q) return q;
  const lower = q.toLowerCase();
  const topics = takeRecentTopics(history);

  if (/^(con|còn|the|vay|thế|the sao|còn cái đó|còn trường hợp đó)/i.test(lower)) {
    if (topics.hasVat) return `${q} (ngữ cảnh trước đó đang nói về thuế GTGT)`;
    if (topics.hasPurchaseSale) return `${q} (ngữ cảnh trước đó đang nói về nghiệp vụ mua bán hàng hóa)`;
  }

  if (/\b112\b/.test(lower) && !/tai khoan|tk/i.test(lower) && topics.has111) {
    return `${q} (đang hỏi tiếp nối sau tài khoản 111, vui lòng giải thích tương tự cho tài khoản 112)`;
  }
  if (/\b331\b/.test(lower) && !/tai khoan|tk/i.test(lower) && topics.has131) {
    return `${q} (đang hỏi tiếp nối sau tài khoản 131, vui lòng giải thích tương tự cho tài khoản 331)`;
  }
  if (/ben nao|so du|tang|giam/i.test(lower) && !/\b\d{3,4}\b/.test(lower)) {
    if (topics.has111) return `${q} (đang hỏi tiếp về tài khoản 111)`;
    if (topics.has112) return `${q} (đang hỏi tiếp về tài khoản 112)`;
    if (topics.has131) return `${q} (đang hỏi tiếp về tài khoản 131)`;
    if (topics.has331) return `${q} (đang hỏi tiếp về tài khoản 331)`;
  }

  return q;
}

module.exports = { enrichFollowUp };
