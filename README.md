# Zalo OA Góp Ý — UBND Phường An Hải

Hệ thống tiếp nhận và xử lý phản ánh/góp ý của người dân qua **Zalo Official Account**, kết hợp dashboard web cho cán bộ phường quản lý, phân công, và phản hồi.

## Luồng hoạt động

1. **Người dân** gửi phản ánh (text/hình ảnh) qua Zalo OA → bot tiếp nhận, phân loại theo danh mục.
2. **Cán bộ phụ trách (officer)** soạn nội dung xử lý (draft).
3. **Lãnh đạo phòng (dept_leader)** duyệt hoặc từ chối draft.
4. Khi duyệt, phản hồi được gửi tự động về cho người dân qua Zalo, kèm thông báo vào nhóm Zalo của danh mục liên quan.

## Cấu trúc thư mục

```
/
├── Backend/        Express + MongoDB — API, webhook Zalo, admin EJS, business logic
├── Frontend/Web/   React 19 + Vite + Tailwind — dashboard quản lý cho cán bộ
├── Document/       Tài liệu vận hành (deploy, quy trình)
├── CLAUDE.md        Hướng dẫn kiến trúc chi tiết (dành cho Claude Code / dev mới)
└── .github/workflows/  CI/CD — tự deploy lên VPS khi push nhánh main
```

## Chạy dev local

**Backend** (port 3001):
```bash
cd Backend
npm install
npm run dev
```

**Frontend** (port 5173, proxy `/api` → `localhost:3001`):
```bash
cd Frontend/Web
npm install
npm run dev
```

Cần file `Backend/.env` với các biến môi trường (Mongo, Zalo OA, Redis, Cloudinary, JWT...) — xem bảng đầy đủ trong [CLAUDE.md](CLAUDE.md#env-vars-and-their-consumers).

## Triển khai production

- **Backend**: chạy trên VPS bằng PM2, tự động deploy qua GitHub Actions mỗi khi push `main` — chi tiết tại [Document/DEPLOY.md](Document/DEPLOY.md).
- **Frontend**: deploy lên Vercel (Root Directory = `Frontend/Web`), trỏ `VITE_API_URL` về domain backend.

## Tài liệu thêm

- [CLAUDE.md](CLAUDE.md) — kiến trúc, luồng request, các module chính, bảng env var.
- [Document/DEPLOY.md](Document/DEPLOY.md) — playbook deploy VPS (SSH, Nginx, SSL, CI/CD, cutover Zalo OAuth/webhook).
