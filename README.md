# MTB Zero Trust System

He thong demo Zero Trust gom 4 service:

- `frontend`: Next.js dashboard
- `gateway`: Zero Trust Gateway / PEP
- `protected-api`: API nghiep vu e-commerce
- `ai-engine`: FastAPI risk engine / PDP

## Yeu cau moi truong

- Node.js 20+
- npm 10+
- Python 3.10+

## Cong mac dinh

- `frontend`: `http://localhost:3000`
- `gateway`: `http://localhost:8080`
- `protected-api`: `http://localhost:4000`
- `ai-engine`: `http://localhost:5000`

## Thiet lap bien moi truong

1. Frontend:
   - copy `frontend/.env.example` -> `frontend/.env.local`
2. Gateway:
   - copy `gateway/.env.example` -> `gateway/.env`
3. Protected API:
   - copy `protected-api/.env.example` -> `protected-api/.env`
4. AI Engine:
   - copy `ai-engine/.env.example` -> `ai-engine/.env`
5. Dat cung mot gia tri `INTERNAL_GATEWAY_SECRET` trong `gateway/.env` va `protected-api/.env`

## Cai dependency

### Frontend

```bash
cd frontend
npm install
```

### Gateway

```bash
cd gateway
npm install
```

### Protected API

```bash
cd protected-api
npm install
```

### AI Engine

```bash
cd ai-engine
python -m venv venv
venv\Scripts\pip install -r requirements.txt
```

## Chay tung service

### Frontend

```bash
cd frontend
npm run dev
```

### Gateway

```bash
cd gateway
npm run start
```

### Protected API

```bash
cd protected-api
npm run start
```

`protected-api` mac dinh bind tren `127.0.0.1` va chi chap nhan request noi bo co `INTERNAL_GATEWAY_SECRET` hop le.

### AI Engine

```bash
cd ai-engine
venv\Scripts\activate
python main.py
```

AI engine doc chinh sach tu `ai-engine/.env`, bao gom geoblock, khung gio lam viec, rate threshold va model threshold.

## Chay nhanh toan bo

Sau khi da cai dependency va tao `.env`, chay:

```bat
start_all.bat
```

Script nay chi khoi dong service, khong tu cai lai dependency.

## Kiem tra co ban

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

### Gateway

```bash
cd gateway
npm run check
```

### Protected API

```bash
cd protected-api
npm run check
```

### AI Engine

```bash
cd ai-engine
python -m py_compile main.py
```

## Database va user seed

- Supabase project phai chay day du migration trong `supabase/migrations` hoac import `supabase/full_setup.sql` neu dang setup moi.
- Khong chen truc tiep vao `auth.users` bang SQL thu cong de tao tai khoan dang nhap. Cach nay de lam user auth bi hong schema hoac thieu metadata noi bo.
- De tao cac tai khoan staff mau, them `SUPABASE_SERVICE_ROLE_KEY` that vao `protected-api/.env` roi chay:

```bash
node create_users.js
```

- Script nay dung Supabase Admin API de tao/cap nhat `admin@mtb.com`, `sales@mtb.com`, `shipper@mtb.com` voi email da confirm san.

## Ghi chu

- `create_users.js` doc `SUPABASE_URL` va `SUPABASE_SERVICE_ROLE_KEY` tu `protected-api/.env`.
- `gateway` va `protected-api` phai dung cung `INTERNAL_GATEWAY_SECRET`, neu lech gia tri request se bi tu choi.
- Frontend da build duoc offline, nhung backend van con cac van de RBAC nghiep vu o giai doan tiep theo.
