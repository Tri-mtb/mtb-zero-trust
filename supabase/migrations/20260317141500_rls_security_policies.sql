-- ==========================================
-- MTB ZERO TRUST SYSTEM: ROW LEVEL SECURITY (RLS)
-- ==========================================
-- Áp dụng nguyên tắc "Least Privilege" 
-- Không một API hay Client nào vượt qua được lớp bảo vệ này
-- trừ phi Token xác nhận chính xác ID và Chức vụ của họ.

-- 1. Bật tính năng RLS cho tất cả các bảng quan trọng
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."access_logs" ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- BẢNG PROFILES (Hồ sơ người dùng)
-- ==========================================
-- Quyền đọc cơ bản: Mỗi người chỉ xem được hồ sơ của chính mình
CREATE POLICY "Người dùng chỉ đọc hồ sơ cá nhân" ON "public"."profiles"
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Người dùng tự cập nhật hồ sơ" ON "public"."profiles"
FOR UPDATE USING (auth.uid() = id);

-- Quyền Admin: Quản trị viên mới được xem toàn bộ hồ sơ
CREATE POLICY "Admin xem toàn bộ hồ sơ" ON "public"."profiles"
FOR SELECT USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- ==========================================
-- BẢNG PRODUCTS (Sản phẩm cửa hàng)
-- ==========================================
-- Bất kỳ ai cũng có thể XEM danh sách sản phẩm (kể cả chưa đăng nhập)
CREATE POLICY "Cho phép xem danh sách Sản phẩm" ON "public"."products"
FOR SELECT USING (true);

-- Chỉ Admin mới có quyền THÊM, SỬA, XÓA Sản phẩm
CREATE POLICY "Chỉ Admin mới được thêm Sản phẩm" ON "public"."products"
FOR INSERT WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Chỉ Admin mới được sửa Sản phẩm" ON "public"."products"
FOR UPDATE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- ==========================================
-- BẢNG ORDERS (Đơn hàng)
-- ==========================================
-- Khách hàng: Chỉ TẠO và XEM đơn hàng do chính mình đặt
CREATE POLICY "Khách hàng tự đọc Đơn hàng cá nhân" ON "public"."orders"
FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Khách hàng tạo Đơn hàng của chính mình" ON "public"."orders"
FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Admin và Sales: Xem được toàn bộ đơn hàng
CREATE POLICY "Admin và Sales xem toàn bộ Đơn hàng" ON "public"."orders"
FOR SELECT USING (
  ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin') OR
  ((SELECT role FROM profiles WHERE id = auth.uid()) = 'sales')
);

-- Shipper: Xem đơn hàng để điều phối
CREATE POLICY "Shipper có thể thấy thông tin đơn hàng" ON "public"."orders"
FOR SELECT USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'shipper'
);

-- Nhân viên vận hành được Cập nhật trạng thái (Update)
CREATE POLICY "Staff cập nhật trạng thái đơn" ON "public"."orders"
FOR UPDATE USING (
  ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'sales', 'shipper'))
);

-- ==========================================
-- BẢNG CUSTMERS (Khách hàng hệ thống)
-- ==========================================
CREATE POLICY "Khách hàng đọc dữ liệu của mình" ON "public"."customers"
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Khách hàng hoặc API tự tạo profile khách" ON "public"."customers"
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin và Sales mới được xem danh sách Khách" ON "public"."customers"
FOR SELECT USING (
  ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'sales'))
);

-- ==========================================
-- BẢNG ACCESS LOGS (Nhật ký truy cập AI)
-- ==========================================
-- Chỉ AI Engine (Service Key) được phép INSERT - Bỏ qua RLS
-- Chỉ Admin mới được đọc Log bảo mật
CREATE POLICY "Chỉ Admin xem Access Logs" ON "public"."access_logs"
FOR SELECT USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
