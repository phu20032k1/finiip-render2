module.exports = {
  vat_khau_tru: {
    title: 'Phương pháp khấu trừ thuế GTGT',
    definition: 'Phương pháp khấu trừ là cách xác định số thuế GTGT phải nộp bằng thuế GTGT đầu ra trừ thuế GTGT đầu vào được khấu trừ.',
    explanation: 'Doanh nghiệp cần theo dõi riêng đầu ra, đầu vào và điều kiện khấu trừ để kê khai đúng.',
    calculation: 'Thuế GTGT phải nộp = Thuế GTGT đầu ra - Thuế GTGT đầu vào được khấu trừ.',
    example: 'Đầu ra 50 triệu, đầu vào đủ điều kiện khấu trừ 38 triệu thì số phải nộp là 12 triệu.'
  },
  co_so_don_tich: {
    title: 'Cơ sở dồn tích',
    definition: 'Cơ sở dồn tích là nguyên tắc ghi nhận nghiệp vụ vào thời điểm phát sinh, không phụ thuộc thời điểm thu hoặc chi tiền.',
    explanation: 'Doanh thu và chi phí được phản ánh theo bản chất kinh tế của kỳ kế toán.',
    example: 'Bán hàng tháng 3 nhưng tháng 4 mới thu tiền thì doanh thu vẫn ghi nhận ở tháng 3.'
  },
  nguyen_tac_phu_hop: {
    title: 'Nguyên tắc phù hợp',
    definition: 'Chi phí phải được ghi nhận tương ứng với doanh thu tạo ra trong cùng kỳ.',
    explanation: 'Nguyên tắc này giúp kết quả kinh doanh phản ánh sát thực tế hơn.',
    example: 'Khi ghi nhận doanh thu bán hàng thì đồng thời phải ghi nhận giá vốn của hàng đã bán.'
  },
  nguyen_tac_than_trong: {
    title: 'Nguyên tắc thận trọng',
    definition: 'Kế toán phải xem xét, cân nhắc và đánh giá hợp lý để tránh ghi nhận quá cao tài sản, thu nhập hoặc quá thấp nợ phải trả, chi phí.',
    explanation: 'Thận trọng thường thể hiện qua trích lập dự phòng và đánh giá tổn thất có thể xảy ra.'
  },
  chi_phi_tra_truoc: {
    title: 'Chi phí trả trước',
    definition: 'Chi phí trả trước là khoản đã chi nhưng liên quan đến nhiều kỳ kế toán nên được phân bổ dần.',
    explanation: 'Khoản này chưa được ghi nhận hết vào chi phí ngay tại thời điểm thanh toán.',
    example: 'Tiền thuê văn phòng trả trước 12 tháng được phân bổ dần theo từng tháng.'
  },
  chi_phi_phai_tra: {
    title: 'Chi phí phải trả',
    definition: 'Chi phí phải trả là khoản chi phí đã phát sinh nhưng chưa có chứng từ thanh toán hoặc chưa thanh toán tại thời điểm ghi nhận.',
    explanation: 'Bản chất là nghĩa vụ hiện tại của doanh nghiệp đối với chi phí đã sử dụng.',
    example: 'Cuối tháng phải trích trước tiền điện, tiền lãi vay hoặc tiền lương chưa thanh toán.'
  },
  doanh_thu_chua_thuc_hien: {
    title: 'Doanh thu chưa thực hiện',
    definition: 'Doanh thu chưa thực hiện là khoản doanh nghiệp đã thu trước nhưng chưa đủ điều kiện ghi nhận doanh thu của kỳ hiện tại.',
    explanation: 'Khoản này được ghi nhận là nợ phải trả hoặc doanh thu chưa thực hiện rồi phân bổ dần.',
    example: 'Khách trả trước tiền thuê cho 6 tháng nhưng doanh nghiệp mới thực hiện 1 tháng.'
  },
  du_phong_phai_thu_kho_doi: {
    title: 'Dự phòng phải thu khó đòi',
    definition: 'Dự phòng phải thu khó đòi là khoản dự phòng cho phần nợ phải thu có khả năng không thu hồi được.',
    explanation: 'Mục tiêu là phản ánh giá trị thuần có thể thu hồi của khoản phải thu.',
    example: 'Khách hàng chậm trả lâu, có dấu hiệu mất khả năng thanh toán thì cần xem xét trích lập dự phòng.'
  },
  doi_chieu_ngan_hang: {
    title: 'Đối chiếu ngân hàng',
    definition: 'Đối chiếu ngân hàng là việc so sánh số dư sổ kế toán tiền gửi với sao kê ngân hàng để phát hiện chênh lệch.',
    explanation: 'Thường phát sinh chênh lệch do phí ngân hàng, tiền đang chuyển, bút toán ghi chậm hoặc sai sót.',
    example: 'Kế toán phát hiện sao kê đã trừ phí nhưng sổ chưa ghi nhận.'
  },
  hang_gui_ban: {
    title: 'Hàng gửi bán',
    definition: 'Hàng gửi bán là hàng doanh nghiệp chuyển cho đại lý hoặc bên nhận bán nhưng chưa đủ điều kiện ghi nhận doanh thu.',
    explanation: 'Doanh thu chỉ ghi nhận khi hàng đã bán cho khách cuối cùng hoặc khi đủ điều kiện theo hợp đồng.'
  },
  hang_mua_dang_di_duong: {
    title: 'Hàng mua đang đi đường',
    definition: 'Là hàng doanh nghiệp đã mua nhưng cuối kỳ vẫn đang trên đường vận chuyển hoặc chưa nhập kho thực tế.',
    explanation: 'Thường theo dõi riêng để phản ánh đúng tài sản và thời điểm ghi nhận.'
  },
  gia_thanh_san_xuat: {
    title: 'Giá thành sản xuất',
    definition: 'Giá thành sản xuất là toàn bộ chi phí sản xuất tính cho khối lượng sản phẩm, lao vụ đã hoàn thành.',
    explanation: 'Thường bao gồm chi phí nguyên vật liệu trực tiếp, nhân công trực tiếp và chi phí sản xuất chung.'
  },
  chi_phi_san_xuat_chung: {
    title: 'Chi phí sản xuất chung',
    definition: 'Chi phí sản xuất chung là chi phí phục vụ và quản lý phát sinh tại phân xưởng hoặc bộ phận sản xuất.',
    explanation: 'Khoản này cần được phân bổ hợp lý vào giá thành sản phẩm.'
  },
  gia_thanh_don_vi: {
    title: 'Giá thành đơn vị',
    definition: 'Giá thành đơn vị là chi phí tính cho một đơn vị sản phẩm hoàn thành.',
    calculation: 'Giá thành đơn vị = Tổng giá thành / Số lượng sản phẩm hoàn thành.',
    example: 'Tổng giá thành 500 triệu, sản lượng hoàn thành 10.000 sản phẩm thì giá thành đơn vị là 50.000 đồng.'
  },
  bank_reconciliation: {
    title: 'Bank reconciliation',
    definition: 'Đối chiếu ngân hàng là quá trình soát xét sự khớp đúng giữa sổ tiền gửi và sao kê ngân hàng.',
    explanation: 'Đây là nghiệp vụ kiểm soát nội bộ rất quan trọng để phát hiện sai lệch tiền.'
  },
  fifo: {
    title: 'Phương pháp FIFO',
    definition: 'FIFO là phương pháp nhập trước xuất trước trong tính giá hàng tồn kho.',
    explanation: 'Giả định hàng nhập trước được xuất trước nên giá trị tồn kho cuối kỳ gần với giá mua gần nhất.'
  },
  binh_quan_gia_quyen: {
    title: 'Bình quân gia quyền',
    definition: 'Là phương pháp tính giá xuất kho dựa trên đơn giá bình quân của hàng tồn kho.',
    explanation: 'Phương pháp này làm trơn biến động giá so với FIFO.',
    calculation: 'Đơn giá bình quân = (Trị giá tồn đầu kỳ + trị giá nhập trong kỳ) / (Số lượng tồn đầu kỳ + số lượng nhập trong kỳ).'
  },
  kiem_ke: {
    title: 'Kiểm kê',
    definition: 'Kiểm kê là việc cân, đong, đo, đếm hoặc xác nhận để xác định số lượng, giá trị tài sản thực tế.',
    explanation: 'Kiểm kê giúp đối chiếu thực tế với sổ sách và xử lý chênh lệch.'
  },
  chenh_lech_kiem_ke: {
    title: 'Chênh lệch kiểm kê',
    definition: 'Là phần chênh giữa số liệu sổ sách và số liệu thực tế qua kiểm kê.',
    explanation: 'Kế toán cần xác định nguyên nhân, trách nhiệm và cách xử lý trước khi hạch toán chính thức.'
  },
  du_toan: {
    title: 'Dự toán',
    definition: 'Dự toán là kế hoạch tài chính được lập trước cho kỳ tới dựa trên sản lượng, doanh thu, chi phí và nguồn lực dự kiến.',
    explanation: 'Dự toán giúp doanh nghiệp kiểm soát mục tiêu và so sánh thực hiện với kế hoạch.'
  },
  phan_tich_bctc: {
    title: 'Phân tích báo cáo tài chính',
    definition: 'Là việc sử dụng các chỉ tiêu và tỷ số để đánh giá khả năng thanh toán, hiệu quả hoạt động, cơ cấu vốn và khả năng sinh lời.',
    explanation: 'Mục tiêu là nhìn ra xu hướng và rủi ro tài chính của doanh nghiệp.'
  },
  vong_quay_hang_ton_kho: {
    title: 'Vòng quay hàng tồn kho',
    definition: 'Vòng quay hàng tồn kho phản ánh số lần bình quân hàng tồn kho luân chuyển trong kỳ.',
    calculation: 'Vòng quay HTK = Giá vốn hàng bán / Hàng tồn kho bình quân.',
    example: 'Chỉ tiêu cao thường cho thấy hàng lưu chuyển nhanh, nhưng cần nhìn cùng biên lợi nhuận và nguy cơ thiếu hàng.'
  },
  vong_quay_phai_thu: {
    title: 'Vòng quay phải thu',
    definition: 'Vòng quay phải thu phản ánh tốc độ thu hồi công nợ khách hàng.',
    calculation: 'Vòng quay phải thu = Doanh thu bán chịu / Phải thu bình quân.',
    example: 'Từ vòng quay có thể suy ra số ngày thu tiền bình quân.'
  },
  diem_hoa_von: {
    title: 'Điểm hòa vốn',
    definition: 'Điểm hòa vốn là mức doanh thu hoặc sản lượng mà tại đó doanh nghiệp không lãi cũng không lỗ.',
    calculation: 'Điểm hòa vốn = Tổng định phí / Tỷ lệ lãi góp hoặc / lãi góp đơn vị.',
    explanation: 'Chỉ tiêu này hữu ích khi phân tích giá bán, sản lượng và cơ cấu chi phí.'
  },
  lai_vay: {
    title: 'Chi phí lãi vay',
    definition: 'Chi phí lãi vay là khoản chi phí phát sinh từ việc sử dụng vốn vay.',
    explanation: 'Tùy trường hợp, lãi vay có thể ghi nhận vào chi phí tài chính hoặc được vốn hóa theo quy định áp dụng.'
  },
  chenhlech_ty_gia: {
    title: 'Chênh lệch tỷ giá',
    definition: 'Chênh lệch tỷ giá là khoản chênh phát sinh do đánh giá hoặc thanh toán các khoản mục tiền tệ có gốc ngoại tệ.',
    explanation: 'Doanh nghiệp cần áp dụng đúng tỷ giá ghi nhận ban đầu, tỷ giá thanh toán và tỷ giá cuối kỳ.'
  },
  doanh_thu_tai_chinh: {
    title: 'Doanh thu tài chính',
    definition: 'Doanh thu tài chính là khoản thu nhập phát sinh từ hoạt động tài chính như lãi tiền gửi, lãi chênh lệch tỷ giá, cổ tức được chia.',
    explanation: 'Khoản này không phải doanh thu từ hoạt động kinh doanh cốt lõi.'
  },
  chi_phi_tai_chinh: {
    title: 'Chi phí tài chính',
    definition: 'Chi phí tài chính là khoản chi phí liên quan đến hoạt động tài chính như lãi vay, lỗ tỷ giá, chiết khấu thanh toán cho khách hàng.',
    explanation: 'Cần tách riêng với chi phí bán hàng và chi phí quản lý doanh nghiệp.'
  },
  thu_nhap_khac: {
    title: 'Thu nhập khác',
    definition: 'Thu nhập khác là khoản thu phát sinh ngoài hoạt động kinh doanh thông thường và hoạt động tài chính.',
    explanation: 'Ví dụ: thu từ thanh lý tài sản, khoản nợ phải trả không xác định được chủ.'
  },
  chi_phi_khac: {
    title: 'Chi phí khác',
    definition: 'Chi phí khác là các khoản chi phát sinh ngoài hoạt động thông thường và hoạt động tài chính.',
    explanation: 'Ví dụ: giá trị còn lại của tài sản thanh lý, tiền phạt vi phạm hợp đồng.'
  },
  ket_chuyen: {
    title: 'Kết chuyển cuối kỳ',
    definition: 'Kết chuyển là việc chuyển số phát sinh của các tài khoản doanh thu, chi phí sang tài khoản xác định kết quả kinh doanh để xác định lãi lỗ.',
    explanation: 'Đây là bước quan trọng trước khi lập báo cáo kết quả kinh doanh.'
  },
  tk_1331: {
    title: 'Tài khoản 1331',
    definition: 'TK 1331 phản ánh thuế GTGT đầu vào được khấu trừ của hàng hóa, dịch vụ.',
    explanation: 'Khi mua hàng chịu thuế GTGT theo phương pháp khấu trừ, phần VAT đầu vào thường ghi vào 1331.'
  },
  tk_152: {
    title: 'Tài khoản 152',
    definition: 'TK 152 phản ánh giá trị hiện có và biến động của nguyên liệu, vật liệu.',
    explanation: 'Thường dùng cho doanh nghiệp sản xuất hoặc xây lắp.'
  },
  tk_153: {
    title: 'Tài khoản 153',
    definition: 'TK 153 phản ánh công cụ, dụng cụ sử dụng cho hoạt động sản xuất kinh doanh.',
    explanation: 'Những tài sản chưa đủ tiêu chuẩn ghi nhận là tài sản cố định thường theo dõi ở TK 153.'
  },
  tk_156: {
    title: 'Tài khoản 156',
    definition: 'TK 156 phản ánh tình hình nhập, xuất, tồn hàng hóa.',
    explanation: 'Doanh nghiệp thương mại dùng nhiều tài khoản này để theo dõi hàng mua về để bán.'
  },
  tk_334: {
    title: 'Tài khoản 334',
    definition: 'TK 334 phản ánh các khoản phải trả người lao động về tiền lương, thưởng và thu nhập khác.',
    explanation: 'Khi tính lương phải trả hoặc thanh toán lương cho nhân viên, thường liên quan TK 334.'
  },
  tk_338: {
    title: 'Tài khoản 338',
    definition: 'TK 338 phản ánh các khoản phải trả, phải nộp khác như bảo hiểm, kinh phí công đoàn, doanh thu chưa thực hiện và nhiều khoản khác tùy tiểu khoản.',
    explanation: 'Đây là nhóm tài khoản khá rộng nên cần xác định đúng tiểu khoản.'
  },
  tk_515: {
    title: 'Tài khoản 515',
    definition: 'TK 515 phản ánh doanh thu hoạt động tài chính.',
    explanation: 'Ví dụ: lãi tiền gửi, cổ tức, lãi chênh lệch tỷ giá.'
  },
  tk_635: {
    title: 'Tài khoản 635',
    definition: 'TK 635 phản ánh chi phí tài chính.',
    explanation: 'Ví dụ: lãi vay, lỗ tỷ giá, chiết khấu thanh toán cho khách hàng.'
  },
  tk_711: {
    title: 'Tài khoản 711',
    definition: 'TK 711 phản ánh thu nhập khác.',
    explanation: 'Ví dụ: thu từ thanh lý tài sản hoặc khoản thu bất thường không thuộc hoạt động chính.'
  },
  tk_811: {
    title: 'Tài khoản 811',
    definition: 'TK 811 phản ánh chi phí khác.',
    explanation: 'Ví dụ: giá trị còn lại của TSCĐ thanh lý hoặc khoản phạt hợp đồng.'
  },
  tk_911: {
    title: 'Tài khoản 911',
    definition: 'TK 911 dùng để xác định kết quả kinh doanh trong kỳ.',
    explanation: 'Cuối kỳ kết chuyển doanh thu, chi phí vào 911 để xác định lãi hoặc lỗ.'
  },
  tk_421: {
    title: 'Tài khoản 421',
    definition: 'TK 421 phản ánh lợi nhuận sau thuế chưa phân phối.',
    explanation: 'Sau khi xác định kết quả kinh doanh, lợi nhuận hoặc lỗ thường được kết chuyển sang 421.'
  },
  luong_va_bhxh: {
    title: 'Tiền lương và bảo hiểm',
    definition: 'Đây là nhóm nghiệp vụ liên quan tính lương phải trả, trích bảo hiểm và thanh toán lương.',
    explanation: 'Doanh nghiệp cần tách phần người lao động chịu và phần doanh nghiệp chịu theo chính sách áp dụng.'
  },
  tam_ung: {
    title: 'Tạm ứng',
    definition: 'Tạm ứng là khoản doanh nghiệp ứng trước cho nhân viên hoặc nhà cung cấp để phục vụ công việc.',
    explanation: 'Sau khi hoàn ứng, cần đối chiếu chứng từ để quyết toán số đã tạm ứng.'
  },
  thue_tncn: {
    title: 'Thuế thu nhập cá nhân',
    definition: 'Thuế TNCN là loại thuế trực thu đánh vào thu nhập chịu thuế của cá nhân.',
    explanation: 'Kế toán tiền lương thường phải tính khấu trừ và kê khai khoản thuế này cho người lao động.'
  }
};
