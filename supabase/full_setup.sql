-- ============================================================
-- MTB ZERO TRUST SYSTEM - FULL DATABASE SETUP (CLEAN INSTALL)
-- Xóa sạch và tạo lại toàn bộ từ đầu
-- ============================================================

-- Xóa trigger cũ
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Xóa bảng cũ (theo thứ tự dependency)
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.access_logs CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ============================================================
-- 1. PROFILES TABLE
-- ============================================================
CREATE TABLE public.profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  clearance_level integer default 1,
  role text default 'customer' check (role in ('admin', 'sales', 'shipper', 'customer')),
  constraint username_length check (char_length(username) >= 3)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. PRODUCTS TABLE
-- ============================================================
CREATE TABLE public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric not null,
  stock integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. CUSTOMERS TABLE
-- ============================================================
CREATE TABLE public.customers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null unique,
  phone text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. ORDERS TABLE
-- ============================================================
CREATE TABLE public.orders (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references public.customers(id) not null,
  total_amount numeric not null,
  status text not null default 'pending',
  shipping_address text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. ORDER ITEMS TABLE
-- ============================================================
CREATE TABLE public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) not null,
  product_id uuid references public.products(id) not null,
  quantity integer not null,
  price numeric not null
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. ACCESS LOGS TABLE (AI Engine)
-- ============================================================
CREATE TABLE public.access_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  ip_address text,
  device_fingerprint text,
  endpoint text,
  method text,
  action_time timestamp with time zone default timezone('utc'::text, now()) not null,
  risk_score numeric,
  decision text,
  admin_feedback text CHECK (admin_feedback IN ('confirmed_threat', 'marked_safe'))
);

ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_access_logs_admin_feedback ON public.access_logs(admin_feedback);

-- ============================================================
-- RLS POLICIES - PROFILES
-- ============================================================
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING ((SELECT auth.uid()) = id);

CREATE POLICY "Admin xem toàn bộ hồ sơ" ON public.profiles
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- ============================================================
-- RLS POLICIES - PRODUCTS
-- ============================================================
CREATE POLICY "Cho phép xem danh sách Sản phẩm" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Chỉ Admin mới được thêm Sản phẩm" ON public.products
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Chỉ Admin mới được sửa Sản phẩm" ON public.products
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- ============================================================
-- RLS POLICIES - ORDERS
-- ============================================================
CREATE POLICY "Khách hàng tự đọc Đơn hàng cá nhân" ON public.orders
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Khách hàng tạo Đơn hàng của chính mình" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Admin và Sales xem toàn bộ Đơn hàng" ON public.orders
  FOR SELECT USING (
    ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin') OR
    ((SELECT role FROM profiles WHERE id = auth.uid()) = 'sales')
  );

CREATE POLICY "Shipper có thể thấy thông tin đơn hàng" ON public.orders
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'shipper'
  );

CREATE POLICY "Staff cập nhật trạng thái đơn" ON public.orders
  FOR UPDATE USING (
    ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'sales', 'shipper'))
  );

-- ============================================================
-- RLS POLICIES - CUSTOMERS
-- ============================================================
CREATE POLICY "Khách hàng đọc dữ liệu của mình" ON public.customers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Khách hàng hoặc API tự tạo profile khách" ON public.customers
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin và Sales mới được xem danh sách Khách" ON public.customers
  FOR SELECT USING (
    ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'sales'))
  );

-- ============================================================
-- RLS POLICIES - ORDER_ITEMS
-- ============================================================
CREATE POLICY "Khách hàng xem order_items cá nhân" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Khách hàng tạo order_items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Admin Sales xem toàn bộ order_items" ON public.order_items
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'sales')
  );

CREATE POLICY "Shipper xem order_items" ON public.order_items
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'shipper'
  );

-- ============================================================
-- RLS POLICIES - ACCESS LOGS
-- ============================================================
CREATE POLICY "Chỉ Admin xem Access Logs" ON public.access_logs
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Service role ghi access_logs" ON public.access_logs
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- TRIGGER: Auto-create profile on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'role', 'customer')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- SEED DATA: Sample products
-- ============================================================
INSERT INTO public.products (name, description, price, stock) VALUES
  ('Laptop Gaming MSI', 'Laptop gaming hiệu năng cao, RTX 4060, RAM 16GB', 25990000, 15),
  ('iPhone 15 Pro Max', 'Điện thoại flagship Apple, chip A17 Pro', 34990000, 30),
  ('Samsung Galaxy S24 Ultra', 'Điện thoại flagship Samsung, S Pen tích hợp', 31990000, 25),
  ('AirPods Pro 2', 'Tai nghe không dây Apple, chống ồn chủ động', 6290000, 50),
  ('Bàn phím cơ Keychron K8', 'Bàn phím cơ không dây, hot-swap, RGB', 2190000, 40),
  ('Màn hình Dell 27" 4K', 'Màn hình UltraSharp 4K IPS, 99% sRGB', 12990000, 20),
  ('Chuột Logitech MX Master 3S', 'Chuột không dây cao cấp, ergonomic', 2490000, 35),
  ('iPad Air M2', 'Máy tính bảng Apple, chip M2, 11 inch', 18990000, 22);

-- ============================================================
-- SEED DATA: Sample customers
-- ============================================================
INSERT INTO public.customers (name, email, phone, address) VALUES
  ('Nguyễn Văn An', 'an.nguyen@email.com', '0901234567', '123 Nguyễn Huệ, Q.1, TP.HCM'),
  ('Trần Thị Bình', 'binh.tran@email.com', '0912345678', '456 Lê Lợi, Q.3, TP.HCM'),
  ('Lê Hoàng Cường', 'cuong.le@email.com', '0923456789', '789 Trần Hưng Đạo, Q.5, TP.HCM'),
  ('Phạm Minh Đức', 'duc.pham@email.com', '0934567890', '321 Hai Bà Trưng, Q.1, TP.HCM'),
  ('Võ Thị Em', 'em.vo@email.com', '0945678901', '654 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM');
