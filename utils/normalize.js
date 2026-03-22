function removeVietnameseTones(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function normalizeText(text) {
  return removeVietnameseTones(text)
    .toLowerCase()
    .replace(/[?.,!;:()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

module.exports = normalizeText;