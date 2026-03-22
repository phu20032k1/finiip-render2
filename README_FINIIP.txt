FINIIP - AI kế toán web UI trắng

CÁCH CHẠY CƠ BẢN
1) Mở terminal trong thư mục project
2) Chạy: npm install
3) Chạy: npm start
4) Mở: http://localhost:3000

BẬT CHẾ ĐỘ AI THẬT (không chỉ rule-based)
- Cần có OpenAI API key
- Trên macOS/Linux:
  export OPENAI_API_KEY=your_key_here
  export OPENAI_MODEL=gpt-4.1-mini
  npm start
- Trên Windows PowerShell:
  $env:OPENAI_API_KEY="your_key_here"
  $env:OPENAI_MODEL="gpt-4.1-mini"
  npm start

Nếu không có OPENAI_API_KEY:
- Finiip vẫn chạy bình thường
- Hệ thống dùng chế độ local nâng cao + ngữ cảnh nhiều lượt

TÍNH NĂNG MỚI
- Hiểu câu hỏi nối tiếp theo ngữ cảnh gần nhất
- Trả lời mềm hơn
- Upload Excel/CSV/XLS/XLSX/JSON để phân tích
- Gắn cờ dòng nghi sai, lệch cột, thiếu tài khoản, thiếu số tiền
- Xuất lại file sạch sang thư mục generated_reports

LƯU Ý
- Chế độ AI thật phụ thuộc API key và kết nối mạng từ máy chạy app
- File sạch export có 3 sheet: Tong_quan, Du_lieu_sach, Can_kiem_tra
