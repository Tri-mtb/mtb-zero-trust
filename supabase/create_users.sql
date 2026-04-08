-- ============================================================
-- TẠO USER TEST (chạy trong SQL Editor Supabase Dashboard)
-- ============================================================

-- Bước 1: Xóa profiles trước (vì có foreign key đến auth.users)
DELETE FROM public.profiles 
WHERE id IN (SELECT id FROM auth.users WHERE email IN ('admin@mtb.com', 'sales@mtb.com', 'shipper@mtb.com'));

-- Bước 2: Xóa user cũ
DELETE FROM auth.users WHERE email IN ('admin@mtb.com', 'sales@mtb.com', 'shipper@mtb.com');

-- Bước 3: Tạo Admin user
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(), 'authenticated', 'authenticated',
  'admin@mtb.com',
  crypt('admin123456', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"admin","full_name":"Admin MTB"}',
  ''
);

-- Bước 4: Tạo Sales user
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(), 'authenticated', 'authenticated',
  'sales@mtb.com',
  crypt('sales123456', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"sales","full_name":"Sales Staff"}',
  ''
);

-- Bước 5: Tạo Shipper user
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(), 'authenticated', 'authenticated',
  'shipper@mtb.com',
  crypt('shipper123456', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"shipper","full_name":"Shipper Staff"}',
  ''
);

-- Bước 6: Kiểm tra kết quả
SELECT u.email, p.role, p.full_name, u.email_confirmed_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
ORDER BY u.created_at;
-- ============================================================
-- DEPRECATED
-- Khong nen dung file nay de seed auth user nua.
-- Supabase Auth hien tai co them bang/schema noi bo, nen viec INSERT
-- truc tiep vao auth.users co the tao ra tai khoan dang nhap bi hong.
--
-- Thay vao do:
-- 1. Chay day du migration hoac full_setup.sql
-- 2. Dat SUPABASE_SERVICE_ROLE_KEY that vao protected-api/.env
-- 3. Chay: node create_users.js
-- ============================================================
