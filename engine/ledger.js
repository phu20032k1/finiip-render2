const { getAccount } = require('./coa');

class Ledger {
  constructor() {
    this.entries = [];
  }

  addEntry(entry) {
    const debitTotal = (entry.debits || []).reduce((sum, line) => sum + Number(line.amount || 0), 0);
    const creditTotal = (entry.credits || []).reduce((sum, line) => sum + Number(line.amount || 0), 0);
    if (Math.abs(debitTotal - creditTotal) > 1) {
      throw new Error('Bút toán không cân.');
    }
    this.entries.push(entry);
  }

  addEntries(entries = []) {
    entries.forEach(entry => this.addEntry(entry));
  }

  getJournal() {
    return this.entries;
  }

  getLedgerMap() {
    const map = {};
    this.entries.forEach((entry, index) => {
      const ref = index + 1;
      (entry.debits || []).forEach(line => {
        const account = getAccount(line.code) || { code: String(line.code), name: 'Không rõ' };
        map[line.code] = map[line.code] || { code: line.code, name: account.name, debitTotal: 0, creditTotal: 0, balance: 0, normal: account.normal || 'debit', lines: [] };
        map[line.code].debitTotal += line.amount;
        map[line.code].balance += line.amount;
        map[line.code].lines.push({ ref, description: entry.description || '', side: 'Nợ', amount: line.amount, date: entry.meta?.date || '', documentNo: entry.meta?.documentNo || '' });
      });
      (entry.credits || []).forEach(line => {
        const account = getAccount(line.code) || { code: String(line.code), name: 'Không rõ' };
        map[line.code] = map[line.code] || { code: line.code, name: account.name, debitTotal: 0, creditTotal: 0, balance: 0, normal: account.normal || 'credit', lines: [] };
        map[line.code].creditTotal += line.amount;
        map[line.code].balance -= line.amount;
        map[line.code].lines.push({ ref, description: entry.description || '', side: 'Có', amount: line.amount, date: entry.meta?.date || '', documentNo: entry.meta?.documentNo || '' });
      });
    });
    return map;
  }

  getTrialBalance() {
    const ledgerMap = this.getLedgerMap();
    return Object.values(ledgerMap)
      .sort((a, b) => String(a.code).localeCompare(String(b.code), 'vi'))
      .map(item => ({
        code: item.code,
        name: item.name,
        debitTotal: item.debitTotal,
        creditTotal: item.creditTotal,
        endingDebit: item.balance > 0 ? item.balance : 0,
        endingCredit: item.balance < 0 ? Math.abs(item.balance) : 0
      }));
  }
}

module.exports = Ledger;
