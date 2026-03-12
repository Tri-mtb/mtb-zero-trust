# Kế Hoạch và Triển Khai Hệ Thống E-commerce Theo Mô Hình Zero Trust (NIST SP 800-207)

Dựa trên yêu cầu và cấu trúc của dự án hiện tại, hệ thống đã được chia làm 3 thành phần (Modules) chính để đáp ứng tiêu chuẩn Zero Trust và tích hợp trí tuệ nhân tạo (AI).

## 1. Kiến Trúc Hệ Thống (Mới Triển Khai)

- **Module A: Protected API (`/protected-api`) - Ứng Dụng E-commerce:**
  - Viết bằng Node.js / Express.
  - Xử lý các nghiệp vụ bán hàng: Lấy danh sách sản phẩm, đơn hàng, khách hàng.
  - Tích hợp kiểm tra quyền hạn (Role-Based Access Control - RBAC) từ Gateway (`x-user-role`, `x-user-id`). Shipper không thể xem thông tin khách hàng, Sales không thể truy cập export.
- **Module B: Gateway (`/gateway`) - Policy Enforcement Point (PEP):**
  - Viết bằng Node.js / Express kết hợp làm Reverse Proxy (Middleware).
  - Nhiệm vụ:
    - Bắt mọi request tới hệ thống.
    - Validate mã Token (JWT qua Supabase).
    - Trích xuất thông tin ngữ cảnh (Context): Địa chỉ IP, Thời gian (Time), Dấu vân tay thiết bị (Device Fingerprint), Phương thức (Method) và Endpoint truy cập.
    - Gọi sang **AI Engine** (PDP) để xin cấp phép chuyển tiếp.
- **Module C: AI Engine (`/ai-engine`) - Policy Decision Point (PDP):**
  - Viết bằng Python / FastAPI.
  - Sử dụng mô hình Machine Learning Unsupervised Learning - **Isolation Forest** (Scikit-learn).
  - Nhận luồng dữ liệu Context từ Gateway -> Trích xuất Behavior Features (thời gian truy cập, tần suất call API, IP lạ).
  - Trả về `{"decision": "allow" | "block", "risk_score": 0.45, "reasons": [...]}`

## 2. Kịch Bản Hoạt Động Của Hệ Thống

### Kịch bản 1: Truy cập hợp lệ (Normal Behavior)
- Một nhân viên Sales đang đăng nhập bằng tài khoản Supabase trên website Frontend.
- Nhân viên yêu cầu xem mục "Sản phẩm" (`GET /api/products`) hoặc 5 đơn hàng (`GET /api/orders`) lúc 9h sáng, IP trong công ty.
- Gateway nhận request -> Gửi Token & Ngữ cảnh sang AI.
- AI nhận được: `hour: 9`, `rate: 1 req/min`, `ip_known: 1`. Điểm dị thường (Anomaly Score) rất thấp.
- AI trả lời `"allow"`. Gateway mở luồng đưa request vào Express.js E-commerce API -> Lấy data thành công.

### Kịch bản 2: Tấn Công/Phá Hoại Nội Bộ (Insider Threat / Data Exfiltration)
- Cùng nhân viên Sales đó, lấy cắp Session Token và dùng Postman/Script Python cào data khách hàng (`GET /api/customers`) liên tục mỗi giây để export, HOẶC cố tình truy cập lúc 3h sáng.
- **Tại mức AI Engine:** Nhận thấy `rate` gọi API rất cao (>20 calls/phút) hoặc truy cập từ IP lạ / vào khung giờ `hour: 3`. Isolation Forest phát hiện Outlier.
- **Lập tức trả về `"block"`**. Gateway chặn và trả mã lỗi `403 Access Denied due to Suspicious Activity`.

## 3. Các Thay Đổi Hiện Tại Vào Mã Nguồn

1. **Supabase Tables & Policies:** Đã thêm file migration `20260310090000_ecommerce_tables.sql` để tạo bảng cho sản phẩm, người dùng (kèm phân quyền admin, sales, shipper), đặt hàng, và logs.
2. **Setup Gateway & AI Engine & API:** 
   - Đã tạo các services tương ứng nằm trong thư mục gốc. 
   - Điền sẵn một số dependencies cơ bản như fastapi, scikit-learn cho Python AI module; và express, axios, cors, cho Gateway.
3. **Script Khởi Động:** Đã tạo `start_all.bat` ở thư mục gốc để có thể boot nhanh tất cả services lên để trình diễn.

## Bước Tiếp Theo Dành Cho Bạn (Bạn Cần Chuẩn Bị):

1. Thay khóa **Supabase Service Role Key** trong thư mục `.env` của thư mục `protected-api` (nếu cần bypass DB Security nâng cao). Hiện tại nó được set là placeholder và vẫn có thể test vì bảng dùng Role Level Security lỏng cho authenticated user.
2. Chạy file `start_all.bat` để khởi động đồng thời cả AI Engine (Cổng 5000), Gateway (Cổng 3000), Protected API (Cổng 4000) và Frontend Website.
3. Chuyển Frontend của bạn trỏ tới Domain của Gateway (`http://localhost:3000`) thay vì kết nối thẳng tới Database Supabase, như thế mới thể hiện được tính năng Zero Trust Gateway đang chốt chặn ở giữa.
