const path = require('path');
const normalizeText = require('../utils/normalize');
const applySynonyms = require('../utils/synonyms');
const classifyIntent = require('../utils/classifyIntent');
const { detectTopic, suggestTopics } = require('../utils/detectTopic');
const knowledge = { ...require('../knowledge/accountingKnowledge'), ...require('../knowledge/extendedAccountingKnowledge') };
const extractAccountingEntities = require('../utils/extractAccountingEntities');
const { stepFormatter, formatCurrency } = require('../utils/stepFormatter');
const { buildJournalEntry, describeAccount } = require('./journalService');
const { buildAccountingReport } = require('./reportingService');
const { importTransactionsFromFile, extractPathFromText } = require('./importService');

const BOT_NAME = 'Finiip';

function extractVatRate(text, entities) {
  return entities.vat_rate || 0.1;
}

function randomPick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function buildGreetingAnswer() {
  return randomPick([
    `👋 Xin chào! Mình là ${BOT_NAME} – AI kế toán. Bạn muốn hỏi kiến thức, định khoản, tính nhanh hay lập báo cáo?`,
    `👋 Chào bạn! ${BOT_NAME} sẵn sàng hỗ trợ kế toán. Bạn cứ gửi câu hỏi như “111 tăng bên nào?” hoặc “Tính VAT 10% cho 200 triệu”.`,
    `✨ Xin chào, mình là ${BOT_NAME} – AI kế toán. Mình có thể giải thích khái niệm, định khoản nghiệp vụ, tính chỉ tiêu và xuất báo cáo.`
  ]);
}

function buildIntroductionAnswer() {
  return `🤖 Mình là ${BOT_NAME} – AI kế toán.
- Hỗ trợ giải thích kiến thức kế toán cơ bản và tài khoản kế toán
- Hỗ trợ định khoản, xác định Nợ/Có, kết chuyển
- Hỗ trợ tính nhanh VAT, khấu hao, doanh thu thuần, lợi nhuận, giá vốn
- Hỗ trợ đọc file và xuất báo cáo Excel khi dữ liệu phù hợp

Bạn có thể thử hỏi:
- “Tài sản là gì?”
- “TK 111 tăng bên nào?”
- “Mua hàng chưa thanh toán định khoản thế nào?”
- “Tính khấu hao máy 120 triệu trong 5 năm”`;
}

function buildCapabilitiesAnswer() {
  return `📚 ${BOT_NAME} hiện có thể hỗ trợ khá rộng về kế toán:
1. Chào hỏi, hướng dẫn sử dụng và giải thích câu hỏi theo cách dễ hiểu
2. Kiến thức nền: tài sản, nợ phải trả, vốn chủ sở hữu, doanh thu, chi phí, nguyên tắc kế toán
3. Tài khoản: 111, 112, 131, 1331, 152, 153, 156, 211, 214, 331, 3331, 334, 338, 511, 515, 632, 635, 641, 642, 711, 811, 911, 421...
4. Mua hàng, bán hàng, công nợ, tồn kho, hàng gửi bán, hàng mua đang đi đường, chi phí trả trước, khấu hao, lương, bảo hiểm, kết chuyển
5. Thuế thực hành: VAT, TNDN, TNCN, hóa đơn, điều kiện khấu trừ, quyết toán cơ bản
6. Tính nhanh các chỉ tiêu như VAT, khấu hao, giá vốn, lợi nhuận, điểm hòa vốn, vòng quay
7. Lập bút toán, gợi ý trình tự xử lý nghiệp vụ và hỗ trợ xuất báo cáo / Excel

Mẫu câu hỏi nên dùng:
- “Phân biệt lợi nhuận gộp và lợi nhuận ròng”
- “Mua hàng có chi phí vận chuyển thì giá gốc tính sao?”
- “TK 334 dùng để làm gì?”
- “Điểm hòa vốn tính thế nào?”`;
}

function buildComparisonAnswer(text) {
  if (text.includes('loi nhuan gop') && text.includes('loi nhuan rong')) {
    return {
      type: 'comparison',
      topic: 'loi_nhuan_gop_vs_loi_nhuan_rong',
      answer: `📘 Phân biệt lợi nhuận gộp và lợi nhuận ròng
- Lợi nhuận gộp = Doanh thu thuần - Giá vốn hàng bán
- Lợi nhuận ròng = Doanh thu - Giá vốn - Chi phí - Thuế
- Lợi nhuận gộp phản ánh hiệu quả bán hàng cốt lõi.
- Lợi nhuận ròng phản ánh phần lợi nhuận cuối cùng doanh nghiệp còn giữ lại.`
    };
  }

  if (text.includes('phai thu') && text.includes('phai tra')) {
    return {
      type: 'comparison',
      topic: 'phai_thu_vs_phai_tra',
      answer: `📘 Phân biệt phải thu và phải trả
- Phải thu: khoản khách hàng hoặc bên khác còn nợ doanh nghiệp.
- Phải trả: khoản doanh nghiệp còn nợ người bán hoặc bên khác.
- Phải thu thường gắn với quyền thu tiền; phải trả gắn với nghĩa vụ thanh toán.`
    };
  }

  if (text.includes('tai san ngan han') && text.includes('tai san dai han')) {
    return {
      type: 'comparison',
      topic: 'tsnh_vs_tsdh',
      answer: `📘 Phân biệt tài sản ngắn hạn và tài sản dài hạn
- Tài sản ngắn hạn: dự kiến thu hồi hoặc sử dụng trong vòng 12 tháng.
- Tài sản dài hạn: thu hồi hoặc sử dụng trên 12 tháng.
- Ví dụ TSNH: tiền, hàng tồn kho; ví dụ TSDH: máy móc, nhà xưởng.`
    };
  }

  return {
    type: 'comparison',
    topic: 'unknown',
    answer: 'Mình chưa có sẵn cặp so sánh này trong kho tri thức, nhưng bạn có thể hỏi các cặp như: phải thu và phải trả, lợi nhuận gộp và lợi nhuận ròng, tài sản ngắn hạn và tài sản dài hạn.'
  };
}


function buildLongQuestionAnswer(text, intent, topic) {
  if (text.length < 90) return null;
  if (intent === 'sales_purchase') {
    return {
      type: 'sales_purchase_explained',
      answer: `Mình hiểu đây là câu hỏi tình huống mua bán hàng hóa khá dài. Với dạng này, bạn có thể tách theo 4 bước:
1. Xác định bản chất nghiệp vụ: mua hay bán, đã thanh toán hay chưa.
2. Xác định thuế GTGT đầu vào/đầu ra nếu có hóa đơn hợp lệ.
3. Xác định hàng hóa, công nợ, tiền và chi phí liên quan.
4. Lập bút toán theo từng thời điểm phát sinh.

Bạn gửi tiếp tình huống có số tiền hoặc hóa đơn cụ thể, mình sẽ định khoản từng bước rõ hơn.`
    };
  }
  if (intent === 'tax_practice') {
    return {
      type: 'tax_practice_explained',
      answer: `Mình hiểu đây là câu hỏi thuế thực hành khá dài. Cách xử lý an toàn là kiểm tra lần lượt: chứng từ hợp lệ, thời điểm ghi nhận, thuế suất áp dụng, điều kiện khấu trừ và kỳ kê khai. Nếu bạn dán nguyên tình huống hoặc số liệu vào đây, mình sẽ phân tích theo từng ý thay vì trả lời một câu ngắn.`
    };
  }
  if (topic && topic !== 'unknown') {
    return {
      type: 'guided_answer',
      answer: `Mình đã nhận ra chủ đề chính là **${topic.replace(/_/g, ' ')}**. Câu của bạn khá dài nên mình sẽ ưu tiên hiểu theo ý chính, sau đó trả lời từng phần. Bạn có thể thêm số liệu hoặc chứng từ để mình xử lý chính xác hơn.`
    };
  }
  return null;
}

function pick(entities, key, fallbackIndex = null) {
  if (entities[key] !== undefined) return entities[key];
  if (fallbackIndex !== null && entities.all_numbers[fallbackIndex] !== undefined) return entities.all_numbers[fallbackIndex];
  return null;
}

function missingFieldsMessage(labelMap, requiredKeys, entities) {
  const missing = requiredKeys.filter(key => pick(entities, key) === null).map(key => labelMap[key]);
  if (!missing.length) return '';
  return `Bạn còn thiếu: ${missing.join(', ')}.`;
}

function calculateByTopic(topic, text) {
  const entities = extractAccountingEntities(text);
  const labels = {
    doanh_thu: 'doanh thu',
    gia_von: 'giá vốn',
    chi_phi: 'chi phí',
    thue: 'thuế',
    giam_tru: 'giảm trừ doanh thu',
    ton_dau_ky: 'tồn đầu kỳ',
    nhap_trong_ky: 'nhập trong kỳ',
    ton_cuoi_ky: 'tồn cuối kỳ',
    nguyen_gia: 'nguyên giá',
    so_nam: 'số năm sử dụng',
    gia_chua_vat: 'giá chưa VAT'
  };

  if (topic === 'khau_hao') {
    const nguyenGia = pick(entities, 'nguyen_gia', 0);
    const soNam = pick(entities, 'so_nam', 1);
    if (nguyenGia !== null && soNam !== null) {
      const khauHaoNam = nguyenGia / soNam;
      const khauHaoThang = khauHaoNam / 12;
      return stepFormatter({
        title: 'Tính khấu hao',
        question: text,
        formula: 'Khấu hao năm = Nguyên giá / Số năm sử dụng; Khấu hao tháng = Khấu hao năm / 12',
        inputs: [
          { label: 'Nguyên giá', value: `${formatCurrency(nguyenGia)} đồng` },
          { label: 'Số năm sử dụng', value: `${soNam} năm` }
        ],
        steps: [
          `Khấu hao năm = ${formatCurrency(nguyenGia)} / ${soNam} = ${formatCurrency(khauHaoNam)} đồng`,
          `Khấu hao tháng = ${formatCurrency(khauHaoNam)} / 12 = ${formatCurrency(khauHaoThang)} đồng`
        ],
        result: `Khấu hao năm = ${formatCurrency(khauHaoNam)} đồng; khấu hao tháng = ${formatCurrency(khauHaoThang)} đồng`
      });
    }
    return stepFormatter({
      title: 'Tính khấu hao',
      formula: 'Khấu hao năm = Nguyên giá / Số năm sử dụng',
      note: missingFieldsMessage(labels, ['nguyen_gia', 'so_nam'], entities) || 'Bạn cần ít nhất 2 số: nguyên giá và số năm sử dụng.'
    });
  }

  if (topic === 'loi_nhuan_gop') {
    const doanhThu = pick(entities, 'doanh_thu', 0);
    const giaVon = pick(entities, 'gia_von', 1);
    if (doanhThu !== null && giaVon !== null) {
      const loiNhuanGop = doanhThu - giaVon;
      return stepFormatter({
        title: 'Tính lợi nhuận gộp',
        question: text,
        formula: 'Lợi nhuận gộp = Doanh thu thuần - Giá vốn',
        inputs: [
          { label: 'Doanh thu', value: `${formatCurrency(doanhThu)} đồng` },
          { label: 'Giá vốn', value: `${formatCurrency(giaVon)} đồng` }
        ],
        steps: [
          `Lợi nhuận gộp = ${formatCurrency(doanhThu)} - ${formatCurrency(giaVon)}`,
          `Lợi nhuận gộp = ${formatCurrency(loiNhuanGop)} đồng`
        ],
        result: `Lợi nhuận gộp = ${formatCurrency(loiNhuanGop)} đồng`
      });
    }
    return stepFormatter({
      title: 'Tính lợi nhuận gộp',
      formula: 'Lợi nhuận gộp = Doanh thu thuần - Giá vốn',
      note: missingFieldsMessage(labels, ['doanh_thu', 'gia_von'], entities) || 'Bạn cần ít nhất 2 số: doanh thu và giá vốn.'
    });
  }

  if (topic === 'loi_nhuan_truoc_thue') {
    const doanhThu = pick(entities, 'doanh_thu', 0);
    const giaVon = pick(entities, 'gia_von', 1);
    const chiPhi = pick(entities, 'chi_phi', 2);
    if (doanhThu !== null && giaVon !== null && chiPhi !== null) {
      const value = doanhThu - giaVon - chiPhi;
      return stepFormatter({
        title: 'Tính lợi nhuận trước thuế',
        question: text,
        formula: 'Lợi nhuận trước thuế = Doanh thu - Giá vốn - Chi phí',
        inputs: [
          { label: 'Doanh thu', value: `${formatCurrency(doanhThu)} đồng` },
          { label: 'Giá vốn', value: `${formatCurrency(giaVon)} đồng` },
          { label: 'Chi phí', value: `${formatCurrency(chiPhi)} đồng` }
        ],
        steps: [
          `Lợi nhuận trước thuế = ${formatCurrency(doanhThu)} - ${formatCurrency(giaVon)} - ${formatCurrency(chiPhi)}`,
          `Lợi nhuận trước thuế = ${formatCurrency(value)} đồng`
        ],
        result: `Lợi nhuận trước thuế = ${formatCurrency(value)} đồng`
      });
    }
    return stepFormatter({
      title: 'Tính lợi nhuận trước thuế',
      formula: 'Lợi nhuận trước thuế = Doanh thu - Giá vốn - Chi phí',
      note: missingFieldsMessage(labels, ['doanh_thu', 'gia_von', 'chi_phi'], entities) || 'Bạn cần ít nhất 3 số: doanh thu, giá vốn, chi phí.'
    });
  }

  if (topic === 'loi_nhuan_rong') {
    const doanhThu = pick(entities, 'doanh_thu', 0);
    const giaVon = pick(entities, 'gia_von', 1);
    const chiPhi = pick(entities, 'chi_phi', 2);
    const thue = pick(entities, 'thue', 3);
    if (doanhThu !== null && giaVon !== null && chiPhi !== null && thue !== null) {
      const value = doanhThu - giaVon - chiPhi - thue;
      return stepFormatter({
        title: 'Tính lợi nhuận ròng',
        question: text,
        formula: 'Lợi nhuận ròng = Doanh thu - Giá vốn - Chi phí - Thuế',
        inputs: [
          { label: 'Doanh thu', value: `${formatCurrency(doanhThu)} đồng` },
          { label: 'Giá vốn', value: `${formatCurrency(giaVon)} đồng` },
          { label: 'Chi phí', value: `${formatCurrency(chiPhi)} đồng` },
          { label: 'Thuế', value: `${formatCurrency(thue)} đồng` }
        ],
        steps: [
          `Lợi nhuận ròng = ${formatCurrency(doanhThu)} - ${formatCurrency(giaVon)} - ${formatCurrency(chiPhi)} - ${formatCurrency(thue)}`,
          `Lợi nhuận ròng = ${formatCurrency(value)} đồng`
        ],
        result: `Lợi nhuận ròng = ${formatCurrency(value)} đồng`
      });
    }
    return stepFormatter({
      title: 'Tính lợi nhuận ròng',
      formula: 'Lợi nhuận ròng = Doanh thu - Giá vốn - Chi phí - Thuế',
      note: missingFieldsMessage(labels, ['doanh_thu', 'gia_von', 'chi_phi', 'thue'], entities) || 'Bạn cần ít nhất 4 số: doanh thu, giá vốn, chi phí, thuế.'
    });
  }

  if (topic === 'doanh_thu_thuan') {
    const doanhThu = pick(entities, 'doanh_thu', 0);
    const giamTru = pick(entities, 'giam_tru', 1);
    if (doanhThu !== null && giamTru !== null) {
      const value = doanhThu - giamTru;
      return stepFormatter({
        title: 'Tính doanh thu thuần',
        question: text,
        formula: 'Doanh thu thuần = Doanh thu bán hàng - Các khoản giảm trừ',
        inputs: [
          { label: 'Doanh thu bán hàng', value: `${formatCurrency(doanhThu)} đồng` },
          { label: 'Các khoản giảm trừ', value: `${formatCurrency(giamTru)} đồng` }
        ],
        steps: [
          `Doanh thu thuần = ${formatCurrency(doanhThu)} - ${formatCurrency(giamTru)}`,
          `Doanh thu thuần = ${formatCurrency(value)} đồng`
        ],
        result: `Doanh thu thuần = ${formatCurrency(value)} đồng`
      });
    }
    return stepFormatter({
      title: 'Tính doanh thu thuần',
      formula: 'Doanh thu thuần = Doanh thu bán hàng - Các khoản giảm trừ',
      note: missingFieldsMessage(labels, ['doanh_thu', 'giam_tru'], entities) || 'Bạn cần ít nhất 2 số: doanh thu bán hàng và giảm trừ doanh thu.'
    });
  }

  if (topic === 'gia_von') {
    const tonDauKy = pick(entities, 'ton_dau_ky', 0);
    const nhapTrongKy = pick(entities, 'nhap_trong_ky', 1);
    const tonCuoiKy = pick(entities, 'ton_cuoi_ky', 2) || 0;
    if (tonDauKy !== null && nhapTrongKy !== null) {
      const value = tonDauKy + nhapTrongKy - tonCuoiKy;
      return stepFormatter({
        title: 'Tính giá vốn hàng bán',
        question: text,
        formula: 'Giá vốn = Tồn đầu kỳ + Nhập trong kỳ - Tồn cuối kỳ',
        inputs: [
          { label: 'Tồn đầu kỳ', value: `${formatCurrency(tonDauKy)} đồng` },
          { label: 'Nhập trong kỳ', value: `${formatCurrency(nhapTrongKy)} đồng` },
          { label: 'Tồn cuối kỳ', value: `${formatCurrency(tonCuoiKy)} đồng` }
        ],
        steps: [
          `Giá vốn = ${formatCurrency(tonDauKy)} + ${formatCurrency(nhapTrongKy)} - ${formatCurrency(tonCuoiKy)}`,
          `Giá vốn = ${formatCurrency(value)} đồng`
        ],
        result: `Giá vốn hàng bán = ${formatCurrency(value)} đồng`
      });
    }
    return stepFormatter({
      title: 'Tính giá vốn hàng bán',
      formula: 'Giá vốn = Tồn đầu kỳ + Nhập trong kỳ - Tồn cuối kỳ',
      note: missingFieldsMessage(labels, ['ton_dau_ky', 'nhap_trong_ky'], entities) || 'Nên cung cấp 3 số: tồn đầu kỳ, nhập trong kỳ, tồn cuối kỳ.'
    });
  }

  if (topic === 'vat_dau_ra' || topic === 'vat_dau_vao') {
    const giaChuaVat = pick(entities, 'gia_chua_vat', 0) ?? pick(entities, 'doanh_thu', 0);
    const rate = extractVatRate(text, entities);
    if (giaChuaVat !== null) {
      const value = giaChuaVat * rate;
      return stepFormatter({
        title: topic === 'vat_dau_ra' ? 'Tính VAT đầu ra' : 'Tính VAT đầu vào',
        question: text,
        formula: 'VAT = Giá chưa VAT × Thuế suất',
        inputs: [
          { label: 'Giá chưa VAT', value: `${formatCurrency(giaChuaVat)} đồng` },
          { label: 'Thuế suất', value: `${rate * 100}%` }
        ],
        steps: [
          `VAT = ${formatCurrency(giaChuaVat)} × ${rate * 100}%`,
          `VAT = ${formatCurrency(value)} đồng`
        ],
        result: `VAT = ${formatCurrency(value)} đồng`
      });
    }
    return stepFormatter({
      title: topic === 'vat_dau_ra' ? 'Tính VAT đầu ra' : 'Tính VAT đầu vào',
      formula: 'VAT = Giá chưa VAT × Thuế suất',
      note: 'Bạn nên cung cấp giá chưa VAT. Nếu không ghi thuế suất, hệ thống mặc định 10%.'
    });
  }

  if (topic === 'diem_hoa_von') {
    const doanhThu = pick(entities, 'doanh_thu', 0);
    const giaVon = pick(entities, 'gia_von', 1);
    const chiPhi = pick(entities, 'chi_phi', 2);
    if (doanhThu !== null && giaVon !== null && chiPhi !== null) {
      const loiNhuan = doanhThu - giaVon - chiPhi;
      return stepFormatter({
        title: 'Tính điểm hòa vốn (ước lượng)',
        question: text,
        formula: 'Doanh thu - Giá vốn - Chi phí = 0',
        inputs: [
          { label: 'Doanh thu', value: `${formatCurrency(doanhThu)} đồng` },
          { label: 'Giá vốn', value: `${formatCurrency(giaVon)} đồng` },
          { label: 'Chi phí', value: `${formatCurrency(chiPhi)} đồng` }
        ],
        steps: [
          `Lợi nhuận = ${formatCurrency(doanhThu)} - ${formatCurrency(giaVon)} - ${formatCurrency(chiPhi)} = ${formatCurrency(loiNhuan)} đồng`,
          `Nếu lợi nhuận = 0 thì doanh thu hòa vốn xấp xỉ ${formatCurrency(doanhThu - loiNhuan)} đồng`,
        ],
        result: `Lợi nhuận ước tính = ${formatCurrency(loiNhuan)} đồng (mức hòa vốn khi lợi nhuận = 0)`
      });
    }
    return stepFormatter({
      title: 'Tính điểm hòa vốn',
      formula: 'Điểm hòa vốn có thể tính với doanh thu, giá vốn và chi phí cố định/biến đổi.',
      note: missingFieldsMessage({ doanh_thu: 'doanh thu', gia_von: 'giá vốn', chi_phi: 'chi phí' }, ['doanh_thu', 'gia_von', 'chi_phi'], entities) || 'Bạn cần ít nhất doanh thu, giá vốn và chi phí để ước lượng.'
    });
  }

  if (topic === 'vong_quay_hang_ton_kho') {
    const giaVon = pick(entities, 'gia_von', 0);
    const tonCuoiKy = pick(entities, 'ton_cuoi_ky', 1);
    if (giaVon !== null && tonCuoiKy !== null && tonCuoiKy !== 0) {
      const vongQuay = giaVon / tonCuoiKy;
      return stepFormatter({
        title: 'Tính vòng quay hàng tồn kho',
        question: text,
        formula: 'Vòng quay hàng tồn kho = Giá vốn hàng bán / Tồn kho bình quân',
        inputs: [
          { label: 'Giá vốn', value: `${formatCurrency(giaVon)} đồng` },
          { label: 'Tồn cuối kỳ', value: `${formatCurrency(tonCuoiKy)} đồng` }
        ],
        steps: [
          `Vòng quay = ${formatCurrency(giaVon)} / ${formatCurrency(tonCuoiKy)} = ${vongQuay.toFixed(2)}`
        ],
        result: `Vòng quay hàng tồn kho ước tính = ${vongQuay.toFixed(2)} lần`,
      });
    }
    return stepFormatter({
      title: 'Tính vòng quay hàng tồn kho',
      formula: 'Vòng quay hàng tồn kho = Giá vốn hàng bán / Tồn kho bình quân',
      note: missingFieldsMessage({ gia_von: 'giá vốn', ton_cuoi_ky: 'tồn kho cuối kỳ' }, ['gia_von', 'ton_cuoi_ky'], entities) || 'Cần ít nhất giá vốn và tồn kho cuối kỳ.'
    });
  }

  // fallback cho câu hỏi kiểu tính toán chung khi biết ít nhất 2 số
  if ((entities.all_numbers || []).length >= 2) {
    const numbers = entities.all_numbers;
    if (/(cộng|cong|\+|tang|tăng)/.test(text)) {
      const res = numbers.reduce((a, b) => a + b, 0);
      return stepFormatter({
        title: 'Tính cộng nhanh',
        question: text,
        formula: numbers.map((n) => formatCurrency(n)).join(' + '),
        steps: [`Kết quả: ${formatCurrency(res)} đồng`],
        result: `${formatCurrency(res)} đồng`
      });
    }
    if (/(trừ|tru|giam|giảm|\-)/.test(text)) {
      const res = numbers.reduce((a, b) => a - b);
      return stepFormatter({
        title: 'Tính trừ nhanh',
        question: text,
        formula: numbers.map((n, i) => (i === 0 ? formatCurrency(n) : `- ${formatCurrency(n)}`)).join(' '),
        steps: [`Kết quả: ${formatCurrency(res)} đồng`],
        result: `${formatCurrency(res)} đồng`
      });
    }
    if (/(nhân|nhan|x|\*)/.test(text)) {
      const res = numbers.reduce((a, b) => a * b);
      return stepFormatter({
        title: 'Tính nhân nhanh',
        question: text,
        formula: numbers.map((n) => formatCurrency(n)).join(' × '),
        steps: [`Kết quả: ${formatCurrency(res)} đồng`],
        result: `${formatCurrency(res)} đồng`
      });
    }
    if (/chia|\//.test(text)) {
      const res = numbers.slice(1).reduce((a, b) => a / b, numbers[0]);
      return stepFormatter({
        title: 'Tính chia nhanh',
        question: text,
        formula: numbers.map((n, i) => (i === 0 ? formatCurrency(n) : `/ ${formatCurrency(n)}`)).join(' '),
        steps: [`Kết quả: ${res.toFixed(2)} (khi hợp lý)`],
        result: `${res.toFixed(2)}`
      });
    }
  }

  return null;
}

function buildAnswerByIntent(intent, topic, topicData, text) {
  if (intent === 'calculation') {
    const calculated = calculateByTopic(topic, text);
    if (calculated) return calculated;
    return `📘 ${topicData.title}
- Định nghĩa: ${topicData.definition || 'Chưa có định nghĩa.'}
- Giải thích: ${topicData.explanation || 'Chưa có giải thích.'}
- Công thức: ${topicData.calculation || 'Hiện chưa có công thức riêng cho chủ đề này.'}
- Ví dụ: ${topicData.example || 'Chưa có ví dụ.'}`;
  }

  switch (intent) {
    case 'definition':
      return `📘 ${topicData.title}
- Định nghĩa: ${topicData.definition || ''}
- Giải thích: ${topicData.explanation || ''}
- Ví dụ: ${topicData.example || ''}
- Ghi chú: ${topicData.note || ''}`;
    case 'recognition':
      return `📘 ${topicData.title}
- Định nghĩa: ${topicData.definition || ''}
- Giải thích: ${topicData.explanation || ''}
- Điều kiện ghi nhận: ${topicData.recognition || 'Hiện chưa có điều kiện ghi nhận riêng.'}`;
    case 'example':
      return `📘 ${topicData.title}
- Định nghĩa: ${topicData.definition || ''}
- Ví dụ: ${topicData.example || 'Hiện chưa có ví dụ riêng.'}`;
    case 'account':
      return `📘 ${topicData.title}
- Định nghĩa: ${topicData.definition || ''}
- Giải thích: ${topicData.explanation || ''}
- Ghi chú: ${topicData.note || ''}`;
    default:
      return `📘 ${topicData.title}
- Định nghĩa: ${topicData.definition || ''}
- Giải thích: ${topicData.explanation || ''}
- Ví dụ: ${topicData.example || ''}
- Ghi chú: ${topicData.note || ''}`;
  }
}


function buildSalesPurchaseAnswer(text) {
  const cases = [
    {
      pattern: /(mua hang chua thanh toan|mua hang no nha cung cap|mua hang chua tra tien)/,
      answer: `📦 Nghiệp vụ mua hàng chưa thanh toán
- Bút toán thường gặp:
  Nợ 156/152/153: Giá mua chưa thuế
  Nợ 1331: Thuế GTGT đầu vào được khấu trừ
  Có 331: Tổng giá thanh toán phải trả người bán
- Ý nghĩa: hàng đã nhận và ghi tăng công nợ phải trả.
- Ví dụ: mua hàng giá chưa VAT 100 triệu, VAT 10% thì ghi Nợ 156: 100 triệu; Nợ 1331: 10 triệu; Có 331: 110 triệu.`
    },
    {
      pattern: /(mua hang thanh toan ngay|mua hang bang tien mat|mua hang chuyen khoan ngay)/,
      answer: `📦 Nghiệp vụ mua hàng thanh toán ngay
- Nếu trả bằng tiền mặt:
  Nợ 156/152/153
  Nợ 1331
  Có 111
- Nếu chuyển khoản:
  Nợ 156/152/153
  Nợ 1331
  Có 112
- Lưu ý: phân biệt rõ chi phí thu mua, vận chuyển, bốc xếp để cộng vào giá gốc hàng tồn kho nếu đủ điều kiện.`
    },
    {
      pattern: /(ban hang chua thu tien|ban chiu|ban hang cho khach no|ban hang chua thanh toan)/,
      answer: `🧾 Nghiệp vụ bán hàng chưa thu tiền
- Ghi nhận doanh thu và phải thu:
  Nợ 131: Tổng giá thanh toán
  Có 511: Doanh thu chưa VAT
  Có 3331: Thuế GTGT đầu ra
- Đồng thời ghi nhận giá vốn:
  Nợ 632
  Có 156
- Ví dụ: bán hàng giá chưa VAT 200 triệu, VAT 10%, giá vốn 150 triệu → Nợ 131: 220; Có 511: 200; Có 3331: 20; Nợ 632: 150; Có 156: 150.`
    },
    {
      pattern: /(ban hang thu tien ngay|ban hang bang tien mat|ban hang chuyen khoan)/,
      answer: `🧾 Nghiệp vụ bán hàng thu tiền ngay
- Thu tiền mặt:
  Nợ 111
  Có 511
  Có 3331
- Thu qua ngân hàng:
  Nợ 112
  Có 511
  Có 3331
- Đồng thời:
  Nợ 632
  Có 156
- Cần tách riêng doanh thu, VAT đầu ra và giá vốn.`
    },
    {
      pattern: /(hang mua dang di duong|hang ve chua co hoa don|hoa don ve sau)/,
      answer: `🚚 Hàng mua đang đi đường / hàng về chưa đủ chứng từ
- Nếu hàng đang đi đường cuối kỳ: thường theo dõi TK 151.
- Khi nhận hàng và đủ chứng từ thì kết chuyển vào 156/152.
- Nếu hàng về trước hóa đơn, cần theo dõi tạm nhập và hoàn thiện chứng từ để hạch toán VAT đúng thời điểm, tránh kê khai sai kỳ.`
    },
    {
      pattern: /(chiet khau thuong mai|giam gia hang ban|hang ban bi tra lai)/,
      answer: `🔁 Các khoản giảm trừ doanh thu
- Chiết khấu thương mại: dùng TK 5211
- Hàng bán bị trả lại: dùng TK 5212
- Giảm giá hàng bán: dùng TK 5213
- Cuối kỳ kết chuyển giảm doanh thu vào TK 511 để xác định doanh thu thuần.
- Khi khách trả hàng còn cần xem xét nhập lại kho và điều chỉnh giá vốn nếu hàng nhận lại được.`
    },
    {
      pattern: /(tra tien cho nha cung cap|thanh toan cong no nguoi ban|tra no 331)/,
      answer: `💳 Thanh toán công nợ người bán
- Trả bằng tiền mặt: Nợ 331 / Có 111
- Trả bằng chuyển khoản: Nợ 331 / Có 112
- Nếu được hưởng chiết khấu thanh toán, phần được giảm có thể ghi nhận vào doanh thu hoạt động tài chính theo chính sách áp dụng.`
    },
    {
      pattern: /(khach hang thanh toan no|thu no khach hang|thu cong no 131)/,
      answer: `💰 Thu nợ khách hàng
- Thu tiền mặt: Nợ 111 / Có 131
- Thu qua ngân hàng: Nợ 112 / Có 131
- Nếu khách trả trước tiền hàng thì có thể phát sinh Có 131 trước, sau đó khi giao hàng mới ghi nhận doanh thu.`
    }
  ];

  cases.push(
    {
      pattern: /(tra truoc cho nguoi ban|ung truoc cho nguoi ban|dat coc mua hang)/,
      answer: '📦 Ứng trước cho người bán: trước hết ghi nhận khoản trả trước hoặc giảm công nợ phải trả tùy tình huống. Khi hàng và hóa đơn về, mới ghi nhận hàng tồn kho, VAT đầu vào và cấn trừ với số đã ứng trước. Điểm cần giữ chắc là: ứng trước không làm hàng tồn kho tăng ngay nếu hàng chưa về.'
    },
    {
      pattern: /(khach tra truoc|nguoi mua tra tien truoc|nhan tien coc cua khach)/,
      answer: '🧾 Khách hàng trả trước tiền hàng: về bản chất doanh nghiệp đang nhận trước tiền nhưng chưa chắc đã đủ điều kiện ghi doanh thu. Khi giao hàng hoặc hoàn thành nghĩa vụ, kế toán mới ghi nhận doanh thu, VAT đầu ra và giảm khoản đã nhận trước.'
    },
    {
      pattern: /(chi phi van chuyen.*mua hang|mua hang.*chi phi van chuyen|chi phi thu mua|boc xep.*mua hang)/,
      answer: '🚚 Chi phí vận chuyển, bốc xếp, bảo quản trong quá trình mua nếu gắn trực tiếp với việc đưa hàng về địa điểm và trạng thái sẵn sàng sử dụng hoặc bán thì thường được tính vào giá gốc hàng tồn kho. Vì vậy đừng chỉ nhìn hóa đơn mua hàng, mà cần cộng cả chi phí thu mua hợp lý.'
    },
    {
      pattern: /(ban dai ly|hang gui ban|gui dai ly)/,
      answer: '📦 Với hàng gửi bán hoặc bán qua đại lý, doanh thu chưa nên ghi nhận ngay tại thời điểm gửi hàng nếu chưa chuyển giao quyền bán cho khách cuối. Trước hết cần theo dõi hàng gửi đi, đến khi hàng bán được và đủ điều kiện mới ghi nhận doanh thu, VAT và giá vốn.'
    },
    {
      pattern: /(mua hang duoc chiet khau|giam gia mua hang|tra lai hang mua)/,
      answer: '🔁 Nếu phát sinh chiết khấu, giảm giá hoặc trả lại hàng mua, kế toán cần điều chỉnh giảm giá trị hàng mua hoặc công nợ phải trả tương ứng. Trường hợp hàng đã nhập kho và sau đó trả lại, còn phải xem lại phần giá trị tồn kho, VAT đầu vào và chứng từ điều chỉnh liên quan.'
    }
  );

  const matched = cases.find(item => item.pattern.test(text));
  if (matched) return matched.answer;

  return `📚 Nghiệp vụ mua bán hàng hóa thường gặp mà ${BOT_NAME} hỗ trợ:
- Mua hàng chưa thanh toán
- Mua hàng thanh toán ngay bằng 111/112
- Bán hàng chưa thu tiền hoặc thu tiền ngay
- Hàng mua đang đi đường, hàng về chưa có hóa đơn
- Chiết khấu thương mại, giảm giá hàng bán, hàng bán bị trả lại
- Thu nợ khách hàng, trả nợ nhà cung cấp

Bạn có thể hỏi cụ thể như:
- “Mua hàng chưa thanh toán định khoản thế nào?”
- “Bán chịu cho khách định khoản ra sao?”
- “Hàng bán bị trả lại hạch toán thế nào?”`;
}

function buildStudentFaqAnswer(text) {
  const faq = [
    {
      pattern: /(ke toan la gi|hoc ke toan la gi)/,
      answer: `🎓 Kế toán là hệ thống thu thập, xử lý, kiểm tra và cung cấp thông tin kinh tế tài chính dưới hình thức giá trị, hiện vật và thời gian lao động. Nói đơn giản, kế toán giúp doanh nghiệp biết mình có gì, nợ gì, lãi hay lỗ.`
    },
    {
      pattern: /(hoc ke toan bat dau tu dau|moi hoc ke toan nen hoc gi truoc)/,
      answer: `🎓 Với sinh viên mới học kế toán, nên đi theo thứ tự:
1. Hiểu phương trình kế toán: Tài sản = Nợ phải trả + Vốn chủ sở hữu
2. Học kết cấu tài khoản và nguyên tắc ghi Nợ/Có
3. Học định khoản các nghiệp vụ cơ bản
4. Học sổ sách và báo cáo tài chính
5. Luyện bài tập tổng hợp mua - bán - thu - chi - kết chuyển.`
    },
    {
      pattern: /(no co la gi|ghi no ghi co nhu the nao|phan biet no va co)/,
      answer: `🎓 Nợ/Có không phải là thu/chi đơn thuần.
- Với tài sản và chi phí: tăng ghi Nợ, giảm ghi Có.
- Với nguồn vốn, nợ phải trả, doanh thu: tăng ghi Có, giảm ghi Nợ.
Muốn định khoản đúng, trước hết phải xác định nghiệp vụ làm tăng hay giảm tài khoản nào.`
    },
    {
      pattern: /(tai sao phai hoc dinh khoan|dinh khoan quan trong nhu the nao)/,
      answer: `🎓 Định khoản là nền tảng của kế toán vì mọi báo cáo đều đi lên từ bút toán. Nếu định khoản sai thì sổ cái, công nợ, tồn kho và báo cáo tài chính đều sai theo.`
    },
    {
      pattern: /(ke toan tong hop la gi|ke toan no i gi|ke toan thue la gi)/,
      answer: `🎓 Một số vị trí cơ bản:
- Kế toán nội bộ: theo dõi thu chi, công nợ, tồn kho, báo cáo quản trị.
- Kế toán thuế: hóa đơn, kê khai, quyết toán, làm việc với cơ quan thuế.
- Kế toán tổng hợp: tập hợp số liệu từ các phần hành để lên báo cáo tài chính.`
    },
    {
      pattern: /(sinh vien ke toan can ky nang gi|can hoc excel khong|can hoc phan mem gi)/,
      answer: `🎓 Sinh viên kế toán nên rèn:
- Excel: SUMIFS, XLOOKUP/VLOOKUP, Pivot, lọc dữ liệu
- Tư duy định khoản
- Cẩn thận với chứng từ và số liệu
- Kỹ năng đọc báo cáo tài chính
- Làm quen phần mềm như MISA, FAST hoặc ERP cơ bản.`
    },
    {
      pattern: /(lam sao de hoc ke toan tot|cach tu hoc ke toan)/,
      answer: `🎓 Cách học hiệu quả:
- Mỗi ngày luyện 5–10 nghiệp vụ định khoản
- Tự vẽ sơ đồ tài khoản tăng/giảm
- Làm bài từ chứng từ → bút toán → sổ → báo cáo
- Học đi đôi với Excel và hóa đơn thực tế
- Sau mỗi chương tự tóm tắt công thức và tài khoản hay dùng.`
    }
  ];
  const matched = faq.find(item => item.pattern.test(text));
  if (matched) return matched.answer;
  return `🎓 FAQ kế toán cho sinh viên mà ${BOT_NAME} hỗ trợ:
- Kế toán là gì?
- Học kế toán bắt đầu từ đâu?
- Phân biệt Nợ/Có thế nào?
- Kế toán nội bộ, thuế, tổng hợp khác nhau ra sao?
- Sinh viên kế toán cần kỹ năng gì?
- Tự học kế toán thế nào cho hiệu quả?

Bạn có thể hỏi trực tiếp từng câu, ví dụ: “Mới học kế toán nên bắt đầu từ đâu?”`;
}

function buildTaxPracticeAnswer(text) {
  const cases = [
    {
      pattern: /(hoa don dau vao hop le|dieu kien khau tru vat dau vao|khau tru thue gtgt dau vao)/,
      answer: `🧾 Điều kiện khấu trừ VAT đầu vào (thực hành)
- Có hóa đơn, chứng từ hợp pháp
- Hàng hóa dịch vụ phục vụ hoạt động chịu thuế
- Với hóa đơn giá trị lớn theo ngưỡng quy định, cần chứng từ thanh toán không dùng tiền mặt để đủ điều kiện khấu trừ
- Kê khai đúng kỳ và lưu đủ hồ sơ.
Thực tế khi kiểm tra, kế toán nên soát: tên công ty, MST, ngày hóa đơn, mặt hàng, thuế suất, chứng từ thanh toán.`
    },
    {
      pattern: /(thue gtgt phai nop tinh sao|vat phai nop la gi|tinh thue gtgt phai nop)/,
      answer: `🧾 Thuế GTGT phải nộp theo phương pháp khấu trừ:
Thuế GTGT phải nộp = Thuế GTGT đầu ra - Thuế GTGT đầu vào được khấu trừ.
- Nếu đầu ra lớn hơn đầu vào: doanh nghiệp phải nộp phần chênh lệch.
- Nếu đầu vào lớn hơn đầu ra: được khấu trừ chuyển kỳ sau theo quy định.`
    },
    {
      pattern: /(nop to khai thue gtgt khi nao|ke khai gtgt theo thang hay quy|han nop to khai)/,
      answer: `🧾 Về thực hành kê khai, doanh nghiệp cần xác định mình kê khai theo tháng hay theo quý theo tiêu chí áp dụng của kỳ hiện hành. Sau đó cần chuẩn bị hóa đơn đầu ra, đầu vào, bảng kê và nộp tờ khai đúng hạn của kỳ kê khai. Khi làm thực tế, nên khóa sổ hóa đơn trước hạn vài ngày để tránh thiếu chứng từ.`
    },
    {
      pattern: /(chi phi duoc tru|chi phi khong duoc tru|tndn duoc tru)/,
      answer: `🧾 Chi phí được trừ khi tính thuế TNDN thường cần đáp ứng:
- Phát sinh thực tế liên quan đến hoạt động sản xuất kinh doanh
- Có đủ hóa đơn chứng từ hợp pháp
- Với khoản chi có giá trị lớn theo ngưỡng quy định, có chứng từ thanh toán không dùng tiền mặt
Nếu thiếu 1 trong các điều kiện này, chi phí có thể bị loại khi quyết toán thuế.`
    },
    {
      pattern: /(tam nop thue tndn|tinh thue tndn tam tinh|thue tndn bao nhieu)/,
      answer: `🧾 Về thực hành, thuế TNDN tạm tính thường dựa trên lợi nhuận tính thuế trong kỳ và thuế suất áp dụng. Cách làm an toàn là:
1. Tập hợp doanh thu chịu thuế
2. Rà soát chi phí được trừ / không được trừ
3. Xác định thu nhập chịu thuế
4. Nhân với thuế suất để ra số tạm nộp.
Khi quyết toán cuối năm sẽ điều chỉnh theo số thực tế.`
    },
    {
      pattern: /(xuat hoa don khi nao|thoi diem xuat hoa don|lap hoa don luc nao)/,
      answer: `🧾 Thực hành hóa đơn: cần lập hóa đơn tại thời điểm bán hàng hóa hoặc hoàn thành cung cấp dịch vụ theo quy định áp dụng. Kế toán không nên để dồn hóa đơn cuối tháng nếu hàng đã giao trước đó vì dễ sai thời điểm ghi nhận doanh thu và thuế.`
    },
    {
      pattern: /(hoa don sai|viet sai hoa don|xu ly hoa don sai)/,
      answer: `🧾 Khi hóa đơn có sai sót, kế toán cần xác định sai trước hay sau khi gửi cho người mua, sai tên hàng, tiền hay MST để chọn cách xử lý phù hợp: lập hóa đơn thay thế, điều chỉnh hoặc biên bản xử lý theo quy trình đang áp dụng. Trong thực tế, nên lưu cả bản sai, biên bản và bản điều chỉnh để dễ giải trình.`
    }
  ];
  cases.push(
    {
      pattern: /(thue tncn|thue thu nhap ca nhan|khau tru tncn|quyet toan tncn)/,
      answer: '🧾 Với thuế TNCN, kế toán tiền lương thường cần xác định thu nhập chịu thuế, các khoản miễn giảm, người phụ thuộc và mức khấu trừ theo chính sách áp dụng. Khi làm thực tế, nên tách rõ bước tính lương gộp, bảo hiểm, thu nhập tính thuế và số thuế phải khấu trừ.'
    },
    {
      pattern: /(chi phi khong co hoa don|mua hang khong hoa don|hoa don sai mst)/,
      answer: '🧾 Các khoản chi thiếu hóa đơn hoặc hóa đơn có sai sót thường là vùng rủi ro lớn về thuế. Kế toán nên phân biệt rõ: khoản nào được hoàn thiện hồ sơ, khoản nào phải loại khi tính thuế, và khoản nào cần điều chỉnh hóa đơn hoặc chứng từ trước khi kê khai.'
    },
    {
      pattern: /(quyet toan thue|thanh tra thue|giai trinh thue)/,
      answer: '🧾 Khi chuẩn bị quyết toán hoặc giải trình thuế, nên gom hồ sơ theo từng nhóm: doanh thu, chi phí, lương, tài sản cố định, công nợ, hóa đơn đầu vào đầu ra và chứng từ thanh toán. Cách làm này giúp bạn tìm hồ sơ nhanh và tránh trả lời rời rạc khi cơ quan thuế hỏi.'
    }
  );
  const matched = cases.find(item => item.pattern.test(text));
  if (matched) return matched.answer;
  return `🧾 Chủ đề thuế thực hành mà ${BOT_NAME} hỗ trợ:
- Điều kiện khấu trừ VAT đầu vào
- Cách xác định VAT phải nộp
- Kê khai GTGT theo tháng/quý
- Chi phí được trừ khi tính thuế TNDN
- Tạm tính thuế TNDN
- Thời điểm xuất hóa đơn
- Xử lý hóa đơn sai sót

Bạn có thể hỏi cụ thể như: “Điều kiện khấu trừ VAT đầu vào là gì?”`;
}

function buildInterviewAnswer(text) {
  const cases = [
    {
      pattern: /(diem manh diem yeu|uu diem nhuoc diem)/,
      answer: `💼 Khi trả lời điểm mạnh/điểm yếu trong phỏng vấn kế toán:
- Điểm mạnh nên gắn với nghề: cẩn thận, tư duy số liệu, kỷ luật deadline, bám chứng từ tốt.
- Điểm yếu nên chọn điểm có thể cải thiện: ít kinh nghiệm phần mềm A nhưng đang tự học và đã thực hành trên dữ liệu mẫu.
Tránh trả lời quá chung chung như “em chăm chỉ” mà không có ví dụ.`
    },
    {
      pattern: /(tai sao ban muon lam ke toan|vi sao chon nghe ke toan|muc tieu nghe nghiep)/,
      answer: `💼 Gợi ý trả lời:
“Em chọn kế toán vì em phù hợp với công việc cần sự chính xác, logic và kỷ luật. Em muốn phát triển từ nền tảng hạch toán, thuế và báo cáo để sau này có thể đảm nhiệm vị trí kế toán tổng hợp.”`
    },
    {
      pattern: /(phong van ke toan thuong hoi gi|cau hoi phong van pho bien)/,
      answer: `💼 Các câu hỏi phỏng vấn kế toán thường gặp:
1. Em phân biệt kế toán nội bộ và kế toán thuế thế nào?
2. Em hiểu gì về tài sản, nợ phải trả, vốn chủ sở hữu?
3. Em định khoản nghiệp vụ mua hàng, bán hàng ra sao?
4. TK 131, 331, 111, 112 dùng để làm gì?
5. Doanh thu được ghi nhận khi nào?
6. Em xử lý hóa đơn sai sót thế nào?
7. Em dùng Excel và phần mềm kế toán nào?
8. Em từng đối chiếu công nợ, tồn kho, ngân hàng chưa?`
    },
    {
      pattern: /(kinh nghiem thuc te|chua co kinh nghiem|sinh vien moi ra truong)/,
      answer: `💼 Nếu chưa có nhiều kinh nghiệm, có thể trả lời:
“Em chưa có nhiều kinh nghiệm thực tế toàn bộ quy trình, nhưng em đã học và luyện định khoản, Excel, báo cáo tài chính và đang thực hành trên bộ chứng từ mẫu. Em tự tin ở khả năng học nhanh và cẩn thận với số liệu.”`
    },
    {
      pattern: /(excel trong ke toan|ban biet excel gi|ham excel)/,
      answer: `💼 Với câu hỏi về Excel, nên nêu đúng kỹ năng phục vụ kế toán:
- SUM, SUMIFS, IF
- XLOOKUP/VLOOKUP
- Pivot Table
- Lọc trùng, đối chiếu dữ liệu
- Định dạng số liệu và kiểm tra chênh lệch.
Nếu có ví dụ thực tế như đối chiếu công nợ hoặc tổng hợp bán hàng thì càng tốt.`
    }
  ];
  const matched = cases.find(item => item.pattern.test(text));
  if (matched) return matched.answer;
  return `💼 Finiip có thể hỗ trợ câu hỏi phỏng vấn kế toán theo 3 nhóm:
- Câu hỏi kiến thức nền: tài khoản, định khoản, doanh thu, chi phí
- Câu hỏi kỹ năng: Excel, phần mềm, đối chiếu số liệu
- Câu hỏi HR: điểm mạnh, điểm yếu, mục tiêu nghề nghiệp, chưa có kinh nghiệm thì trả lời sao

Bạn có thể hỏi cụ thể như:
- “Phỏng vấn kế toán thường hỏi gì?”
- “Chưa có kinh nghiệm thì trả lời sao?”
- “Điểm mạnh điểm yếu khi phỏng vấn kế toán?”`;
}

function buildFlexibleAnswer(text) {
  if (/moi hoc|bat dau tu dau|tu hoc/.test(text) && /ke toan/.test(text)) {
    return { type: 'student_faq', topic: 'student_faq', answer: buildStudentFaqAnswer('hoc ke toan bat dau tu dau') };
  }

  if (/(mua|ban|thu no|tra no)/.test(text) && /(hang|khach|nha cung cap|cong no)/.test(text)) {
    return { type: 'sales_purchase', topic: 'sales_purchase', answer: buildSalesPurchaseAnswer(text) };
  }

  if (/(vat|thue|hoa don)/.test(text) && /(khau tru|ke khai|nop|xuat|sai|dau vao|dau ra|phai nop)/.test(text)) {
    return { type: 'tax_practice', topic: 'tax_practice', answer: buildTaxPracticeAnswer(text) };
  }

  if (/(phong van|xin viec|ung tuyen)/.test(text) && /ke toan/.test(text)) {
    return { type: 'interview', topic: 'interview', answer: buildInterviewAnswer(text) };
  }

  if (/tai khoan|tk\s|111|112|131|331|3331/.test(text) && /(tang|giam|so du|ben no|ben co)/.test(text)) {
    const answer = describeAccount(text);
    if (answer) return { type: 'account_side', topic: 'account_side', answer };
  }

  return null;
}


function findKnowledgeBySemantic(text) {
  const entries = Object.entries(knowledge)
    .map(([key, value]) => {
      const haystack = normalizeText([
        key,
        value.title,
        value.definition,
        value.explanation,
        value.example,
        value.calculation,
        value.note
      ].filter(Boolean).join(' '));
      const keywords = Array.from(new Set(haystack.split(' ').filter(Boolean))).filter(word => word.length > 2);
      let score = 0;
      for (const word of keywords.slice(0, 60)) {
        if (text.includes(word)) score += word.length >= 6 ? 2 : 1;
      }
      return { key, value, score };
    })
    .sort((a, b) => b.score - a.score);

  return entries[0] && entries[0].score >= 3 ? entries[0] : null;
}

function buildExtendedAccountingAnswer(text) {
  if (/nguyen tac phu hop/.test(text)) {
    return { type: 'knowledge', topic: 'nguyen_tac_phu_hop', answer: buildAnswerByIntent('definition', 'nguyen_tac_phu_hop', knowledge.nguyen_tac_phu_hop, text) };
  }
  if (/co so don tich/.test(text)) {
    return { type: 'knowledge', topic: 'co_so_don_tich', answer: buildAnswerByIntent('definition', 'co_so_don_tich', knowledge.co_so_don_tich, text) };
  }
  if (/chi phi tra truoc/.test(text)) {
    return { type: 'knowledge', topic: 'chi_phi_tra_truoc', answer: buildAnswerByIntent('definition', 'chi_phi_tra_truoc', knowledge.chi_phi_tra_truoc, text) };
  }
  if (/chi phi phai tra/.test(text)) {
    return { type: 'knowledge', topic: 'chi_phi_phai_tra', answer: buildAnswerByIntent('definition', 'chi_phi_phai_tra', knowledge.chi_phi_phai_tra, text) };
  }
  if (/doanh thu chua thuc hien/.test(text)) {
    return { type: 'knowledge', topic: 'doanh_thu_chua_thuc_hien', answer: buildAnswerByIntent('definition', 'doanh_thu_chua_thuc_hien', knowledge.doanh_thu_chua_thuc_hien, text) };
  }
  if (/vong quay phai thu/.test(text)) {
    return { type: 'knowledge', topic: 'vong_quay_phai_thu', answer: buildAnswerByIntent('definition', 'vong_quay_phai_thu', knowledge.vong_quay_phai_thu, text) };
  }
  if (/vong quay hang ton kho/.test(text)) {
    return { type: 'knowledge', topic: 'vong_quay_hang_ton_kho', answer: buildAnswerByIntent('definition', 'vong_quay_hang_ton_kho', knowledge.vong_quay_hang_ton_kho, text) };
  }
  if (/diem hoa von/.test(text)) {
    return { type: 'knowledge', topic: 'diem_hoa_von', answer: buildAnswerByIntent('definition', 'diem_hoa_von', knowledge.diem_hoa_von, text) };
  }
  if (/(thue thu nhap ca nhan|thue tncn)/.test(text)) {
    return { type: 'knowledge', topic: 'thue_tncn', answer: buildAnswerByIntent('definition', 'thue_tncn', knowledge.thue_tncn, text) };
  }

  const longCases = [
    {
      pattern: /(chi phi khong co hoa don|mua hang khong hoa don|hoa don sai mst)/,
      answer: '🧾 Các khoản chi thiếu hóa đơn hoặc hóa đơn có sai sót là vùng rủi ro thuế rất lớn. Cách xử lý an toàn là tách riêng từng khoản, kiểm tra khả năng bổ sung chứng từ, đánh giá tính hợp lệ để kê khai, rồi xác định khoản nào phải loại khi tính thuế.'
    },
    {
      pattern: /(chi phi van chuyen|chi phi thu mua|boc xep).*(mua hang|hang mua)/,
      answer: '📦 Với hàng mua, chi phí vận chuyển, bốc xếp, bảo hiểm liên quan trực tiếp đến việc đưa hàng về kho thường được tính vào giá gốc hàng tồn kho nếu đủ điều kiện. Nghĩa là ngoài giá mua chưa thuế, bạn cần cộng thêm chi phí thu mua hợp lý để xác định đúng trị giá nhập kho.'
    },
    {
      pattern: /(tra truoc cho nguoi ban|ung truoc cho nha cung cap|dat coc mua hang)/,
      answer: '💳 Nếu doanh nghiệp ứng trước cho người bán, bản chất là đã phát sinh khoản trả trước chứ chưa ghi nhận ngay hàng tồn kho nếu hàng chưa về. Khi nhận hàng và hóa đơn đầy đủ, kế toán mới ghi nhận hàng, VAT đầu vào và bù trừ với khoản đã ứng trước.'
    },
    {
      pattern: /(nguoi mua tra tien truoc|khach hang tra truoc|nhan coc cua khach)/,
      answer: '🧾 Khi người mua trả tiền trước, doanh nghiệp thường ghi nhận nghĩa vụ phải giao hàng hoặc theo dõi trên công nợ khách hàng trước. Chỉ khi hàng đã giao hoặc dịch vụ đã hoàn thành thì mới ghi nhận doanh thu và thuế đầu ra theo đúng thời điểm.'
    },
    {
      pattern: /(luong|bao hiem|bhxh|bhyt|bhtn)/,
      answer: '👥 Với nghiệp vụ lương, kế toán thường đi theo 3 bước: tính lương phải trả, trích các khoản bảo hiểm theo quy định áp dụng, rồi thanh toán lương và nộp bảo hiểm hoặc thuế. Nếu bạn muốn, mình có thể viết riêng bút toán mẫu cho từng bước.'
    },
    {
      pattern: /(thanh ly|nhuong ban).*(tai san|tscd)/,
      answer: '🏭 Với thanh lý hoặc nhượng bán tài sản cố định, cần tách ít nhất 3 phần: xóa nguyên giá và hao mòn lũy kế, ghi nhận khoản thu từ thanh lý, và xác định lãi lỗ từ nghiệp vụ này. Nếu có số liệu, mình có thể định khoản từng dòng cho bạn.'
    },
    {
      pattern: /(doi chieu ngan hang|sao ke ngan hang|chenh lech sao ke)/,
      answer: '🏦 Khi đối chiếu ngân hàng, nên kiểm tra tuần tự: số dư đầu kỳ, các khoản thu hoặc chi treo, phí ngân hàng, tiền đang chuyển, khoản hạch toán nhầm tài khoản hoặc sai ngày. Làm theo checklist này thường sẽ tìm ra chênh lệch nhanh hơn.'
    },
    {
      pattern: /(kiem ke|thua thieu|chenh lech kiem ke)/,
      answer: '📋 Chênh lệch kiểm kê không nên hạch toán vội. Bước an toàn là lập biên bản kiểm kê, xác định nguyên nhân, xác định trách nhiệm bồi thường hoặc xử lý cho phép, rồi mới ghi bút toán điều chỉnh để số liệu cuối cùng phản ánh đúng thực tế.'
    }
  ];

  const hit = longCases.find(item => item.pattern.test(text));
  if (hit) return { type: 'extended_accounting', topic: 'extended_accounting', answer: hit.answer };

  const semantic = findKnowledgeBySemantic(text);
  if (semantic) {
    return {
      type: 'knowledge',
      topic: semantic.key,
      answer: buildAnswerByIntent('definition', semantic.key, semantic.value, text)
    };
  }
  return null;
}

function buildGeneralAnswer() {
  return `Mình là ${BOT_NAME} – AI kế toán. Bạn có thể hỏi khá nhiều mảng liên quan đến kế toán, ví dụ:
- Kiến thức nền: “Tài sản là gì?”, “Cơ sở dồn tích là gì?”, “Nguyên tắc phù hợp là gì?”
- Tài khoản: “TK 111 tăng bên nào?”, “TK 334 dùng để làm gì?”, “TK 911 kết chuyển ra sao?”
- Mua bán hàng hóa: “Mua hàng có VAT và chi phí vận chuyển thì hạch toán sao?”, “Khách trả trước tiền hàng xử lý thế nào?”
- Tồn kho và giá vốn: “FIFO là gì?”, “Bình quân gia quyền là gì?”, “Giá vốn tính thế nào?”
- Thuế: “Điều kiện khấu trừ VAT đầu vào là gì?”, “Chi phí được trừ khi tính thuế TNDN là gì?”
- Tiền lương và bảo hiểm: “Tính lương và trích bảo hiểm hạch toán sao?”
- Tài sản cố định: “Khấu hao đường thẳng là gì?”, “Thanh lý tài sản cố định hạch toán thế nào?”
- Phân tích tài chính: “Điểm hòa vốn là gì?”, “Vòng quay hàng tồn kho tính sao?”
- Báo cáo: “Xuất Excel cho danh sách nghiệp vụ này”`;
}

function answerQuestion(question) {
  const normalized = normalizeText(question);
  const expanded = applySynonyms(normalized);
  const wantsExcel = /(xuat excel|file excel|bao cao excel|export excel|\.xls|\.xlsx)/.test(expanded) || /(\.xls|\.xlsx)/i.test(question);
  const exportFormat = /(\.xls|dinh dang xls|file xls)/.test(expanded) ? 'xls' : 'xlsx';
  const intent = classifyIntent(expanded);

  if (intent === 'greeting') return { type: intent, topic: 'greeting', answer: buildGreetingAnswer() };
  if (intent === 'introduction') return { type: intent, topic: 'introduction', answer: buildIntroductionAnswer() };
  if (intent === 'capabilities') return { type: intent, topic: 'capabilities', answer: buildCapabilitiesAnswer() };
  if (intent === 'thanks') return { type: intent, topic: 'thanks', answer: `😊 Không có gì. ${BOT_NAME} luôn sẵn sàng hỗ trợ bạn về kế toán.` };
  if (intent === 'farewell') return { type: intent, topic: 'farewell', answer: `👋 Tạm biệt! Khi cần, cứ quay lại hỏi ${BOT_NAME} về kế toán nhé.` };
  if (intent === 'comparison') return buildComparisonAnswer(expanded);
  if (intent === 'sales_purchase') return { type: intent, topic: 'sales_purchase', answer: buildSalesPurchaseAnswer(expanded) };
  if (intent === 'student_faq') return { type: intent, topic: 'student_faq', answer: buildStudentFaqAnswer(expanded) };
  if (intent === 'tax_practice') return { type: intent, topic: 'tax_practice', answer: buildTaxPracticeAnswer(expanded) };
  if (intent === 'interview') return { type: intent, topic: 'interview', answer: buildInterviewAnswer(expanded) };

  if (intent === 'file_import') {
    try {
      const filePath = extractPathFromText(question) || extractPathFromText(expanded);
      const imported = importTransactionsFromFile(filePath);
      const report = imported.importMode !== 'transactions'
        ? buildAccountingReport('', { exportExcel: wantsExcel, exportFormat, records: imported.records, entries: imported.templateJournal.entries, importIssues: imported.templateJournal.issues })
        : buildAccountingReport(`danh sach nghiep vu:\n${imported.transactions.join('\n')}`, { exportExcel: wantsExcel, exportFormat, records: imported.records });
      const modeLabel = imported.importMode === 'transactions' ? 'mô tả nghiệp vụ' : (imported.importMode === 'paired' ? 'định khoản cặp Nợ/Có' : 'dòng nhật ký Nợ/Có');
      return {
        type: intent,
        topic: 'file_import',
        answer: `Đã nhập file ${imported.fileName} theo chế độ ${modeLabel} với ${imported.count} dòng dữ liệu.

${report.answer}`,
        importSummary: imported,
        exportPath: report.exportPath,
        exportFilename: report.exportPath ? path.basename(report.exportPath) : null,
        discrepancies: report.discrepancies || []
      };
    } catch (error) {
      return {
        type: intent,
        topic: 'file_import',
        answer: `Mình đã nhận ra bạn muốn đọc file, nhưng ${error.message}`
      };
    }
  }

  if (intent === 'excel_export') {
    const report = buildAccountingReport(expanded, { exportExcel: true, exportFormat });
    return {
      type: intent,
      topic: 'excel_export',
      answer: report.answer,
      exportPath: report.exportPath,
      exportFilename: report.exportPath ? path.basename(report.exportPath) : null
    };
  }

  if (intent === 'accounting_report') {
    if (!/(vong quay|diem hoa von|fifo|binh quan gia quyen|nguyen tac phu hop|co so don tich|nguyen tac than trong|doi chieu ngan hang|du phong phai thu kho doi|doanh thu chua thuc hien|chi phi tra truoc|chi phi phai tra|hang gui ban|thue thu nhap ca nhan|thue tncn)/.test(expanded)) {
      const report = buildAccountingReport(expanded, { exportExcel: false });
      return { type: intent, topic: 'accounting_report', answer: report.answer, statements: report.statements, subledgers: report.subledgers, discrepancies: report.discrepancies };
    }
  }

  if (intent === 'journal_entry') {
    return { type: intent, topic: 'journal_entry', answer: buildJournalEntry(expanded) };
  }

  if (intent === 'account_side') {
    const answer = describeAccount(expanded);
    return { type: intent, topic: 'account_side', answer: answer || 'Mình chưa xác định được tài khoản bạn đang hỏi bên Nợ/Có.' };
  }

  if (/(khach tra truoc|nguoi mua tra tien truoc|nhan tien coc cua khach)/.test(expanded)) {
    return { type: 'sales_purchase', topic: 'sales_purchase', answer: buildSalesPurchaseAnswer(expanded) };
  }

  if (/(vong quay|diem hoa von|fifo|binh quan gia quyen|nguyen tac phu hop|co so don tich|nguyen tac than trong|doi chieu ngan hang|du phong phai thu kho doi|doanh thu chua thuc hien|chi phi tra truoc|chi phi phai tra|hang gui ban|hang mua dang di duong|thue thu nhap ca nhan|thue tncn|chi phi khong co hoa don|mua hang khong hoa don|hoa don sai mst)/.test(expanded)) {
    const extendedFirst = buildExtendedAccountingAnswer(expanded);
    if (extendedFirst) return extendedFirst;
  }

  const flexible = buildFlexibleAnswer(expanded);
  if (flexible) return flexible;

  const extended = buildExtendedAccountingAnswer(expanded);
  if (extended) return extended;

  if (intent === 'general') {
    return { type: intent, topic: 'general', answer: buildGeneralAnswer() };
  }

  if (/nguyen tac phu hop/.test(expanded)) {
    return { type: intent, topic: 'nguyen_tac_phu_hop', answer: buildAnswerByIntent(intent, 'nguyen_tac_phu_hop', knowledge.nguyen_tac_phu_hop, expanded) };
  }
  if (/co so don tich/.test(expanded)) {
    return { type: intent, topic: 'co_so_don_tich', answer: buildAnswerByIntent(intent, 'co_so_don_tich', knowledge.co_so_don_tich, expanded) };
  }
  if (/nguyen tac than trong/.test(expanded)) {
    return { type: intent, topic: 'nguyen_tac_than_trong', answer: buildAnswerByIntent(intent, 'nguyen_tac_than_trong', knowledge.nguyen_tac_than_trong, expanded) };
  }

  const topic = detectTopic(expanded);
  if (topic === 'unknown') {
    const suggestions = suggestTopics(expanded);
    return {
      type: intent,
      topic: 'unknown',
      answer: `Mình chưa nhận diện chắc chắn được chủ đề. ${BOT_NAME} gợi ý bạn hỏi theo mẫu: “Tài sản là gì?”, “TK 111 tăng bên nào?”, “Máy 120 triệu dùng 5 năm, khấu hao tháng bao nhiêu?”, “Mua hàng chưa thanh toán định khoản thế nào?”, “Xuất Excel cho danh sách nghiệp vụ này”.`,
      suggestions
    };
  }

  const topicData = knowledge[topic];
  if (!topicData) {
    return {
      type: intent,
      topic,
      answer: 'Mình đã nhận diện được chủ đề nhưng chưa có dữ liệu tri thức cho chủ đề này.'
    };
  }

  return {
    type: intent,
    topic,
    answer: buildAnswerByIntent(intent, topic, topicData, expanded)
  };
}

module.exports = answerQuestion;
