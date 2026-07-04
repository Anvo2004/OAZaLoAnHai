# Tích hợp gửi phản ánh Zalo OA phường An Hải → Cổng góp ý 1022

_Cập nhật: 04/07/2026_

## Mục tiêu
Khi người dân gửi phản ánh qua Zalo OA phường An Hải, hệ thống phát **đồng thời tới 3 nơi**:
1. **Web dashboard** quản trị của phường (đã có sẵn)
2. **Nhóm Zalo** nội bộ của phường để cán bộ bàn luận (đã có sẵn)
3. **Cổng góp ý 1022** — `gopy.danang.gov.vn` (phần **mới** làm)

## Cách kết nối tới 1022 (đã kiểm chứng thực tế)
Tài liệu API bản 2022 đã lỗi thời so với hệ thống production. Sau khi dò thực tế, cơ chế đúng là:

| Hạng mục | Giá trị đúng |
|---|---|
| Endpoint gửi phản ánh | `POST https://gopy.danang.gov.vn/api/gopy` |
| Xác thực | **HTTP Basic Auth** (username/password) — không phải token JWT |
| Tài khoản | `appdnsmartcity` |
| Bắt buộc | Header **User-Agent trình duyệt** (WAF chặn 403 nếu thiếu) |
| Header Accept | `*/*` (nếu để `application/json` bị lỗi 406) |
| `nguonGopY` | Bắt buộc đúng chữ **`Zalo`** (giá trị đăng ký sẵn; chuỗi khác báo lỗi "does not exist") |
| Danh mục lĩnh vực | Lấy ở `GET /api/gopy` … `/api/chude` để map `linhVucId` |

**Lưu ý quan trọng:** KHÔNG cần xin whitelist IP. Ban đầu bị lỗi 403 chỉ vì thiếu User-Agent trình duyệt, không phải do chặn IP.

## Ánh xạ loại phản ánh (An Hải → lĩnh vực 1022)
| Loại của phường | → Lĩnh vực 1022 (id) |
|---|---|
| Môi trường, Hạ tầng | Hạ tầng đô thị (1) |
| Văn hóa, Giáo dục, Y tế | Lĩnh vực khác (22) |
| Dịch vụ công, TTHC | Công vụ - Công chức (5000) |
| An ninh, Trật tự, PCCC | An ninh trật tự (21) |

## Cách hoạt động
- Phản ánh mới → tự đẩy sang 1022 ngay. Nếu 1022 lỗi mạng, hệ thống **không chặn người dân** — vẫn nhận phản ánh, rồi tự thử lại mỗi 10 phút.
- Trên web quản trị có huy hiệu trạng thái: **☁️ 1022 ✓** (đã đồng bộ) / **⏳** (đang chờ).
- Chỉ phản ánh **mới** (từ khi bật tích hợp) được đẩy; các phản ánh cũ trước đó không đẩy.

## Trạng thái hiện tại
- ✅ Đã chạy chính thức trên máy chủ. Đã gửi thử thành công 1 phản ánh — lên 1022 với **mã gopyId 104889**.
- ⚠️ **Cần nhờ hỗ trợ:** bản ghi **gopyId 104889** là dữ liệu **test** (nội dung "Vui lòng bỏ qua"). Tài khoản `appdnsmartcity` chỉ có quyền GET/POST, **không xoá được**. Nhờ bên quản trị 1022 **xoá/ẩn giúp bản ghi gopyId 104889**.

## Tóm lại
Tích hợp đã hoàn tất và đang chạy. Từ nay mọi phản ánh của người dân qua Zalo phường An Hải sẽ tự động xuất hiện trên Cổng 1022 (nguồn "Zalo"). Việc duy nhất cần bên 1022 hỗ trợ là **xoá bản test gopyId 104889**.
