const knowledge = {
  tai_san_co_dinh: {
    title: "Tài sản cố định",
    definition:
      "Tài sản cố định là tài sản có giá trị lớn, thời gian sử dụng từ trên 1 năm và tham gia vào nhiều chu kỳ kinh doanh của doanh nghiệp.",
    explanation:
      "Hiểu đơn giản, đây là những tài sản doanh nghiệp dùng lâu dài chứ không mua về để bán ngay. Ví dụ như máy móc, nhà xưởng, xe ô tô phục vụ hoạt động kinh doanh.",
    recognition:
      "Tài sản thường được ghi nhận là tài sản cố định khi doanh nghiệp kiểm soát được tài sản, chắc chắn thu được lợi ích kinh tế trong tương lai và xác định được nguyên giá một cách đáng tin cậy.",
    example:
      "Ví dụ: máy in dùng trong văn phòng, dây chuyền sản xuất, nhà kho, xe tải phục vụ vận chuyển hàng hóa.",
    note:
      "Không phải cứ tài sản hữu hình là tài sản cố định; còn phải xét thời gian sử dụng và giá trị theo chính sách kế toán áp dụng."
  },

  khau_hao: {
    title: "Khấu hao",
    definition:
      "Khấu hao là việc phân bổ có hệ thống nguyên giá của tài sản cố định vào chi phí trong thời gian sử dụng hữu ích của tài sản.",
    explanation:
      "Doanh nghiệp không đưa toàn bộ giá trị tài sản vào chi phí ngay một lần, mà chia dần qua nhiều kỳ để phản ánh đúng mức độ sử dụng tài sản.",
    calculation:
      "Phương pháp đường thẳng: Khấu hao năm = Nguyên giá / Thời gian sử dụng hữu ích. Khấu hao tháng = Khấu hao năm / 12.",
    example:
      "Máy móc nguyên giá 120 triệu, thời gian sử dụng 5 năm thì khấu hao năm là 24 triệu, khấu hao tháng là 2 triệu.",
    note:
      "Khấu hao chỉ áp dụng cho tài sản cố định phải trích khấu hao theo quy định."
  },

  doanh_thu: {
    title: "Doanh thu",
    definition:
      "Doanh thu là tổng giá trị lợi ích kinh tế doanh nghiệp thu được từ hoạt động sản xuất, kinh doanh thông thường, làm tăng vốn chủ sở hữu nhưng không bao gồm phần góp vốn của chủ sở hữu.",
    explanation:
      "Nói đơn giản, doanh thu là số tiền doanh nghiệp kiếm được từ việc bán hàng hoặc cung cấp dịch vụ.",
    recognition:
      "Doanh thu được ghi nhận khi doanh nghiệp đã chuyển giao phần lớn rủi ro và lợi ích gắn với hàng hóa hoặc đã hoàn thành nghĩa vụ cung cấp dịch vụ theo quy định.",
    example:
      "Ví dụ: doanh nghiệp bán hàng hóa cho khách, hoặc công ty dịch vụ hoàn thành hợp đồng và xuất hóa đơn."
  },

  chi_phi: {
    title: "Chi phí",
    definition:
      "Chi phí là các khoản làm giảm lợi ích kinh tế trong kỳ kế toán, dưới hình thức tiền chi ra, khấu trừ tài sản hoặc phát sinh nợ phải trả, dẫn đến làm giảm vốn chủ sở hữu.",
    explanation:
      "Hiểu đơn giản, chi phí là phần doanh nghiệp phải bỏ ra để vận hành và tạo ra doanh thu.",
    example:
      "Ví dụ: tiền lương, tiền thuê văn phòng, điện nước, chi phí quảng cáo, chi phí khấu hao."
  },

  gia_von: {
    title: "Giá vốn",
    definition:
      "Giá vốn là trị giá thực tế của hàng hóa, thành phẩm hoặc dịch vụ đã tiêu thụ trong kỳ.",
    explanation:
      "Đây là phần chi phí trực tiếp gắn với hàng đã bán ra. Nếu doanh thu là tiền bán, thì giá vốn là chi phí của thứ đã bán đó.",
    example:
      "Doanh nghiệp mua một sản phẩm giá 700.000 đồng và bán ra 1.000.000 đồng thì 700.000 đồng là giá vốn."
  },

  loi_nhuan_gop: {
    title: "Lợi nhuận gộp",
    definition:
      "Lợi nhuận gộp là phần chênh lệch giữa doanh thu thuần và giá vốn hàng bán.",
    explanation:
      "Chỉ tiêu này cho biết hoạt động bán hàng cốt lõi có tạo ra lãi trước khi trừ các chi phí vận hành khác hay không.",
    calculation:
      "Lợi nhuận gộp = Doanh thu thuần - Giá vốn hàng bán.",
    example:
      "Nếu doanh thu thuần là 500 triệu và giá vốn là 350 triệu thì lợi nhuận gộp là 150 triệu."
  },

  loi_nhuan_rong: {
    title: "Lợi nhuận ròng",
    definition:
      "Lợi nhuận ròng là phần lợi nhuận còn lại sau khi trừ toàn bộ chi phí, thuế và các khoản liên quan khỏi doanh thu.",
    explanation:
      "Đây là kết quả cuối cùng doanh nghiệp thực sự giữ lại sau mọi khoản chi.",
    calculation:
      "Lợi nhuận ròng = Doanh thu - Giá vốn - Chi phí bán hàng - Chi phí quản lý - Chi phí tài chính - Chi phí khác - Thuế thu nhập doanh nghiệp.",
    example:
      "Nếu doanh nghiệp còn lại 80 triệu sau khi trừ tất cả chi phí và thuế thì đó là lợi nhuận ròng."
  },

  hang_ton_kho: {
    title: "Hàng tồn kho",
    definition:
      "Hàng tồn kho là những tài sản được giữ để bán trong kỳ sản xuất kinh doanh thông thường, đang trong quá trình sản xuất dở dang hoặc là nguyên vật liệu, công cụ dụng cụ để sử dụng trong sản xuất kinh doanh.",
    explanation:
      "Hiểu đơn giản, đây là hàng hóa hoặc vật tư doanh nghiệp còn đang nắm giữ để bán hoặc để dùng vào hoạt động sản xuất."
  },

  phai_thu: {
    title: "Phải thu",
    definition:
      "Phải thu là các khoản doanh nghiệp có quyền thu từ khách hàng hoặc đối tượng khác phát sinh từ giao dịch đã xảy ra.",
    explanation:
      "Đó là tiền doanh nghiệp chưa thu được nhưng có quyền yêu cầu bên kia thanh toán."
  },

  phai_tra: {
    title: "Phải trả",
    definition:
      "Phải trả là các khoản nghĩa vụ hiện tại mà doanh nghiệp phải thanh toán cho người bán hoặc các đối tượng khác.",
    explanation:
      "Hiểu đơn giản, đây là khoản nợ doanh nghiệp còn phải trả."
  },

  no_phai_tra: {
    title: "Nợ phải trả",
    definition:
      "Nợ phải trả là nghĩa vụ hiện tại của doanh nghiệp phát sinh từ các giao dịch, sự kiện đã qua mà doanh nghiệp phải thanh toán bằng nguồn lực của mình.",
    explanation:
      "Đây là toàn bộ phần doanh nghiệp đang nợ các bên khác như nhà cung cấp, ngân hàng, người lao động, Nhà nước."
  },

  von_chu_so_huu: {
    title: "Vốn chủ sở hữu",
    definition:
      "Vốn chủ sở hữu là giá trị tài sản thuần thuộc về chủ sở hữu doanh nghiệp sau khi trừ đi nợ phải trả.",
    explanation:
      "Có thể hiểu đây là phần giá trị thực sự thuộc về chủ doanh nghiệp."
  },

  cong_cu_dung_cu: {
    title: "Công cụ dụng cụ",
    definition:
      "Công cụ dụng cụ là tư liệu lao động không đủ tiêu chuẩn ghi nhận là tài sản cố định nhưng được sử dụng cho hoạt động sản xuất kinh doanh.",
    explanation:
      "Chúng có thể dùng trong nhiều kỳ nhưng giá trị hoặc tiêu chuẩn chưa đạt mức ghi nhận là tài sản cố định."
  },

  thue_gtgt: {
    title: "Thuế GTGT",
    definition:
      "Thuế giá trị gia tăng là loại thuế tính trên phần giá trị tăng thêm của hàng hóa, dịch vụ phát sinh trong quá trình từ sản xuất đến tiêu dùng.",
    explanation:
      "Doanh nghiệp thường kê khai thuế GTGT đầu ra và được khấu trừ thuế GTGT đầu vào nếu đủ điều kiện."
  },

  thue_tndn: {
    title: "Thuế thu nhập doanh nghiệp",
    definition:
      "Thuế thu nhập doanh nghiệp là loại thuế trực thu đánh vào phần thu nhập chịu thuế của doanh nghiệp.",
    explanation:
      "Hiểu đơn giản, doanh nghiệp có lãi chịu thuế thì phải tính và nộp thuế thu nhập doanh nghiệp theo quy định."
  },

  bao_cao_tai_chinh: {
    title: "Báo cáo tài chính",
    definition:
      "Báo cáo tài chính là hệ thống báo cáo phản ánh tổng quát tình hình tài sản, nợ phải trả, vốn chủ sở hữu, kết quả kinh doanh và lưu chuyển tiền tệ của doanh nghiệp.",
    explanation:
      "Đây là bộ tài liệu quan trọng để nhìn toàn cảnh sức khỏe tài chính của doanh nghiệp."
  },

  bang_can_doi_ke_toan: {
    title: "Bảng cân đối kế toán",
    definition:
      "Bảng cân đối kế toán phản ánh tổng quát tình hình tài sản và nguồn hình thành tài sản của doanh nghiệp tại một thời điểm nhất định.",
    explanation:
      "Nó cho biết doanh nghiệp đang có gì và hình thành từ đâu: nợ hay vốn chủ sở hữu."
  },

  bao_cao_ket_qua_kinh_doanh: {
    title: "Báo cáo kết quả kinh doanh",
    definition:
      "Báo cáo kết quả kinh doanh phản ánh doanh thu, chi phí và kết quả lãi lỗ của doanh nghiệp trong một kỳ.",
    explanation:
      "Nó giúp đánh giá doanh nghiệp làm ăn có hiệu quả hay không trong kỳ."
  },

  luu_chuyen_tien_te: {
    title: "Báo cáo lưu chuyển tiền tệ",
    definition:
      "Báo cáo lưu chuyển tiền tệ phản ánh dòng tiền vào và dòng tiền ra của doanh nghiệp theo hoạt động kinh doanh, đầu tư và tài chính.",
    explanation:
      "Báo cáo này cho biết tiền thực tế đã vào ra như thế nào, khác với lợi nhuận kế toán."
  },

  tk_111: {
    title: "Tài khoản 111",
    definition:
      "Tài khoản 111 dùng để phản ánh tình hình thu, chi và tồn quỹ tiền mặt tại doanh nghiệp.",
    explanation:
      "Bất cứ khoản tiền mặt nhập quỹ hoặc xuất quỹ đều liên quan đến tài khoản này."
  },

  tk_112: {
    title: "Tài khoản 112",
    definition:
      "Tài khoản 112 dùng để phản ánh số hiện có và tình hình biến động tăng, giảm của tiền gửi ngân hàng.",
    explanation:
      "Khi doanh nghiệp chuyển khoản, nhận tiền qua ngân hàng hoặc có số dư tại ngân hàng thì thường liên quan tài khoản 112."
  },

  tk_131: {
    title: "Tài khoản 131",
    definition:
      "Tài khoản 131 dùng để phản ánh các khoản phải thu của khách hàng phát sinh trong quá trình bán hàng, cung cấp dịch vụ.",
    explanation:
      "Khi doanh nghiệp đã bán hàng nhưng chưa thu tiền ngay, thường phát sinh tài khoản 131."
  },

  tk_331: {
    title: "Tài khoản 331",
    definition:
      "Tài khoản 331 dùng để phản ánh các khoản phải trả cho người bán về hàng hóa, dịch vụ, tài sản đã mua nhưng chưa thanh toán.",
    explanation:
      "Khi doanh nghiệp mua hàng chưa trả tiền, thường ghi nhận vào tài khoản 331."
  },

  tk_211: {
    title: "Tài khoản 211",
    definition:
      "Tài khoản 211 dùng để phản ánh nguyên giá của tài sản cố định hữu hình hiện có và tình hình biến động tăng, giảm của chúng.",
    explanation:
      "Khi doanh nghiệp mua mới, thanh lý hoặc điều chuyển tài sản cố định hữu hình thì thường liên quan tài khoản 211."
  },

  tk_214: {
    title: "Tài khoản 214",
    definition:
      "Tài khoản 214 dùng để phản ánh giá trị hao mòn lũy kế của tài sản cố định và bất động sản đầu tư trong quá trình sử dụng.",
    explanation:
      "Hiểu đơn giản, tài khoản này ghi phần khấu hao đã trích lũy qua các kỳ."
  },

  tk_511: {
    title: "Tài khoản 511",
    definition:
      "Tài khoản 511 dùng để phản ánh doanh thu bán hàng và cung cấp dịch vụ của doanh nghiệp.",
    explanation:
      "Khi phát sinh doanh thu từ hoạt động kinh doanh chính, tài khoản 511 thường được sử dụng."
  },

  tk_632: {
    title: "Tài khoản 632",
    definition:
      "Tài khoản 632 dùng để phản ánh giá vốn của hàng hóa, thành phẩm, dịch vụ đã bán trong kỳ.",
    explanation:
      "Tài khoản này cho biết chi phí trực tiếp của phần hàng hoặc dịch vụ đã tiêu thụ."
  },

  tk_641: {
    title: "Tài khoản 641",
    definition:
      "Tài khoản 641 dùng để phản ánh chi phí bán hàng phát sinh trong kỳ.",
    explanation:
      "Ví dụ: chi phí vận chuyển giao hàng, quảng cáo, lương nhân viên bán hàng."
  },

  tk_642: {
    title: "Tài khoản 642",
    definition:
      "Tài khoản 642 dùng để phản ánh chi phí quản lý doanh nghiệp phát sinh trong kỳ.",
    explanation:
      "Ví dụ: lương bộ phận quản lý, chi phí văn phòng, chi phí hành chính."
  },
  doanh_thu_thuan: {
  title: "Doanh thu thuần",
  definition: "Doanh thu thuần là doanh thu bán hàng và cung cấp dịch vụ sau khi trừ các khoản giảm trừ doanh thu.",
  explanation: "Các khoản giảm trừ có thể gồm chiết khấu thương mại, giảm giá hàng bán, hàng bán bị trả lại.",
  calculation: "Doanh thu thuần = Doanh thu bán hàng - Các khoản giảm trừ doanh thu",
  example: "Nếu doanh thu bán hàng là 500 triệu và giảm trừ doanh thu là 20 triệu thì doanh thu thuần là 480 triệu."
},

gia_von: {
  title: "Giá vốn hàng bán",
  definition: "Giá vốn hàng bán là trị giá vốn của hàng hóa, thành phẩm, dịch vụ đã tiêu thụ trong kỳ.",
  explanation: "Giá vốn phản ánh chi phí trực tiếp cấu thành hàng đã bán.",
  calculation: "Giá vốn = Tồn đầu kỳ + Nhập trong kỳ - Tồn cuối kỳ",
  example: "Tồn đầu 100 triệu, nhập 300 triệu, tồn cuối 80 triệu thì giá vốn là 320 triệu."
},

loi_nhuan_truoc_thue: {
  title: "Lợi nhuận trước thuế",
  definition: "Lợi nhuận trước thuế là phần lợi nhuận của doanh nghiệp trước khi trừ thuế thu nhập doanh nghiệp.",
  explanation: "Chỉ tiêu này giúp đánh giá hiệu quả kinh doanh trước tác động của thuế.",
  calculation: "Lợi nhuận trước thuế = Doanh thu - Giá vốn - Chi phí",
  example: "Doanh thu 800 triệu, giá vốn 500 triệu, chi phí 100 triệu thì lợi nhuận trước thuế là 200 triệu."
},

vat_dau_vao: {
  title: "VAT đầu vào",
  definition: "VAT đầu vào là thuế GTGT ghi trên hóa đơn mua hàng hóa, dịch vụ mà doanh nghiệp phải trả khi mua vào.",
  explanation: "VAT đầu vào có thể được khấu trừ nếu đáp ứng điều kiện theo quy định.",
  calculation: "VAT đầu vào = Giá mua chưa VAT × Thuế suất VAT",
  example: "Giá mua chưa VAT là 200 triệu, VAT 10% thì VAT đầu vào là 20 triệu."
},

vat_dau_ra: {
  title: "VAT đầu ra",
  definition: "VAT đầu ra là thuế GTGT doanh nghiệp phải tính khi bán hàng hóa, cung cấp dịch vụ.",
  explanation: "VAT đầu ra được xác định trên giá tính thuế của hàng hóa, dịch vụ bán ra.",
  calculation: "VAT đầu ra = Giá bán chưa VAT × Thuế suất VAT",
  example: "Giá bán chưa VAT là 300 triệu, VAT 10% thì VAT đầu ra là 30 triệu."
},

diem_hoa_von: {
  title: "Điểm hòa vốn",
  definition: "Điểm hòa vốn là mức doanh thu tại đó doanh nghiệp không lãi không lỗ.",
  explanation: "Điểm hòa vốn được xác định khi doanh thu bằng tổng chi phí cố định và chi phí biến đổi.",
  calculation: "Điểm hòa vốn (doanh thu) = Chi phí cố định / Tỷ suất đóng góp.",
  example: "Giả sử chi phí cố định 100 triệu, tỷ suất đóng góp 25% thì doanh thu hòa vốn 400 triệu."
},

vong_quay_hang_ton_kho: {
  title: "Vòng quay hàng tồn kho",
  definition: "Vòng quay hàng tồn kho cho biết số lần hàng tồn kho được luân chuyển trong kỳ.",
  explanation: "Vòng quay càng cao thường phản ánh doanh nghiệp bán nhanh hàng tồn kho. Dựa trên giá vốn và tồn kho bình quân.",
  calculation: "Vòng quay hàng tồn kho = Giá vốn hàng bán / Tồn kho bình quân.",
  example: "Giá vốn 500 triệu, tồn kho bình quân 125 triệu -> vòng quay = 4 lần." 
}
};

module.exports = knowledge;

Object.assign(knowledge, {
  tai_san: {
    title: "Tài sản",
    definition: "Tài sản là nguồn lực do doanh nghiệp kiểm soát và có thể đem lại lợi ích kinh tế trong tương lai.",
    explanation: "Tài sản thường tồn tại dưới dạng tiền, hàng tồn kho, khoản phải thu, máy móc, nhà xưởng và các quyền tài sản khác.",
    example: "Ví dụ: tiền mặt, tiền gửi ngân hàng, hàng hóa trong kho, máy sản xuất.",
    note: "Tài sản thường được chia thành tài sản ngắn hạn và tài sản dài hạn."
  },
  tai_san_ngan_han: {
    title: "Tài sản ngắn hạn",
    definition: "Tài sản ngắn hạn là tài sản dự kiến được thu hồi, bán hoặc sử dụng trong vòng 12 tháng hoặc trong một chu kỳ kinh doanh bình thường.",
    explanation: "Nhóm này thường gồm tiền, tương đương tiền, phải thu ngắn hạn, hàng tồn kho.",
    example: "Ví dụ: tiền mặt, tiền gửi ngân hàng, hàng tồn kho, phải thu khách hàng ngắn hạn."
  },
  tai_san_dai_han: {
    title: "Tài sản dài hạn",
    definition: "Tài sản dài hạn là tài sản có thời gian thu hồi, sử dụng hoặc luân chuyển trên 12 tháng.",
    explanation: "Nhóm này thường gồm tài sản cố định, bất động sản đầu tư, đầu tư tài chính dài hạn.",
    example: "Ví dụ: nhà xưởng, xe tải, máy móc thiết bị, phần mềm dùng nhiều năm."
  },
  chi_phi_ban_hang: {
    title: "Chi phí bán hàng",
    definition: "Chi phí bán hàng là các chi phí phát sinh liên quan trực tiếp đến quá trình tiêu thụ hàng hóa, sản phẩm, dịch vụ.",
    explanation: "Bao gồm lương nhân viên bán hàng, chi phí quảng cáo, vận chuyển giao hàng, đóng gói.",
    example: "Ví dụ: chi 5 triệu tiền quảng cáo sản phẩm mới."
  },
  chi_phi_quan_ly: {
    title: "Chi phí quản lý doanh nghiệp",
    definition: "Chi phí quản lý doanh nghiệp là các chi phí liên quan đến hoạt động quản lý và điều hành chung của doanh nghiệp.",
    explanation: "Bao gồm lương bộ phận quản lý, điện nước văn phòng, chi phí hành chính.",
    example: "Ví dụ: chi 12 triệu lương phòng kế toán và hành chính."
  },
  nguyen_tac_ke_toan: {
    title: "Nguyên tắc kế toán cơ bản",
    definition: "Nguyên tắc kế toán cơ bản là những nguyên tắc nền tảng dùng để ghi nhận, đo lường và trình bày thông tin kế toán.",
    explanation: "Một số nguyên tắc thường gặp gồm cơ sở dồn tích, hoạt động liên tục, giá gốc, phù hợp, nhất quán, thận trọng, trọng yếu.",
    example: "Ví dụ: ghi nhận doanh thu khi đã phát sinh quyền thu tiền thay vì chờ khi thu tiền thật."
  },
  can_doi_ke_toan: {
    title: "Phương trình kế toán",
    definition: "Phương trình kế toán cơ bản là: Tài sản = Nợ phải trả + Vốn chủ sở hữu.",
    explanation: "Mọi nghiệp vụ kế toán phát sinh đều phải giữ cân bằng phương trình này.",
    example: "Ví dụ: góp vốn 500 triệu bằng tiền mặt thì tài sản tăng 500 triệu và vốn chủ sở hữu cũng tăng 500 triệu."
  },
  tk_3331: {
    title: "Tài khoản 3331",
    definition: "Tài khoản 3331 dùng để phản ánh số thuế GTGT đầu ra phải nộp, đã nộp và còn phải nộp cho Nhà nước.",
    explanation: "Khi doanh nghiệp bán hàng chịu thuế GTGT, phần thuế đầu ra thường ghi Có TK 3331.",
    example: "Ví dụ: bán hàng giá chưa VAT 100 triệu, VAT 10% thì Có TK 3331 số tiền 10 triệu."
  }
});
