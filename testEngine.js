const path = require('path');
const answerQuestion = require('./services/answerQuestion');

const samplePath = path.join(__dirname, 'sample_transactions_lv9.xlsx');

const tests = [
  'doanh thu 800 trieu gia von 500 trieu loi nhuan gop bao nhieu',
  'mua hang chua vat 100 trieu vat 10 chuyen khoan dinh khoan the nao',
  'ban hang 200 trieu vat 10 thu tien mat gia von 120 trieu but toan sao',
  '111 tang ben nao',
  'nhieu nghiep vu: mua hang chua vat 100 trieu vat 10 chua thanh toan; ban hang 200 trieu vat 10 thu tien mat gia von 120 trieu; thu no khach hang qua ngan hang 80 trieu; trich khau hao tai san co dinh 24 trieu; ket chuyen doanh thu 200 trieu; ket chuyen gia von 120 trieu; ket chuyen chi phi quan ly 24 trieu; ket chuyen loi nhuan 56 trieu; cho toi nhat ky chung so cai va bang can doi so phat sinh va cong no ton kho',
  'xuat excel cho danh sach nghiep vu: mua hang chua vat 100 trieu vat 10 chua thanh toan\nban hang 200 trieu vat 10 thu tien mat gia von 120 trieu\nthu no khach hang qua ngan hang 80 trieu\ntrich khau hao tai san co dinh 24 trieu\nket chuyen doanh thu 200 trieu\nket chuyen gia von 120 trieu\nket chuyen chi phi quan ly 24 trieu\nket chuyen loi nhuan 56 trieu',
  `doc file excel path: ${samplePath} va xuat excel`
];

for (const q of tests) {
  const result = answerQuestion(q);
  console.log('\n==============================');
  console.log('Câu hỏi:', q);
  console.log('Intent:', result.type);
  console.log('Topic:', result.topic);
  if (result.exportPath) console.log('Excel:', result.exportPath);
  console.log(result.answer);
}
