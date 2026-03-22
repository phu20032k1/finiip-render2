function applySynonyms(text) {
  let output = text;

  const replacements = [
    [/mua vao/g, "mua hang"],
    [/ban ra/g, "ban hang"],
    [/cong no khach hang/g, "phai thu"],
    [/cong no nha cung cap/g, "phai tra"],
    [/lai vay/g, "chi phi tai chinh"],
    [/lai tien gui/g, "doanh thu tai chinh"],
    [/chi phi quan ly doanh nghiep/g, "chi phi quan ly"],
    [/hang gui dai ly/g, "hang gui ban"],
    [/nhap truoc xuat truoc/g, "fifo"],
    [/don gia binh quan/g, "binh quan gia quyen"],
    [/doi chieu sao ke/g, "doi chieu ngan hang"],
    [/du phong no xau|du phong no kho doi/g, "du phong phai thu kho doi"],
    [/doanh thu chua thuc hien|thu truoc doanh thu/g, "doanh thu chua thuc hien"],
    [/tra truoc chi phi/g, "chi phi tra truoc"],
    [/trich truoc chi phi/g, "chi phi phai tra"],
    [/bhxh|bao hiem xa hoi/g, "bao hiem"],
    [/thue tncn/g, "thue thu nhap ca nhan"],
    // intent
    [/khai niem|dinh nghia|nghia la gi|la gi|la sao|la nhu the nao/g, "la gi"],
    [/phan biet|so sanh|khac nhau|khac gi nhau/g, "phan biet"],
    [/cach tinh|tinh nhu the nao|cong thuc|tinh ra sao/g, "cach tinh"],
    [/khi nao ghi nhan|dieu kien ghi nhan|ghi nhan khi nao/g, "dieu kien ghi nhan"],
    [/cho vi du|minh hoa|lay vi du/g, "vi du"],
    [/ban chat|de lam gi|dung de lam gi|phan anh gi/g, "ban chat"],

    // topics
    [/tscd/g, "tai san co dinh"],
    [/ccdc/g, "cong cu dung cu"],
    [/vat|gtgt/g, "thue gtgt"],
    [/tndn/g, "thue thu nhap doanh nghiep"],
    [/ln gop/g, "loi nhuan gop"],
    [/ln rong|loi nhuan sau thue/g, "loi nhuan rong"],
    [/phai thu khach hang/g, "phai thu"],
    [/phai tra nguoi ban/g, "phai tra"],
    [/hang hoa ton kho/g, "hang ton kho"],
    [/doanh thu ban hang/g, "doanh thu"],
    [/gia von hang ban/g, "gia von"],
    [/von chu/g, "von chu so huu"],

    // account aliases
    [/tk 111|tai khoan 111/g, "111"],
    [/tk 112|tai khoan 112/g, "112"],
    [/tk 131|tai khoan 131/g, "131"],
    [/tk 331|tai khoan 331/g, "331"],
    [/tk 211|tai khoan 211/g, "211"],
    [/tk 214|tai khoan 214/g, "214"],
    [/tk 511|tai khoan 511/g, "511"],
    [/tk 632|tai khoan 632/g, "632"],
    [/tk 641|tai khoan 641/g, "641"],
    [/tk 642|tai khoan 642/g, "642"]
  ];

  for (const [pattern, replacement] of replacements) {
    output = output.replace(pattern, replacement);
  }

  return output;
}

module.exports = applySynonyms;