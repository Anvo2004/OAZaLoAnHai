# Prompt thiết kế slide báo cáo — Hệ thống Góp ý/Phản ánh qua Zalo OA (UBND phường An Hải)

> Copy toàn bộ nội dung dưới đây và dán vào công cụ tạo slide bằng AI (Gamma, Tome, Canva Magic Design, Microsoft Designer/Copilot, hoặc ChatGPT/Claude có xuất PowerPoint). Đính kèm thêm file `BaoCao_HeThong_GopY_PhanAnh_AnHai.docx` (cùng thư mục) làm tài liệu nguồn nếu công cụ cho phép upload file.

---

## PROMPT

Bạn là chuyên gia thiết kế slide thuyết trình cho cơ quan nhà nước. Hãy tạo một bộ slide (PowerPoint/Google Slides, khoảng 16–18 slide) báo cáo về **"Hệ thống tiếp nhận và xử lý Góp ý – Phản ánh của người dân qua Zalo OA"** áp dụng tại UBND phường An Hải, TP. Đà Nẵng.

### Phong cách thiết kế
- Tông màu chủ đạo: xanh lá đậm (#1B5E20) và xanh navy (#0D2B4E), nền trắng/xanh nhạt, đồng bộ với màu logo UBND phường An Hải (logo tròn, rồng vàng, cầu Rồng).
- Phong cách hành chính – chuyên nghiệp – hiện đại, nhiều icon đơn giản (điện thoại, chuông thông báo, tài liệu, dấu tick xanh), tương tự phong cách infographic hướng dẫn sử dụng Zalo OA đã có (bố cục theo bước, số thứ tự trong khung tròn màu).
- Mỗi slide tối đa 1 ý chính, ưu tiên sơ đồ/luồng mũi tên và bảng so sánh hơn là đoạn văn dài.
- Dùng tiếng Việt có dấu, văn phong hành chính, ngắn gọn.

### Cấu trúc nội dung từng slide

1. **Trang bìa**: "BÁO CÁO HỆ THỐNG TIẾP NHẬN – XỬ LÝ GÓP Ý, PHẢN ÁNH QUA ZALO OA — UBND phường An Hải, TP. Đà Nẵng".
2. **Tổng quan hệ thống**: 2 thành phần (Zalo OA Bot tiếp nhận ↔ Web Admin xử lý nội bộ) + 4 vai trò sử dụng (Người dân, Cán bộ, Trưởng phòng, Quản trị viên).
3. **Sơ đồ quy trình tổng thể** (sơ đồ luồng 6 bước, dùng mũi tên):
   Gửi góp ý → Tiếp nhận → Phân công → Xử lý (dự thảo) → Duyệt/Từ chối → Phản hồi → Tra cứu. Ghi rõ trạng thái dữ liệu: pending → draft → resolved (từ chối quay lại pending).
4. **Quy trình người dân gửi góp ý (7 bước)**: Quan tâm OA → Gõ "góp ý/phản ánh" → Nhập SĐT/email → Chọn loại phản ánh (1–4) → Nhập nội dung → Gửi tối đa 5 ảnh → Xác nhận & nhận mã hồ sơ (#XXXXX). Có thể tái sử dụng bố cục bước-số-tròn giống tài liệu hướng dẫn gốc.
5. **Tra cứu tình trạng xử lý**: gõ "tra cứu góp ý" → xem 5 hồ sơ gần nhất, hoặc gõ mã hồ sơ trực tiếp → xem chi tiết + nội dung phản hồi nếu đã xử lý xong.
6. **Quy trình xử lý nội bộ** (sơ đồ luồng giữa 3 vai trò: Trưởng phòng – Cán bộ – Hệ thống thông báo): phân công → xử lý/soạn dự thảo → duyệt hoặc từ chối → gửi phản hồi.
7. **Chức năng của Người dân** (danh sách bullet: gửi phản ánh, gửi ảnh, nhận mã hồ sơ, tra cứu, nhận phản hồi, huỷ quy trình).
8. **Chức năng của Cán bộ** (đăng nhập web, xem hồ sơ được giao, soạn dự thảo + đính kèm ảnh/video/file, nộp duyệt, nhận thông báo, tìm kiếm hồ sơ).
9. **Chức năng của Trưởng phòng** (phân công, duyệt/từ chối, gửi phản hồi cuối, gửi/lên lịch broadcast Zalo, quản lý nhóm Zalo, xem nhật ký gửi tin).
10. **Chức năng của Quản trị viên (superadmin)** (quản lý người dùng & danh mục, toàn quyền hồ sơ + xoá hồ sơ, toàn quyền broadcast & nhóm Zalo).
11. **Hệ thống thông báo đa kênh**: bảng 3 cột (Sự kiện | Kênh thông báo: Chuông web / Email / Nhóm Zalo có @mention) — lấy đúng nội dung bảng trong báo cáo Word mục VI.
12. **Chức năng gửi tin nhắn Zalo (Broadcast) — Đối tượng & nội dung**: gửi tới người dùng cá nhân hoặc nhóm Zalo; loại nội dung: văn bản, hình ảnh, video (kèm thumbnail + nút liên kết), file đính kèm (.docx/.pdf/.xlsx/.xls), liên kết (link).
13. **Đặt lịch gửi tin nhắn Zalo**: chọn thời điểm gửi trong tương lai → hệ thống tự kiểm tra mỗi 30 giây để gửi đúng lịch → theo dõi tiến trình gửi (job) → xem/huỷ tin đã lên lịch → lưu nhật ký gửi.
14. **Quản lý & đồng bộ nhóm Zalo**: tạo nhóm Zalo mới ngay từ Web (chọn thành viên) + đồng bộ 2 chiều Zalo ↔ Web (theo webhook thời gian thực và định kỳ 30 phút, tự tạo/sửa danh mục tương ứng, lưu danh sách thành viên nhóm).
15. **Ma trận phân quyền hệ thống**: bảng 4 cột (Chức năng | Superadmin | Trưởng phòng | Cán bộ) — lấy đúng bảng trong báo cáo Word mục IX.
16. **Thông số kỹ thuật & giới hạn hệ thống**: bảng các giới hạn (5 ảnh/phản ánh, hạn xử lý 3 ngày, giới hạn dung lượng đính kèm, chu kỳ đồng bộ...) — lấy đúng bảng mục X.
17. **Lợi ích / Kết luận**: minh bạch (tra cứu trực tiếp), kiểm soát 2 cấp duyệt, không bỏ sót thông báo, chủ động truyền thông qua broadcast + nhóm Zalo, tận dụng kênh quen thuộc với người dân.
18. **Trang kết / Hỏi đáp**: Cảm ơn — UBND phường An Hải, TP. Đà Nẵng.

### Yêu cầu bổ sung
- Với các slide có bảng (11, 15, 16), giữ đúng số liệu/nội dung như trong tài liệu nguồn, không tự suy diễn thêm.
- Với slide sơ đồ quy trình (3, 6), vẽ dạng flowchart ngang có mũi tên, không dùng bullet thường.
- Giữ văn phong ngắn gọn, mỗi bullet không quá 12–15 từ, tránh đoạn văn dài trên slide.
- Có thể tách slide 4 và 12 thành 2 slide nếu nội dung quá dài cho 1 trang.

---

### Gợi ý dùng kèm file Word
File `BaoCao_HeThong_GopY_PhanAnh_AnHai.docx` (đã tạo sẵn trong thư mục `Document/`) chứa đầy đủ nội dung chi tiết cho từng mục trên, dùng làm:
- Tài liệu báo cáo đầy đủ (in/gửi kèm).
- Nguồn nội dung chính xác để copy vào từng slide ở trên, tránh phải gõ lại hoặc bị AI suy diễn sai số liệu (giới hạn ảnh, thời gian, bảng phân quyền...).
