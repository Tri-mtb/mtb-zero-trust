# Frontend

Frontend Next.js cho dashboard Zero Trust.

## Yêu cầu

- Node.js 20+
- File `frontend/.env.local`

## Biến môi trường

Sao chép `frontend/.env.example` thành `frontend/.env.local` và điền:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GATEWAY_URL`

## Chạy local

```bash
npm install
npm run dev
```

Frontend mặc định chạy tại `http://localhost:3000`.

## Kiểm tra

```bash
npm run lint
npm run build
```
