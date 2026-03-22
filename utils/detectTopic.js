const TOPICS = [
  { key: 'tai_san', keywords: ['tai san'] },
  { key: 'tai_san_ngan_han', keywords: ['tai san ngan han', 'tsnh'] },
  { key: 'tai_san_dai_han', keywords: ['tai san dai han', 'tsdh'] },
  { key: 'tai_san_co_dinh', keywords: ['tai san co dinh', 'tscd'] },
  { key: 'khau_hao', keywords: ['khau hao'] },
  { key: 'doanh_thu', keywords: ['doanh thu'] },
  { key: 'doanh_thu_thuan', keywords: ['doanh thu thuan'] },
  { key: 'doanh_thu_chua_thuc_hien', keywords: ['doanh thu chua thuc hien', 'thu truoc doanh thu'] },
  { key: 'gia_von', keywords: ['gia von', 'ton dau', 'ton cuoi', 'nhap trong ky'] },
  { key: 'gia_thanh_san_xuat', keywords: ['gia thanh san xuat', 'gia thanh'] },
  { key: 'gia_thanh_don_vi', keywords: ['gia thanh don vi'] },
  { key: 'chi_phi', keywords: ['chi phi'] },
  { key: 'chi_phi_ban_hang', keywords: ['chi phi ban hang'] },
  { key: 'chi_phi_quan_ly', keywords: ['chi phi quan ly', 'chi phi quan ly doanh nghiep'] },
  { key: 'chi_phi_tra_truoc', keywords: ['chi phi tra truoc', 'tra truoc'] },
  { key: 'chi_phi_phai_tra', keywords: ['chi phi phai tra', 'trich truoc chi phi'] },
  { key: 'chi_phi_san_xuat_chung', keywords: ['chi phi san xuat chung'] },
  { key: 'loi_nhuan_gop', keywords: ['loi nhuan gop', 'lai gop', 'gross profit'] },
  { key: 'loi_nhuan_truoc_thue', keywords: ['loi nhuan truoc thue'] },
  { key: 'loi_nhuan_rong', keywords: ['loi nhuan rong', 'loi nhuan sau thue', 'net profit'] },
  { key: 'vat_dau_vao', keywords: ['vat dau vao', 'thue gtgt dau vao'] },
  { key: 'vat_dau_ra', keywords: ['vat dau ra', 'thue gtgt dau ra'] },
  { key: 'thue_gtgt', keywords: ['thue gtgt', 'vat'] },
  { key: 'vat_khau_tru', keywords: ['phuong phap khau tru', 'khau tru vat'] },
  { key: 'thue_tndn', keywords: ['thue thu nhap doanh nghiep', 'thue tndn'] },
  { key: 'thue_tncn', keywords: ['thue thu nhap ca nhan', 'thue tncn'] },
  { key: 'hang_ton_kho', keywords: ['hang ton kho'] },
  { key: 'hang_gui_ban', keywords: ['hang gui ban'] },
  { key: 'hang_mua_dang_di_duong', keywords: ['hang mua dang di duong'] },
  { key: 'phai_thu', keywords: ['phai thu'] },
  { key: 'phai_tra', keywords: ['phai tra'] },
  { key: 'no_phai_tra', keywords: ['no phai tra'] },
  { key: 'du_phong_phai_thu_kho_doi', keywords: ['du phong phai thu kho doi', 'no kho doi'] },
  { key: 'von_chu_so_huu', keywords: ['von chu so huu'] },
  { key: 'cong_cu_dung_cu', keywords: ['cong cu dung cu', 'ccdc'] },
  { key: 'bao_cao_tai_chinh', keywords: ['bao cao tai chinh', 'bctc'] },
  { key: 'bang_can_doi_ke_toan', keywords: ['bang can doi ke toan'] },
  { key: 'bao_cao_ket_qua_kinh_doanh', keywords: ['bao cao ket qua kinh doanh'] },
  { key: 'luu_chuyen_tien_te', keywords: ['luu chuyen tien te'] },
  { key: 'phan_tich_bctc', keywords: ['phan tich bao cao tai chinh', 'phan tich bctc'] },
  { key: 'nguyen_tac_ke_toan', keywords: ['nguyen tac ke toan'] },
  { key: 'co_so_don_tich', keywords: ['co so don tich', 'don tich'] },
  { key: 'nguyen_tac_phu_hop', keywords: ['nguyen tac phu hop', 'phu hop'] },
  { key: 'nguyen_tac_than_trong', keywords: ['nguyen tac than trong', 'than trong'] },
  { key: 'can_doi_ke_toan', keywords: ['can doi ke toan', 'phuong trinh ke toan'] },
  { key: 'doi_chieu_ngan_hang', keywords: ['doi chieu ngan hang', 'doi chieu sao ke'] },
  { key: 'kiem_ke', keywords: ['kiem ke'] },
  { key: 'chenh_lech_kiem_ke', keywords: ['chenh lech kiem ke', 'thua thieu kiem ke'] },
  { key: 'fifo', keywords: ['fifo', 'nhap truoc xuat truoc'] },
  { key: 'binh_quan_gia_quyen', keywords: ['binh quan gia quyen', 'don gia binh quan'] },
  { key: 'vong_quay_hang_ton_kho', keywords: ['vong quay hang ton kho'] },
  { key: 'vong_quay_phai_thu', keywords: ['vong quay phai thu'] },
  { key: 'diem_hoa_von', keywords: ['diem hoa von'] },
  { key: 'lai_vay', keywords: ['lai vay'] },
  { key: 'chenhlech_ty_gia', keywords: ['chenh lech ty gia', 'lai ty gia', 'lo ty gia'] },
  { key: 'doanh_thu_tai_chinh', keywords: ['doanh thu tai chinh'] },
  { key: 'chi_phi_tai_chinh', keywords: ['chi phi tai chinh'] },
  { key: 'thu_nhap_khac', keywords: ['thu nhap khac'] },
  { key: 'chi_phi_khac', keywords: ['chi phi khac'] },
  { key: 'ket_chuyen', keywords: ['ket chuyen', 'xac dinh ket qua kinh doanh'] },
  { key: 'du_toan', keywords: ['du toan', 'ngan sach'] },
  { key: 'luong_va_bhxh', keywords: ['tien luong', 'bao hiem', 'bhxh'] },
  { key: 'tam_ung', keywords: ['tam ung', 'hoan ung'] },
  { key: 'tk_111', keywords: ['tk 111', 'tai khoan 111'] },
  { key: 'tk_112', keywords: ['tk 112', 'tai khoan 112'] },
  { key: 'tk_131', keywords: ['tk 131', 'tai khoan 131'] },
  { key: 'tk_1331', keywords: ['tk 1331', 'tai khoan 1331'] },
  { key: 'tk_152', keywords: ['tk 152', 'tai khoan 152'] },
  { key: 'tk_153', keywords: ['tk 153', 'tai khoan 153'] },
  { key: 'tk_156', keywords: ['tk 156', 'tai khoan 156'] },
  { key: 'tk_211', keywords: ['tk 211', 'tai khoan 211'] },
  { key: 'tk_214', keywords: ['tk 214', 'tai khoan 214'] },
  { key: 'tk_331', keywords: ['tk 331', 'tai khoan 331'] },
  { key: 'tk_3331', keywords: ['tk 3331', 'tai khoan 3331'] },
  { key: 'tk_334', keywords: ['tk 334', 'tai khoan 334'] },
  { key: 'tk_338', keywords: ['tk 338', 'tai khoan 338'] },
  { key: 'tk_511', keywords: ['tk 511', 'tai khoan 511'] },
  { key: 'tk_515', keywords: ['tk 515', 'tai khoan 515'] },
  { key: 'tk_632', keywords: ['tk 632', 'tai khoan 632'] },
  { key: 'tk_635', keywords: ['tk 635', 'tai khoan 635'] },
  { key: 'tk_641', keywords: ['tk 641', 'tai khoan 641'] },
  { key: 'tk_642', keywords: ['tk 642', 'tai khoan 642'] },
  { key: 'tk_711', keywords: ['tk 711', 'tai khoan 711'] },
  { key: 'tk_811', keywords: ['tk 811', 'tai khoan 811'] },
  { key: 'tk_911', keywords: ['tk 911', 'tai khoan 911'] },
  { key: 'tk_421', keywords: ['tk 421', 'tai khoan 421'] }
];

const ACCOUNT_PATTERN = /\b(?:tk\s*)?(111|112|131|1331|152|153|156|211|214|331|3331|334|338|511|515|632|635|641|642|711|811|911|421)\b/;

function detectTopic(text) {
  const accountMatch = text.match(ACCOUNT_PATTERN);
  if (accountMatch) return `tk_${accountMatch[1]}`;

  let bestTopic = 'unknown';
  let bestScore = 0;
  let bestSpecificity = 0;

  for (const topic of TOPICS) {
    const matched = topic.keywords.filter(keyword => text.includes(keyword));
    const score = matched.length;
    const specificity = matched.reduce((sum, keyword) => sum + keyword.length, 0);
    if (score > bestScore || (score === bestScore && specificity > bestSpecificity)) {
      bestScore = score;
      bestTopic = topic.key;
      bestSpecificity = specificity;
    }
  }

  return bestTopic;
}

function suggestTopics(text) {
  return TOPICS
    .map(topic => ({ key: topic.key, score: topic.keywords.reduce((sum, keyword) => sum + (text.includes(keyword) ? 1 : 0), 0) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(item => item.key);
}

module.exports = { detectTopic, suggestTopics };
