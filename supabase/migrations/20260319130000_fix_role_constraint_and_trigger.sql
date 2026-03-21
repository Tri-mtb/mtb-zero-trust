-- ============================================================
-- FIX #1: Thêm 'customer' vào CHECK constraint cho profiles.role
-- Vấn đề: Constraint cũ chỉ cho phép 'admin', 'sales', 'shipper'
-- nhưng middleware và gateway đều fallback về 'customer'
-- ============================================================

-- Xóa constraint cũ (tên mặc định do Postgres sinh ra)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Thêm constraint mới bao gồm 'customer'
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'sales', 'shipper', 'customer'));

-- Đổi DEFAULT từ 'sales' sang 'customer' (đúng logic Zero Trust: least privilege)
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'customer';

-- ============================================================
-- FIX #2: Cập nhật trigger handle_new_user() để gán role từ metadata
-- Vấn đề: Trigger cũ không insert cột 'role', 
-- dẫn đến mọi user mới đều nhận default 'sales'
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
