-- ============================================================
-- FIX: Xóa các RLS policies quá rộng từ migration đầu tiên
-- Vấn đề: Migration 20260310 tạo "Allow full access for authenticated users"
-- cho mọi bảng, cho phép bất kỳ authenticated user nào thao tác mọi thứ.
-- Migration 20260317 đã tạo các policies chi tiết hơn theo role.
-- Cần xóa các policies cũ quá rộng để tránh bypass bảo mật.
-- ============================================================

-- Xóa policies cũ quá rộng trên products
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON public.products;

-- Xóa policies cũ quá rộng trên customers
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON public.customers;

-- Xóa policies cũ quá rộng trên orders
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON public.orders;

-- Xóa policies cũ quá rộng trên order_items
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON public.order_items;

-- Xóa policies cũ quá rộng trên access_logs
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON public.access_logs;

-- ============================================================
-- Thêm RLS policies còn thiếu cho order_items
-- ============================================================

-- Khách hàng chỉ xem order_items của đơn hàng họ sở hữu
CREATE POLICY "Khách hàng xem order_items cá nhân" ON public.order_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.customer_id = auth.uid()
  )
);

-- Khách hàng tạo order_items cho đơn của mình
CREATE POLICY "Khách hàng tạo order_items" ON public.order_items
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.customer_id = auth.uid()
  )
);

-- Admin và Sales xem toàn bộ order_items
CREATE POLICY "Admin Sales xem toàn bộ order_items" ON public.order_items
FOR SELECT USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'sales')
);

-- Shipper xem order_items (cần biết item để giao hàng)
CREATE POLICY "Shipper xem order_items" ON public.order_items
FOR SELECT USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'shipper'
);

-- ============================================================
-- Thêm policy cho access_logs INSERT (service role bypass RLS,
-- nhưng cần policy cho edge cases)
-- ============================================================
CREATE POLICY "Service role ghi access_logs" ON public.access_logs
FOR INSERT WITH CHECK (true);
