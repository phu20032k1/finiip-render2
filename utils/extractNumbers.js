function extractNumbers(text) {
  const matches = text.match(/\d+(?:[.,]\d+)?/g) || [];
  return matches.map(item => Number(item.replace(",", ".")));
}

module.exports = extractNumbers;