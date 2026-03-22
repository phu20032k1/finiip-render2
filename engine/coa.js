const COA = {
  "111": { code: "111", name: "Tiền mặt", type: "asset", normal: "debit", keywords: ["tien mat", "thu tien mat", "quy tien mat"] },
  "112": { code: "112", name: "Tiền gửi ngân hàng", type: "asset", normal: "debit", keywords: ["ngan hang", "chuyen khoan", "tien gui ngan hang"] },
  "131": { code: "131", name: "Phải thu khách hàng", type: "asset", normal: "debit", keywords: ["phai thu", "khach hang no", "ban chiu", "chua thu tien"] },
  "1331": { code: "1331", name: "Thuế GTGT được khấu trừ", type: "asset", normal: "debit", keywords: ["vat dau vao", "thue gtgt dau vao", "thue gtgt duoc khau tru"] },
  "152": { code: "152", name: "Nguyên liệu, vật liệu", type: "asset", normal: "debit", keywords: ["nguyen vat lieu", "vat lieu"] },
  "153": { code: "153", name: "Công cụ dụng cụ", type: "asset", normal: "debit", keywords: ["cong cu dung cu", "ccdc"] },
  "156": { code: "156", name: "Hàng hóa", type: "asset", normal: "debit", keywords: ["hang hoa", "mua hang"] },
  "211": { code: "211", name: "Tài sản cố định hữu hình", type: "asset", normal: "debit", keywords: ["tscd", "tai san co dinh", "mua may moc", "mua xe"] },
  "214": { code: "214", name: "Hao mòn lũy kế TSCĐ", type: "contra_asset", normal: "credit", keywords: ["hao mon luy ke", "khau hao luy ke"] },
  "331": { code: "331", name: "Phải trả người bán", type: "liability", normal: "credit", keywords: ["phai tra nguoi ban", "mua chiu", "chua thanh toan"] },
  "3331": { code: "3331", name: "Thuế GTGT phải nộp", type: "liability", normal: "credit", keywords: ["vat dau ra", "thue gtgt dau ra", "thue gtgt phai nop"] },
  "334": { code: "334", name: "Phải trả người lao động", type: "liability", normal: "credit", keywords: ["luong phai tra", "tinh luong"] },
  "421": { code: "421", name: "Lợi nhuận sau thuế chưa phân phối", type: "equity", normal: "credit", keywords: ["loi nhuan chua phan phoi", "ket chuyen loi nhuan"] },
  "511": { code: "511", name: "Doanh thu bán hàng và cung cấp dịch vụ", type: "income", normal: "credit", keywords: ["doanh thu", "ban hang"] },
  "515": { code: "515", name: "Doanh thu hoạt động tài chính", type: "income", normal: "credit", keywords: ["doanh thu tai chinh", "lai tien gui"] },
  "521": { code: "521", name: "Các khoản giảm trừ doanh thu", type: "contra_income", normal: "debit", keywords: ["giam tru doanh thu", "chiet khau thuong mai"] },
  "531": { code: "531", name: "Hàng bán bị trả lại", type: "contra_income", normal: "debit", keywords: ["hang ban bi tra lai"] },
  "532": { code: "532", name: "Giảm giá hàng bán", type: "contra_income", normal: "debit", keywords: ["giam gia hang ban"] },
  "632": { code: "632", name: "Giá vốn hàng bán", type: "expense", normal: "debit", keywords: ["gia von", "xuat kho ban hang"] },
  "635": { code: "635", name: "Chi phí tài chính", type: "expense", normal: "debit", keywords: ["chi phi tai chinh", "lai vay"] },
  "641": { code: "641", name: "Chi phí bán hàng", type: "expense", normal: "debit", keywords: ["chi phi ban hang", "quang cao", "van chuyen ban hang"] },
  "642": { code: "642", name: "Chi phí quản lý doanh nghiệp", type: "expense", normal: "debit", keywords: ["chi phi quan ly", "van phong"] },
  "811": { code: "811", name: "Chi phí khác", type: "expense", normal: "debit", keywords: ["chi phi khac"] },
  "911": { code: "911", name: "Xác định kết quả kinh doanh", type: "intermediate", normal: "credit", keywords: ["xac dinh ket qua kinh doanh", "ket chuyen cuoi ky"] }
};

function getAccount(code) {
  return COA[String(code)] || null;
}

function getNormalSideLabel(account) {
  if (!account) return "không xác định";
  return account.normal === "debit" ? "bên Nợ" : "bên Có";
}

module.exports = {
  COA,
  getAccount,
  getNormalSideLabel
};
