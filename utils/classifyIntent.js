function countMatches(text, patterns) {
  return patterns.reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0);
}

function classifyIntent(text) {
  const intents = [
    { name: 'greeting', patterns: [/(xin chao|chao ban|hello|\bhi\b|\bhey\b|alo|helo|\byo\b)/, /(chao em|chao a|chao ad|minh muon hoi)/] },
    { name: 'introduction', patterns: [/(ban la ai|gioi thieu|ten ban la gi|finiip la gi|finiip la ai)/] },
    { name: 'capabilities', patterns: [/(ban lam duoc gi|giup duoc gi|tinh nang|chuc nang|co the lam gi|huong dan su dung|cach su dung|dung nhu the nao)/] },
    { name: 'thanks', patterns: [/(cam on|thanks|thank you|rat huu ich|tot qua|hay qua)/] },
    { name: 'farewell', patterns: [/(tam biet|bye|goodbye|hen gap lai|gap lai sau)/] },
    { name: 'student_faq', patterns: [/(faq ke toan|cau hoi thuong gap|ke toan cho sinh vien|hoc ke toan tu dau|sinh vien ke toan|moi hoc ke toan|tu hoc ke toan)/] },
    { name: 'interview', patterns: [/(phong van ke toan|cau hoi phong van|interview ke toan|nha tuyen dung hoi ke toan|xin viec ke toan)/] },
    { name: 'tax_practice', patterns: [/(thue thuc hanh|ke khai thue|nop thue|khau tru thue|hoa don dau vao|hoa don dau ra|quyet toan thue|xuat hoa don|vat phai nop|thue tndn|thue gtgt|thue tncn)/] },
    { name: 'sales_purchase', patterns: [/(mua ban hang hoa|nghiep vu mua ban|ban hang chua thu tien|mua hang chua thanh toan|hang ban bi tra lai|chiet khau thuong mai|giam gia hang ban|mua hang|ban hang|thu no|tra no nha cung cap|tra truoc cho nguoi ban|nguoi mua tra tien truoc|dat coc|van chuyen mua hang|chi phi thu mua|hang mua dang di duong|hang gui ban|xuat kho|nhap kho|ban dai ly|gia von)/] },
    { name: 'file_import', patterns: [/(doc file|doc excel|nhap file|import file|tu file|tu excel|read file|duong dan:|path:|file:).*(csv|txt|json|xls|xlsx)|\.(csv|txt|json|xls|xlsx)\b/] },
    { name: 'excel_export', patterns: [/(xuat excel|file excel|bao cao excel|tai file excel|export excel)/] },
    { name: 'comparison', patterns: [/(phan biet|so sanh|khac nhau|khac gi nhau)/] },
    { name: 'accounting_report', patterns: [/(nhat ky chung|so cai|bang can doi so phat sinh|bao cao ket qua kinh doanh|bang can doi ke toan|bao cao tai chinh|bctc|phat sinh nhieu nghiep vu|nhieu nghiep vu|danh sach nghiep vu|chuoi nghiep vu|cong no|ton kho|the kho|doi chieu lech|doi tuong)/] },
    { name: 'journal_entry', patterns: [/(ket chuyen|xac dinh ket qua kinh doanh|dinh khoan|but toan|ghi no|ghi co|hach toan|phan bo|trich khau hao|trich luong|hoan ung|thanh ly tai san|trich lap du phong)/] },
    { name: 'account_side', patterns: [/(tang ben nao|giam ben nao|tinh chat|so du ben nao|binh thuong ben nao)/, /(tai khoan|\b111\b|\b112\b|\b131\b|\b331\b|\b211\b|\b214\b|\b511\b|\b521\b|\b531\b|\b532\b|\b632\b|\b641\b|\b642\b|\b1331\b|\b3331\b|\b911\b|\b421\b|\b334\b|\b338\b|\b156\b|\b152\b|\b153\b|\b515\b|\b635\b)/] },
    { name: 'calculation', patterns: [/(cach tinh|tinh nhu the nao|cong thuc|bao nhieu|tinh giup|\btinh\b|ra bao nhieu|moi thang|vat dau vao|vat dau ra|thue gtgt dau vao|thue gtgt dau ra|lai gop|loi nhuan|doanh thu thuan|gia von|khau hao|diem hoa von|vong quay|he so|gia thanh|don gia binh quan|so ngay thu tien)/] },
    { name: 'recognition', patterns: [/(dieu kien|khi nao duoc ghi nhan|ghi nhan khi nao)/] },
    { name: 'definition', patterns: [/(la gi|khai niem|dinh nghia|co nghia la gi|la sao|la nhu the nao)/] },
    { name: 'account', patterns: [/(tai khoan|\b111\b|\b112\b|\b131\b|\b331\b|\b211\b|\b214\b|\b511\b|\b521\b|\b531\b|\b532\b|\b632\b|\b641\b|\b642\b|\b1331\b|\b3331\b|\b911\b|\b421\b|\b334\b|\b338\b|\b156\b|\b152\b|\b153\b|\b515\b|\b635\b|\b711\b|\b811\b)/] },
    { name: 'example', patterns: [/(vi du|minh hoa|cho mot vi du|lay mot vi du)/] }
  ];

  let bestIntent = 'general';
  let bestScore = 0;

  for (const intent of intents) {
    const score = countMatches(text, intent.patterns);
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent.name;
    }
  }

  return bestIntent;
}

module.exports = classifyIntent;
