# Deploy backend lên VPS Bitzfly

Quy trình chung để deploy 1 backend Node.js (Express) lên VPS Bitzfly, dùng cho các dự án Zalo OA theo từng xã (DAKPRING, hoatien, dailoc...) chạy chung 1 VPS.

**Kiến trúc:** Frontend (Vercel) ↔ Backend (VPS + PM2 + Nginx + Certbot) ↔ MongoDB Atlas / Upstash Redis ↔ Zalo OA API

## 1. SSH access

Tạo keypair riêng cho từng việc — 1 key cho admin, 1 key riêng **chỉ để CI/CD** dùng (không dùng chung key cá nhân):

```bash
ssh-keygen -t ed25519 -f ~/.ssh/<app>_deploy -N ""
ssh-keygen -t ed25519 -f ~/.ssh/<app>_github_deploy -N ""
```

Cài public key vào `~/.ssh/authorized_keys` trên VPS (qua SSH có sẵn, hoặc 1 lần bằng password nếu chưa có access).

## 2. Khảo sát VPS trước khi đụng gì

Bắt buộc nếu VPS đã có app khác — tránh trùng port/tên app:

```bash
pm2 list                          # xem port/tên app đã dùng
ls /etc/nginx/sites-available/    # xem pattern nginx đang dùng (copy theo)
ss -tlnp | grep node              # xem port nào đang free
```

## 3. Provision app

```bash
mkdir -p /var/www/<app> && cd /var/www/<app>
git clone <repo-url> .
# Tạo .env (copy giá trị thật từ host cũ, không tạo mới)
npm install --omit=dev
pm2 start server.js --name <app>-backend --cwd /var/www/<app>
pm2 save
curl http://localhost:<port>/health   # sanity check
```

## 4. DNS + Nginx + SSL

- Thêm A record: `<subdomain>` → IP VPS. Kiểm tra trước khi làm SSL:
  ```bash
  nslookup <domain> 8.8.8.8
  ```
- Tạo `/etc/nginx/sites-available/<app>`, copy pattern từ app đã có (chỉ đổi `server_name` + `proxy_pass` port):
  ```nginx
  server {
      listen 80;
      server_name <domain>;
      location / {
          proxy_pass http://localhost:<port>;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection 'upgrade';
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_cache_bypass $http_upgrade;
      }
  }
  ```
  ```bash
  ln -sf /etc/nginx/sites-available/<app> /etc/nginx/sites-enabled/<app>
  nginx -t && systemctl reload nginx
  ```
- Cài SSL:
  ```bash
  certbot --nginx -d <domain> --non-interactive --agree-tos -m <email> --redirect
  ```

## 5. CI/CD (GitHub Actions)

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: SSH vào VPS và deploy
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_PRIVATE_KEY }}
          port: ${{ secrets.VPS_PORT || 22 }}
          script: |
            cd ${{ secrets.VPS_APP_DIR }}
            git pull origin main
            npm install --production
            pm2 restart <app>-backend || pm2 start server.js --name <app>-backend
            echo "✅ Deploy xong: $(date)"
```

4 secrets cần thêm (GitHub repo → Settings → Secrets and variables → Actions):

| Secret | Giá trị |
|---|---|
| `VPS_HOST` | IP VPS |
| `VPS_USER` | `root` |
| `VPS_PRIVATE_KEY` | private key của key CI/CD riêng (bước 1) |
| `VPS_APP_DIR` | `/var/www/<app>` |

⚠️ **Gotcha**: push file trong `.github/workflows/` sẽ bị GitHub reject nếu Personal Access Token thiếu scope **`workflow`**. Tạo token có sẵn scope tại:
`https://github.com/settings/tokens/new?scopes=repo,workflow`

## 6. Frontend (Vercel)

Set biến môi trường rồi redeploy:

```
VITE_API_URL=https://<domain-vps-moi>
```

## 7. Zalo OA console (nếu backend có webhook/OAuth Zalo)

Thứ tự bắt buộc — sai thứ tự sẽ verify fail:

1. **Verify domain mới trước** (Zalo cho meta tag hoặc file `zalo_verifierXXXX.html` — thêm vào code nếu domain mới chưa từng verify, route file đó public không cần auth).
2. Sau khi domain verify xong, đổi **Webhook URL** → `https://<domain>/webhook`.
3. Đổi **OAuth Callback URL** → `https://<domain>/oauth` (hoặc route OAuth tương ứng).
4. Giữ domain cũ trong danh sách verify cho tới khi domain mới chạy ổn định, không xoá vội.

## 8. Cutover

Theo dõi vài ngày (webhook thật, cron, OAuth) trước khi tắt host cũ (Render/...).

## Gotcha khác đã gặp

- Trên Windows chưa có `sshpass`/`plink`: dùng package `ssh2` (npm) cài tạm vào thư mục temp để tự động hoá SSH bằng password đúng 1 lần (cài public key mới), sau đó luôn chuyển sang key-based và xoá script chứa password ngay.
- Không nhúng GitHub PAT thẳng vào git remote URL (`https://ghp_xxx@github.com/...`) trên VPS — lộ token trong `git remote -v`. Ưu tiên SSH deploy key hoặc PAT chỉ lưu trong GitHub Actions secret.
- Domain verify Zalo có thể đã pass ngay nếu route verifier cũ trong code đã match sẵn — kiểm tra `pm2 logs` thực tế trước khi giả định cần sửa code.
