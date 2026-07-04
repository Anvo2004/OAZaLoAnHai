**CÔNG TY CỔ PHẦN CÔNG NGHỆ THÔNG TIN TOÀN CẦU XANH**

**--------------**









**NÂNG CẤP HỆ THỐNG GÓP Ý**

**Tài liệu mô tả API cho Mobile**















**ĐÀ NẴNG, 12/2022**
66

<a name="_heading=h.gjdgxs"></a>**MỤC LỤC**

[**A.**	**TỔNG QUAN	**3****](#_toc139015614)

[1.	Mô tả nghiệp vụ	3](#_toc139015615)

[2.	Mục đích tài liệu	3](#_toc139015616)

[3.	Phạm vi và đối tượng áp dụng	3](#_toc139015617)

[**B.**	**ĐẶC TẢ API	**4****](#_toc139015618)

[1.	Thông tin truy cập hệ thống	4](#_toc139015619)

[2.	API public cho công dân	4](#_toc139015620)

[2.1.	Danh sách API Góp ý	4](#_toc139015621)

[2.1.1.	API đăng nhập cho công dân	4](#_toc139015622)

[2.1.2.	API đăng ký tài khoản cho công dân	5](#_toc139015623)

[2.1.3.	API lấy danh sách góp ý	6](#_toc139015624)

[2.1.4.	API thêm mới góp ý	8](#_toc139015625)

[2.1.5.	API lấy chi tiết góp ý	9](#_toc139015626)

[2.1.6.	API lấy lịch sử góp ý của công dân	11](#_toc139015627)

[2.1.7.	API lấy số lượng góp ý chờ xử lý của đơn vị theo email của người dùng	13](#_toc139015628)

[2.1.8.	API thêm đánh giá của công dân với kết quả xử lý	13](#_toc139015629)

[2.1.9.	API thêm tương tác cho công dân	14](#_toc139015630)

[2.2.	Danh sách API các danh mục	14](#_toc139015631)

[2.2.1.	API lấy danh sách danh mục cơ quan xử lý	14](#_toc139015632)

[2.2.2.	API lấy danh sách danh mục chủ đề (lĩnh vực)	15](#_toc139015633)

[2.2.3.	API lấy danh sách cấp độ sự cố	16](#_toc139015634)

[2.2.4.	API lấy danh sách đơn vị hành chính	17](#_toc139015635)

[2.2.5.	API lấy danh sách tag	18](#_toc139015636)

[2.3.	API upload file	19](#_toc139015637)

[2.4.	API thông báo	19](#_toc139015638)

[2.4.1.	API lấy danh sách thông báo	19](#_toc139015639)

[2.4.2.	API lấy danh sách thông báo chưa đọc	20](#_toc139015640)

[2.4.3.	API update thông báo	21](#_toc139015641)

[3.	API cho admin	21](#_toc139015642)

[3.1.	Danh sách API đăng nhập	21](#_toc139015643)

[3.1.1.	API đăng nhập cho admin	21](#_toc139015644)

[3.1.2.	API lấy thông tin tài khoản đăng nhập	22](#_toc139015645)

[3.2.	Danh sách API góp ý	22](#_toc139015646)

[3.2.1.	API lấy danh sách góp ý kèm thông tin xử lý	22](#_toc139015647)

[3.2.2.	API lấy chi tiết xử lý thông tin của góp ý	24](#_toc139015648)

[3.2.3.	API xử lý góp ý	26](#_toc139015649)

[3.2.4.	API chuyển tiếp góp ý	29](#_toc139015650)

[3.2.5.	API chỉnh sửa góp ý	31](#_toc139015651)

[3.2.6.	API chuyển trạng thái góp ý đã xem	33](#_toc139015652)

[3.2.7.	API lấy danh sách góp ý không có phân trang	33](#_toc139015653)

[3.2.8.	API upload file	35](#_toc139015654)

[3.3.	Danh sách API các danh mục	35](#_toc139015655)

[3.3.1.	API lấy danh sách cấp độ sự cố	35](#_toc139015656)

[3.3.2.	API lấy danh sách cơ quan quản lý	37](#_toc139015657)

[3.3.3.	API lấy danh sách cơ quan quản lý con theo cha	38](#_toc139015658)

[3.3.4.	API lấy danh sách đơn vị hành chính	39](#_toc139015659)

[3.3.5.	API lấy danh sách lĩnh vực	40](#_toc139015660)

[3.3.6.	API lấy danh sách tag	41](#_toc139015661)

[3.4.	Danh sách các API báo cáo thống kê	42](#_toc139015662)

[3.4.1.	API báo cáo thống kê	42](#_toc139015663)

[3.4.2.	API báo cáo thống kê theo đơn vị xử lý	43](#_toc139015664)

[3.4.3.	API báo cáo thống kê theo đánh giá của công dân	45](#_toc139015665)

[3.4.4.	API báo cáo thống kê theo lĩnh vực	45](#_toc139015666)

[3.4.5.	API báo cáo thống kê theo tag	47](#_toc139015667)

[3.4.6.	API báo cáo thống kê theo địa bàn diễn ra	48](#_toc139015668)

[3.4.7.	API báo cáo thống kê số liệu tổng quan	50](#_toc139015669)

[3.5.	Danh sách các API báo cáo thống kê bản đồ	51](#_toc139015670)

[3.5.1.	API báo cáo thống kê bản đồ	51](#_toc139015671)

[3.5.2.	API báo cáo thống kê theo lĩnh vực	52](#_toc139015672)

[3.5.3.	API báo cáo thống kê bản đồ theo đơn vị xử lý	53](#_toc139015673)

[3.5.4.	API báo cáo thống kê bản đồ theo địa bàn diễn ra	55](#_toc139015674)

[4.	Danh sách các API chia sẻ tích hợp	57](#_toc139015675)

[4.1.	API lấy dữ liệu báo cáo số liệu thống kê tổng hợp đơn vị theo trạng thái	57](#_toc139015676)

[4.2.	API lấy số liệu thống kê tổng hợp dạng biểu đồ theo trạng thái xử lý trên bản đồ GIS	58](#_toc139015677)

[4.3.	Xác thực thông tin tài khoản truy cập dịch vụ/ người sử dụng với hệ thống	66](#_toc139015678)

[4.4.	Bổ sung Service trả danh sách phản ánh kèm kết quả đánh giá cho hệ thống ngoài	66](#_toc139015679)




1. # <a name="_toc139015614"></a>**TỔNG QUAN**
1. ## <a name="_toc139015615"></a>**Mô tả nghiệp vụ**
   Ứng dụng Góp ý là một kênh để người dân và du khách tham gia đóng góp ý, phản ánh các vấn đề trên địa bàn để các cơ quan nhà nước biết, kịp thời xử lý.

   Phần mềm phục vụ trên cả phiên bản web và mobile, cho nhiều đối tượng sử dụng.
1. ## <a name="_toc139015616"></a>**Mục đích tài liệu**
   Tài liệu này nhằm mô tả các API trao đổi dữ liệu trên hệ thống.
1. ## <a name="_toc139015617"></a>**Phạm vi và đối tượng áp dụng**
   Tài liệu này được sử dụng bởi các kỹ thuật viên của các đơn vị xây dựng phần mềm Cổng góp ý.


1. # <a name="_toc139015618"></a>**ĐẶC TẢ API**
1. ## <a name="_toc139015619"></a>**Thông tin truy cập hệ thống**
**-**  **Domain test: [**https://cgy.greenglobal.com.vn/api**](https://cgy.greenglobal.com.vn/api)**
1. ## <a name="_toc139015620"></a>**API public cho công dân**
   1. ### <a name="_toc139015621"></a>**Danh sách API Góp ý**
      1. #### <a name="_toc139015622"></a>***API đăng nhập cho công dân***
- Đường dẫn: Domain + /userlogin
- Method: GET
- **Đầu vào**:
  - Parameter:

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :- | :- | :- | :- | :- |
||maTaiKhoan|string|mã của tài khoản|x|
||loaiTaiKhoan|string|loại tài khoản<br>Ex: FACEBOOK,...|x|

- **Đầu ra**:
  - **Thành công**: Chuỗi json chứa thông tin của tài khoản.
  - **Thất bại**: Chuỗi json như dưới

\-  Ví dụ:

|<p>{</p><p>`  `"data": {</p><p>`    `"soDienThoai": "0913663162",</p><p>`    `"soDienThoaiSearch": "0913663162",</p><p>`    `"tenDayDuSearch": "do van hai",</p><p>`    `"daXoa": false,</p><p>`    `"avatarUrl": "https://lh4.googleusercontent.com/-JGlI\_mR1HzQ/AAAAAAAAAAI/AAAAAAAAABU/AKq2SymJPMY/photo.jpg",</p><p>`    `"maTaiKhoan": "114434181998741026550",</p><p>`    `"emailSearch": "vanhai042016gmailcom",</p><p>`    `"tenDayDu": "Do Van Hai",</p><p>`    `"ngayTao": "2016-07-24 09:57:19.0",</p><p>`    `"loaiTaiKhoan": "GOOGLE",</p><p>`    `"ngaySua": "2019-06-03 14:21:51.0",</p><p>`    `"countBinhLuan": 53,</p><p>`    `"countYKien": 35,</p><p>`    `"id": 6055,</p><p>`    `"nguoiTao": "vanhai042016@gmail.com",</p><p>`    `"email": "vanhai042016@gmail.com",</p><p>`    `"nguoiSua": "maipt11@danang.gov.vn"</p><p>`  `}</p><p>}</p>|**{"data":null}**|
| :- | :- |

1. #### <a name="_toc139015623"></a>***API đăng ký tài khoản cho công dân***
- Đường dẫn: Domain + /saveuser
- Method: POST
- **Đầu vào**:
  - Request Body:

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :- | :- | :- | :- | :- |
||id|long|id của của tài khoản ( nếu tạo tài khoản mới thì truyền null)||
||email|string|Email 	|X|
||soDienThoai|string|Số điện thoại|X|
|4|tenDayDu|string |Họ và tên|X|
|5|tenDayDuSearch|string|Họ và tên không dấu||
|6|emailSearch|string|Email search||
|7|soDienThoaiSearch|string |Số điện thoại search||
|8|loaiTaiKhoan|string |loại tài khoản<br>EX: FACEBOOK,...|X|
|9|maTaiKhoan|string|Mã tài khoản|X|
|10|avatarUrl|string|đường dẫn hình đại diện||

- **Thành công**: Chuỗi json có dữ liệu sau
- **Thất bại**:

\- Ví dụ:

|**Thành công**|**Lỗi**|
| :- | :- |
|<p>{</p><p>`  `"id": "1"</p><p>}</p>||
1. #### <a name="_heading=h.710uke95kir4"></a><a name="_heading=h.uxegqz2biklh"></a><a name="_toc139015624"></a>***API lấy danh sách góp ý***
- Đường dẫn: Domain + /public/gopy
- Method: GET
- **Đầu vào**:
  - Parameter:

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
||keyword|string|Lọc theo từ khóa||
||coquan|long|Lọc theo Id cơ quan||
||linhvuc|long|`  `Lọc theo Id lĩnh vực||
|4|quanhuyen|long|`  `Lọc theo Id quận huyện||
|5|phuongxa|long|`  `Lọc theo id phường xã||
|6|tungay|string|`  `Lọc theo thời gian từ ngày||
|7|denngay|string|`  `Lọc theo thời gian đến ngày||
|8|capdosuco|long|`  `Lọc theo id cấp độ sự cố||
|9|tinhtrangxuly|string |`  `Lọc theo tình trạng xử lý||
|10|loai|int|<p>"Sắp xếp theo</p><p>1: thời gian (mặc định)</p><p>2: số quan tâm</p><p>3: số bình luận</p><p>khác: thời gian"				</p>||
|11|kieu|string|<p>"Sắp xếp:</p><p>asc: tăng dần</p><p>desc: giảm dần (mặc định)"		</p>||
|12|page|int|Default : 1||
|13|size|int|<p>Số phần tử trong 1 trang </p><p>Default : 15</p>||

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu sau
  - **Thất bại**: Không có dữ liệu




\- Ví dụ:

|**Thành công**|**Lỗi**|
| :- | :- |
|<p>** {</p><p>`      `"noiDungDanhGia": "",</p><p>`      `"tinhTrangXuLy": "Đang xử lý",</p><p>`      `"binhLuan": 0,</p><p>`      `"thoiGianDienRa": "14:36",</p><p>`      `"tenCoQuan": "UBND phường Hải Châu I",</p><p>`      `"tenChuDe": "Môi trường",</p><p>`      `"thongTinLienHeId": 50337,</p><p>`      `"noiDung": "Hiện nay tại địa chỉ 149 Nguyễn Nghiễm, tổ 62, phường Hòa Hải, quận Ngũ Hành Sơn đang tồn tại điểm tập kết mua bán phế liệu rác thải trong khu dân cư, đốt tiêu huỷ tại chỗ bốc mùi độc hại, bụi than đốt bay bụi khắp nhà dân, độc hại trong không khí khi hít thở. Trong khu dân cư không được cho phép tập kết rác thải phế liệu nhưng vẫn tồn tại từ tháng 4 năm 2022 tới nay. Người dân đã phản ánh phường, quận nhưng chưa ai xử lý dẹp bỏ. Hơn nữa phía biển là resot Vinpearl đón khách du lịch, ảnh hưởng đến sự cuộc sống của người dân, phát triển du lịch của địa phương.\nKính đề nghị thành phố nhanh chóng dẹp bỏ. Xin cảm ơn",</p><p>`      `"tieuDe": "Tập kết phế liệu gây ô nhiễm tại 149 Nguyễn Nhiễm",</p><p>`      `"maTinhTrangXuLy": "DANG\_XU\_LY",</p><p>`      `"ngayDienRa": "05/04/2023",</p><p>`      `"hinhAnh": [</p><p>`        `"https://cgy.greenglobal.com.vn//cgyfiles/2023/4/5/img\_thumb577326902\_1680680219764.jpg"</p><p>`      `],</p><p>`      `"rate": 0,</p><p>`      `"urlAnhDaiDien": "",</p><p>`      `"id": 47159,</p><p>`      `"mauNen": "#45B900",</p><p>`      `"danhGia": "",</p><p>`      `"quanTam": 0</p><p>`    `}</p>||

1. #### <a name="_toc139015625"></a>***API thêm mới góp ý***
- Đường dẫn: DOMAIN + /public/gopy
- Method: POST
- Đầu vào:
  - Request body:

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|userId|long|id góp ý|X|
|2|tenDayDu|string|tên đầy đủ của người gửi góp ý|X|
|3|email|string|email của người gửi góp ý|X|
|4|soDienThoai|string|số điện thoại của người gửi góp ý|X|
|5|tieuDe|string|tiêu đề góp ý|X|
|6|noiDungYKien|string|nội dung ý kiến phản ánh|X|
|7|noiDienRa|string|nơi diễn ra phản ánh|X|
|8|latitude|||X|
|9|longitude|||X|
|10|ngayDienRa|string|ngày diễn ra thông tin trong phản ánh|X|
|11|thoiGianDienRa|string|thời gian diễn ra thông tin trong phản ánh|X|
|12|videos|string|video mô tả phản ánh|X|
|13|amThanh|string|âm thanh mô tả phản ánh|X|
|14|url hinhAnhs|string|url hình ảnh mô tả phản ánh|X|
|15|ten hinhAnhs|string|tên hình ảnh mô tả phản ánh|X|
|16|url fileDinhKem|string|url file đính kèm phản ánh|X|
|17|fileDinhKem|string|tên file đính kèm phản ánh|X|
|18|linhVucId|integer|lĩnh vực phản ánh|X|
|19|nguonGopY|string|nguồn góp ý của phản ánh|X|

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu sau
  - **Thất bại**:



\- Ví dụ:

|**Thành công**|**Lỗi**|
| :- | :- |
|<p>** "userId": 0,</p><p>`  `"tenDayDu": "Nguyen Van A",</p><p>`  `"email": "anv@gmail.com",</p><p>`  `"soDienThoai": "0957444586",</p><p>`  `"tieuDe": "Xử lý việc hát karaoke cả ngày lẫn đêm",</p><p>`  `"noiDungYKien": "319 duong Nguyen Huu Tho hat karaoke ca ngay lan dem, nhac nho khong duoc",</p><p>`  `"noiDienRa": "319 Nguyen Huu Tho",</p><p>`  `"latitude": 0,</p><p>`  `"longitude": 0,</p><p>`  `"ngayDienRa": "20/12/2022",</p><p>`  `"thoiGianDienRa": "23:00",</p><p>`  `"videos": "string",</p><p>`  `"amThanh": "string",</p><p>`  `"hinhAnhs": [</p><p>`    `{</p><p>`      `"url": "string",</p><p>`      `"ten": "string"</p><p>`    `}</p><p>`  `],</p><p>`  `"fileDinhKem": {</p><p>`    `"url": "string"</p><p>`    `"ten": "string"</p><p>`  `},</p><p>`  `"linhVucId": 0,</p><p>`  `"nguonGopY": "Facebook"</p><p>}'</p>||
####
1. #### <a name="_heading=h.29hwk1nd0pl8"></a><a name="_toc139015626"></a>***API lấy chi tiết góp ý***
- Đường dẫn: DOMAIN + /public/gopy/{id}	
- Method: GET
- **Đầu vào**:
  - Path Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|id|long|id góp ý|X|

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau:
  - **Thất bại**: Không có dữ liệu.

\- Ví dụ:

|**Thành công**|**Lỗi**|
| :- | :- |
|<p>{</p><p>`  `"noiDungDanhGia": "",</p><p>`  `"tinhTrangXuLy": "Đã xử lý",</p><p>`  `"thoiGianDienRa": "15:29",</p><p>`  `"phuongXaDienRa": "",</p><p>`  `"video": "string",</p><p>`  `"noiDung": "bạn tiên mâu thuẫn với bạn hải trong quá trình làm việc, dẫn đen va chạm vật lý ",</p><p>`  `"listTuongTac": [],</p><p>`  `"tieuDe": "Mất an ninh trật tự tại Viettel",</p><p>`  `"maTinhTrangXuLy": "DA\_XU\_LY",</p><p>`  `"quanHuyenDienRa": "",</p><p>`  `"ngayDienRa": "15/12/2022",</p><p>`  `"hinhAnh": [],</p><p>`  `"maDanhGia": "",</p><p>`  `"webUrl": "https://cgy.greenglobal.com.vn//gop-y?pageid=view&ykien=29055",</p><p>`  `"urlAnhDaiDien": "",</p><p>`  `"linhVucId": 1,</p><p>`  `"id": 29055,</p><p>`  `"danhGia": "",</p><p>`  `"noiDienRa": "string",</p><p>`  `"tenLinhVuc": "Hạ tầng đô thị",</p><p>`  `"thongTinXuLy": [</p><p>`    `{</p><p>`      `"tenFile": "",</p><p>`      `"hinhAnh": [],</p><p>`      `"coQuanId": 19,</p><p>`      `"tenCoQuan": "UBND quận Hải Châu",</p><p>`      `"ngayXuLy": "2022-12-16 03:01:30.0",</p><p>`      `"soLuotDanhGia": 0,</p><p>`      `"ratingXyLy": 0,</p><p>`      `"noiDungXuLy": "cdscsdc",</p><p>`      `"xuLyId": 134686,</p><p>`      `"fileDinhKem": []</p><p>`    `}</p><p>`  `]</p><p>}</p>||

1. #### <a name="_toc139015627"></a>***API lấy lịch sử góp ý của công dân***
- Đường dẫn: DOMAIN + /public/gopy/lichsugopy
- Method: GET
- **Đầu vào**:
  - Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|userId|long|`  `id của user||
|2|loai|int|<p>"Sắp xếp theo</p><p>1: thời gian (mặc định)</p><p>2: số quan tâm</p><p>3: số bình luận</p><p>khác: thời gian"				</p>||
|3|kieu|string|<p>"Sắp xếp:</p><p>asc: tăng dần</p><p>desc: giảm dần (mặc định)"		</p>||
|4|page|int|Default : 1||
|5|numOfPage|int|<p>Số phần tử trong 1 trang </p><p>Default : 10</p>||

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau:
  - **Thất bại**: Không có dữ liệu.

\- Ví dụ:

|**Thành công**|**Lỗi**|
| :- | :- |
|<p>{</p><p>`  `"noiDungDanhGia": "",</p><p>`  `"tinhTrangXuLy": "Đã xử lý",</p><p>`  `"thoiGianDienRa": "15:29",</p><p>`  `"phuongXaDienRa": "",</p><p>`  `"video": "string",</p><p>`  `"noiDung": "bạn tiên mâu thuẫn với bạn hải trong quá trình làm việc, dẫn đen va chạm vật lý ",</p><p>`  `"listTuongTac": [],</p><p>`  `"tieuDe": "Mất an ninh trật tự tại Viettel",</p><p>`  `"maTinhTrangXuLy": "DA\_XU\_LY",</p><p>`  `"quanHuyenDienRa": "",</p><p>`  `"ngayDienRa": "15/12/2022",</p><p>`  `"hinhAnh": [],</p><p>`  `"maDanhGia": "",</p><p>`  `"webUrl": "https://cgy.greenglobal.com.vn//gop-y?pageid=view&ykien=29055",</p><p>`  `"urlAnhDaiDien": "",</p><p>`  `"linhVucId": 1,</p><p>`  `"id": 29055,</p><p>`  `"danhGia": "",</p><p>`  `"noiDienRa": "string",</p><p>`  `"tenLinhVuc": "Hạ tầng đô thị",</p><p>`  `"thongTinXuLy": [</p><p>`    `{</p><p>`      `"tenFile": "",</p><p>`      `"hinhAnh": [],</p><p>`      `"coQuanId": 19,</p><p>`      `"tenCoQuan": "UBND quận Hải Châu",</p><p>`      `"ngayXuLy": "2022-12-16 03:01:30.0",</p><p>`      `"soLuotDanhGia": 0,</p><p>`      `"ratingXyLy": 0,</p><p>`      `"noiDungXuLy": "cdscsdc",</p><p>`      `"xuLyId": 134686,</p><p>`      `"fileDinhKem": []</p><p>`    `}</p><p>`  `]</p><p>}</p>||
####
1. #### <a name="_heading=h.qqf7zf1tdlwf"></a><a name="_toc139015628"></a>***API lấy số lượng góp ý chờ xử lý của đơn vị theo email của người dùng***
- Đường dẫn: Đường dẫn: DOMAIN + /public/gopy/soluongykienchoxuly
- Method: GET
- **Đầu vào**:
  - Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|email|string|` `email của người dùng muốn tìm kiếm số lượng ý kiến||

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau:
  - **Thất bại**: Không có dữ liệu.

\- Ví dụ:

|<p>{</p><p>"soLuongYKienChoXuLy":374,</p><p>"soLuongYKienChoXuLyQuaHan":199,</p><p>"soLuongBinhLuanChuaXuLy":5</p><p>}</p>||
| :- | :- |
####
1. #### <a name="_heading=h.9yy8a4pikdrw"></a><a name="_toc139015629"></a>***API thêm đánh giá của công dân với kết quả xử lý***
- Đường dẫn: DOMAIN + /public/danhgia
- Method: POST
- **Đầu vào**:
  - Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|gopYId|integer|` `id góp ý|X|
|2|ketQuaDanhGia||<p>HAI\_LONG</p><p>KHONG\_HAI\_LONG</p>|X|
|3|chuaThoaDang|boolean|true/ false|X|
|4|xuLyCham|boolean|true/ false|X|
|5|lyDoKhac|string|lý do khác của góp y|X|

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu 
  - **Thất bại**: Không có dữ liệu.
    1. #### <a name="_heading=h.smnhlpfya6pw"></a><a name="_toc139015630"></a>***API thêm tương tác cho công dân***
- Đường dẫn: DOMAIN + /public/savetuongtac
- Method: POST
- **Đầu vào**:
  - Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|thongTinLienHeId|integer|id thông tin liên hệ|X|
|2|chaId|integer||X|
|3|noiDung|string|nội dung tương tác|X|
|4|loaiTuongTac|string|loại tương tác|X|
|5|yKienId|integer|ý kiến|X|

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu 
  - **Thất bại**: Không có dữ liệu.

1. ### <a name="_toc139015631"></a>**Danh sách API các danh mục**
   1. #### <a name="_toc139015632"></a>***API lấy danh sách danh mục cơ quan xử lý***
- Đường dẫn: DOMAIN + /public/gopy/coquan
- Method: GET
- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau:
  - **Thất bại**: Không có dữ liệu.

\- Ví dụ:

|<p>{</p><p>"data":[</p><p>{</p><p>"id":296,</p><p>"ten":"Trung tâm Thông tin dịch vụ công Đà Nẵng"</p><p>},</p><p>{</p><p>"id":1,</p><p>"ten":"UBND thành phố Đà Nẵng"</p><p>},</p><p>{</p><p>"id":39365,</p><p>"ten":"Ban Chỉ huy Phòng chống thiên tai và Tìm kiếm cứu nạn"</p><p>},</p><p>{"</p><p>id":27466,</p><p>"ten":"Ban Quản lý An toàn thực phẩm thành phố"</p><p>},</p><p>{</p><p>"id":84,</p><p>"ten":"Ban Quản lý các Khu công nghiệp và Chế xuất Đà Nẵng"</p><p>},</p><p>{</p><p>"id":154692,</p><p>"ten":"Ban Quản lý dự án đầu tư xây dựng các công trình dân dụng và công nghiệp Đà Nẵng"</p><p>}</p><p>]</p><p>}</p>||
| :- | :- |
####
1. #### <a name="_heading=h.ncdhpp4mfroi"></a><a name="_toc139015633"></a>***API lấy danh sách danh mục chủ đề (lĩnh vực)***
- Đường dẫn: Đường dẫn: DOMAIN + /public/gopy/chude
- Method: GET
- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau:
  - **Thất bại**: Không có dữ liệu.

\- Ví dụ:

|<p>{</p><p>"data":[</p><p>{</p><p>"hinhAnh":"/cgyfiles/2021/12/8/2021\_07\_15\_\_\_\_\_\_551ea979157637f41a3d1970a1c39eea\_1638930451766.jpg",</p><p>"id":5015,</p><p>"mauNen":"#904309",</p><p>"ten":"Người tiêu dùng"</p><p>},</p><p>{</p><p>"hinhAnh":"/cgyfiles/2021/12/8/virus-5862020\_1280\_1638930655807.png",</p><p>"id":5014,</p><p>"mauNen":"#E0371D",</p><p>"ten":"Covid - 19"</p><p>},</p><p>{</p><p>"hinhAnh":"https://egov.danang.gov.vn/documents/10180/261989/0688\_V1000\_6626597.jpg?version=1.0",</p><p>"id":5008,</p><p>"mauNen":"#065490",</p><p>"ten":"Phản hồi báo nêu"</p><p>},</p><p>{</p><p>"hinhAnh":"https://egov.danang.gov.vn/documents/10180/261989/0688\_V1000\_2721697.jpg?version=1.0",</p><p>"id":5007,</p><p>"mauNen":"#065490",</p><p>"ten":"Thành phố thông minh"</p><p>},</p><p>{</p><p>"hinhAnh":"/cgyfiles/2021/12/8/bvte2\_1638931891554.png",</p><p>"id":5011,</p><p>"mauNen":"#065490",</p><p>"ten":"Bảo vệ trẻ em"</p><p>},</p><p>{</p><p>"hinhAnh":"/cgyfiles/2021/12/8/attp\_1638931039827.png",</p><p>"id":5010,</p><p>"mauNen":"#B0E217",</p><p>"ten":"An toàn thực phẩm"</p><p>}</p><p>]</p><p>}</p>||
| :- | :- |
####
1. #### <a name="_heading=h.ih26t9g9r1ul"></a><a name="_toc139015634"></a>***API lấy danh sách cấp độ sự cố***
- Đường dẫn: Đường dẫn: DOMAIN + /public/capdosuco
- Method: GET
- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau:
  - **Thất bại**: Không có dữ liệu.

\- Ví dụ:

|<p>{</p><p>`  `"data": [</p><p>`    `{</p><p>`      `"id": 6,</p><p>`      `"ten": "Test"</p><p>`    `},</p><p>`    `{</p><p>`      `"id": 3,</p><p>`      `"ten": "Nhẹ"</p><p>`    `},</p><p>`    `{</p><p>`      `"id": 2,</p><p>`      `"ten": "Khẩn"</p><p>`    `},</p><p>`    `{</p><p>`      `"id": 1,</p><p>`      `"ten": "Bình Thường"</p><p>`    `}</p><p>`  `]</p><p>}</p>||
| :- | :- |
####
1. #### <a name="_heading=h.y9geyc6uaazt"></a><a name="_toc139015635"></a>***API lấy danh sách đơn vị hành chính***
- Đường dẫn: Đường dẫn: DOMAIN + /public/donvihanhchinh
- Method: GET
- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau:
  - **Thất bại**: Không có dữ liệu.

\- Ví dụ:

|<p>{</p><p>`  `"data": [</p><p>`    `{</p><p>`      `"childrens": [</p><p>`        `{</p><p>`          `"id": 7256,</p><p>`          `"ten": "phường Thanh Bình"</p><p>`        `},</p><p>`        `{</p><p>`          `"id": 7257,</p><p>`          `"ten": "phường Thuận Phước"</p><p>`        `},</p><p>`        `{</p><p>`          `"id": 7258,</p><p>`          `"ten": "phường Thạch Thang"</p><p>`        `},</p><p>`        `{</p><p>`          `"id": 7259,</p><p>`          `"ten": "phường Hải Châu  I"</p><p>`        `},</p><p>`        `{</p><p>`          `"id": 7260,</p><p>`          `"ten": "phường Hải Châu II"</p><p>`        `}</p><p>`    `]</p><p>}</p>||
| :- | :- |
####
1. #### <a name="_heading=h.jw4de8d5jf7q"></a><a name="_toc139015636"></a>***API lấy danh sách tag***
- Đường dẫn: Đường dẫn: DOMAIN + /public/tag
- Method: GET
- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau:
  - **Thất bại**: Không có dữ liệu.

\- Ví dụ:

|<p>{</p><p>`  `"data": [</p><p>`    `{</p><p>`      `"id": 1,</p><p>`      `"ten": "Phản hồi báo nêu"</p><p>`    `},</p><p>`    `{</p><p>`      `"id": 2,</p><p>`      `"ten": "Thành phố thông minh"</p><p>`    `}</p><p>`  `]</p><p>}</p>||
| :- | :- |
1. ### <a name="_heading=h.fh6kr7f9254s"></a><a name="_toc139015637"></a>**API upload file**
- Đường dẫn: DOMAIN + /public/gopy/file
- Method: POST
- **Đầu vào:** Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|ten|string|tên file upload|X|
|2|base64Content|string||X|

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau:
  - **Thất bại**: Không có dữ liệu.

\- Ví dụ:

|<p>{</p><p>`  `"ten": "Hình ảnh upload",</p><p>`  `"base64Content": "/cgyfiles/2021/12/8/attp\_1638931039827.png"</p><p>}'</p>||
| :- | :- |
1. ### <a name="_toc139015638"></a>**API thông báo**
   1. #### <a name="_toc139015639"></a>***API lấy danh sách thông báo***
- Đường dẫn: DOMAIN + /public/thongbao
- Method: GET
- **Đầu vào:** Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|userId|integer|`  `nhập Id user||
|2|page|integer|nhập số trang||
|3|numOfPage|integer|nhập số lượng hiển thị trong 1 trang||

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau:
  - **Thất bại**: Không có dữ liệu.

\- Ví dụ:

|<p>` `{</p><p>`    `"tuongTacId": null,</p><p>`    `"tuongTac": "",</p><p>`    `"tenNguoiTuongTac": "",</p><p>`    `"hoatDong": "XUAT\_BAN",</p><p>`    `"coQuanTraLoi": "",</p><p>`    `"tieuDeYKien": "Chó thả rông ở công viên Phong Bắc",</p><p>`    `"xuLyThongTinId": null,</p><p>`    `"hinhAnh": "@@https://cgy.greenglobal.com.vn//cgyfiles/2023/4/5/\_26947F04-4284-44D1-8114-C20E54BB49D9-96256-000009D223CD9765\_1680684908063.jpg",</p><p>`    `"loaiThongBao": "Y\_KIEN",</p><p>`    `"trangThai": "DA\_XEM",</p><p>`    `"thoiGianTuongTac": "11:37 06/04/2023",</p><p>`    `"id": 29296,</p><p>`    `"yKienId": 47164</p><p>`  `}</p>||
| :- | :- |

1. #### <a name="_toc139015640"></a>***API lấy danh sách thông báo chưa đọc***
- Đường dẫn: DOMAIN + /public/thongbaochuadoc
- Method: GET
- **Đầu vào:** Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|userId|integer|`  `nhập Id user|X|

- **Đầu ra**:
  - **Thành công**: Hiển thị số liệu như sau:
  - **Thất bại**: Không có dữ liệu.

\- Ví dụ:

|` `4||
| :- | :- |

1. #### <a name="_toc139015641"></a>***API update thông báo***
- Đường dẫn: DOMAIN + /public/updatetttb
- Method: PUT
- **Đầu vào:** Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|thongBaoId|integer|`  `nhập Id thông báo|X|
|2|trangThai|string|chọn trạng thái thông báo|X|

1. ## <a name="_toc139015642"></a>**API cho admin**
   1. ### <a name="_toc139015643"></a>**Danh sách API đăng nhập**
      1. #### <a name="_toc139015644"></a>***API đăng nhập cho admin***
- Đường dẫn: DOMAIN + /admin/login
- Method: POST
- **Đầu vào:** Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|**tenDangNhap**|**string**|`  `**tên đăng nhập tài khoản admin**|**X**|
|2|**matKhau**|**string**|**mật khẩu tài khoản admin**|**X**|

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau:
  - **Thất bại**: Không có dữ liệu.
- Ví dụ:

|<p>{</p><p>`  `"access\_token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0YXBpIiwiYXV0aCI6InRlc3RhcGkiLCJleHAiOjE2NzE3NzY1NzJ9.GcwOx\_U\_-yyR3uHoSy3vJKARRwFL1\_baUU0RFb18S4RJflBJPbjD42AIMoiFwZ7Fw9BS\_o-ylIx2JUGXG6nY1g"</p><p>}</p>||
| :- | :- |

1. #### <a name="_heading=h.aasc20m6va0w"></a><a name="_toc139015645"></a>***API lấy thông tin tài khoản đăng nhập***
- Đường dẫn: DOMAIN + /admin/me
- Method: GET
- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau:
  - **Thất bại**: Không có dữ liệu.
- Ví dụ:

|<p>{</p><p>`  `"chucVu": "",</p><p>`  `"diaChi": "",</p><p>`  `"email": "testapi@gopy.danang.gov.vn",</p><p>`  `"hinhDaiDien": "",</p><p>`  `"hoVaTen": "testapi",</p><p>`  `"soDienThoai": "",</p><p>`  `"tenDangNhap": "testapi",</p><p>`  `"coQuanId": 296,</p><p>`  `"tenCoQuan": "Trung tâm Thông tin dịch vụ công Đà Nẵng",</p><p>`  `"capCoQuanQuanLyId": 12,</p><p>`  `"dichVuCong": true</p><p>}</p>||
| :- | :- |
1. ### <a name="_heading=h.vt7bzbqszzyl"></a><a name="_toc139015646"></a>**Danh sách API góp ý**
   1. #### <a name="_toc139015647"></a>***API lấy danh sách góp ý kèm thông tin xử lý***
- Đường dẫn: DOMAIN + /admin/gopy
- Method: GET
- **Đầu vào:** Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|keyword|string|`  `lọc theo từ khóa||
|2|coquan|integer|lọc theo cơ quan||
|3|linhvuc|integer|lọc theo lĩnh vực||
|4|quanHuyen|integer|lọc theo quận huyện||
|5|phuongxa|integer|lọc theo phường xã||
|6|tungay|string|lọc theo thời gian từ ngày||
|7|denngay|string|lọc theo thời gian đến ngày||
|8|capdosuco|integer|lọc theo cấp độ sự cố||
|9|tag|integer|lọc theo tag||
|10|trangthaixulytag|string|lọc theo trạng thái xử lý tag||
|11|loai|integer|lọc theo loại góp ý||
|12|kieu|string|lọc theo kiểu góp ý||
|13|page|integer|lọc theo trang||
|14|size|integer|lọc theo size||
|15|tinhtrangxuly|string|lọc theo tình trạng xử lý góp ý||

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau:
  - **Thất bại**: Không có dữ liệu.
- Ví dụ:

|<p>{</p><p>`      `"xuatBan": false,</p><p>`      `"tinhTrangXuLy": "Đã xử lý",</p><p>`      `"thoiGianDienRa": "09:50",</p><p>`      `"tenCoQuan": "UBND quận Hải Châu",</p><p>`      `"tenChuDe": "Thành phố thông minh",</p><p>`      `"latitude": 16.06405373946468,</p><p>`      `"noiDung": "mất trật tự",</p><p>`      `"daXem": "DA\_XEM",</p><p>`      `"tieuDe": "mất trật tự",</p><p>`      `"maTinhTrangXuLy": "DA\_XU\_LY",</p><p>`      `"ngayDienRa": "07/04/2023",</p><p>`      `"xuLyThongTinId": 233539,</p><p>`      `"hinhAnh": [],</p><p>`      `"thongBaoThoiHan": "Đã quá hạn: 3 ngày 21 giờ 41 phút",</p><p>`      `"rate": 0,</p><p>`      `"urlAnhDaiDien": "",</p><p>`      `"id": 47191,</p><p>`      `"mauNen": "#065490",</p><p>`      `"longitude": 108.22104810633026</p><p>`    `}</p>||
| - | :- |
####
1. #### <a name="_heading=h.lspg5a1iwnxx"></a><a name="_toc139015648"></a>***API lấy chi tiết xử lý thông tin của góp ý***
- Đường dẫn: DOMAIN + /admin/xulythongtin/{id}
- Method: GET
- **Đầu vào:** Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|id|integer|`  `id xử lý thông tin của góp ý|X|

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau:
  - **Thất bại**: Không có dữ liệu.
- Ví dụ:

|<p>{</p><p>`  `"tenDVC": "Trung tâm Thông tin dịch vụ công Đà Nẵng",</p><p>`  `"xuatBan": true,</p><p>`  `"gopY": {</p><p>`    `"xuatBan": false,</p><p>`    `"tinhTrangXuLy": "Chưa xử lý",</p><p>`    `"thoiGianDienRa": "14:38",</p><p>`    `"tenCapDoSuCo": null,</p><p>`    `"phuongXaDienRa": "",</p><p>`    `"capDoSuCoId": null,</p><p>`    `"video": "",</p><p>`    `"quanHuyenId": null,</p><p>`    `"noiDung": "TGĐ Airbnb tập đoàn đăng ký lưu trú toàn cầu nói rằng thói quen đi lại sau dịch đã thay đổi hoàn toàn, các siêu đô thị sẽ không còn hấp dẫn khách du lịch & khách công tác MICE nữa, các đô thị nhỏ hơn lên ngôi. (Chắc siêu đô thị rễ lây lan dịch và quá lớn khó kiểm soát tốt nhất)\n\nCác NĐT cần chú ý xu hướng quan trọng này!\n\nhttps://www.reuters.com/article/us-airbnb-ceo/airbnb-ceo-says-travel-never-going-back-to-the-way-it-was-before-pandemic-idUSKBN29J2QY",</p><p>`    `"tieuDe": "Các NĐT cần chú ý xu hướng quan trọng này",</p><p>`    `"maTinhTrangXuLy": "CHUA\_XU\_LY",</p><p>`    `"quanHuyenDienRa": "",</p><p>`    `"ngayDienRa": "15/01/2021",</p><p>`    `"hinhAnh": [],</p><p>`    `"urlAnhDaiDien": "",</p><p>`    `"phuongXaId": null,</p><p>`    `"linhVucId": 22,</p><p>`    `"id": 28776,</p><p>`    `"noiDienRa": "ĐN lợi thế",</p><p>`    `"tenLinhVuc": "Lĩnh vực khác",</p><p>`    `"fileDinhKem": null</p><p>`  `},</p><p>`  `"maTinhTrangXuLyCuaDonVi": 1,</p><p>`  `"ghiChu": "",</p><p>`  `"ngayXuLy": "2021-01-15 14:41:55.0",</p><p>`  `"thongTinTiepNhanTruocDay": null,</p><p>`  `"coQuanQuanLy": {</p><p>`    `"coQuanQuanLyCha": {</p><p>`      `"id": 77,</p><p>`      `"ten": "Sở Thông tin và Truyền thông"</p><p>`    `},</p><p>`    `"id": 296,</p><p>`    `"ten": "Trung tâm Thông tin dịch vụ công Đà Nẵng"</p><p>`  `},</p><p>`  `"hanPhanHoi": "03/01/2023",</p><p>`  `"xuLyThongTinId": 134113,</p><p>`  `"ngayHetHan": "",</p><p>`  `"hinhAnh": [],</p><p>`  `"fileDinhKemDonViTruoc": null,</p><p>`  `"noiDungXuLyChuyenTiepCuaDonViTruoc": "",</p><p>`  `"hinhAnhDonViTruoc": [],</p><p>`  `"coQuanLienQuans": [],</p><p>`  `"moTa": "",</p><p>`  `"tonDong": false,</p><p>`  `"noiDungXuLy": "Lưu trữ do không đủ cơ sở chuyển xử lý",</p><p>`  `"thongTinLienHe": {</p><p>`    `"soDienThoai": "6244222455",</p><p>`    `"website": "",</p><p>`    `"linkFacebook": "",</p><p>`    `"id": 32505,</p><p>`    `"tenDayDu": "ĐN",</p><p>`    `"email": "gfdsw@hyui.com"</p><p>`  `},</p><p>`  `"yKienTTDVC": "",</p><p>`  `"chuyenTiepCon": false,</p><p>`  `"fileDinhKem": null,</p><p>`  `"ngayChuyenTiep": ""</p><p>}</p>||
| :- | :- |
####
1. #### <a name="_heading=h.mf402z94z8x0"></a><a name="_toc139015649"></a>***API xử lý góp ý***
- Đường dẫn: DOMAIN + /admin/xulythongtin/{id}
- Method: PUT
- **Đầu vào:** Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|id|integer|id xử lý thông tin|X|

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau:
  - **Thất bại**: Không có dữ liệu.
- Ví dụ:

|<p>{</p><p>`  `"tenDVC": "Trung tâm Thông tin dịch vụ công Đà Nẵng",</p><p>`  `"xuatBan": false,</p><p>`  `"gopY": {</p><p>`    `"xuatBan": true,</p><p>`    `"tinhTrangXuLy": "Đã chuyển tiếp",</p><p>`    `"thoiGianDienRa": "08:56",</p><p>`    `"tenCapDoSuCo": null,</p><p>`    `"latitude": null,</p><p>`    `"phuongXaDienRa": "phường Thanh Khê Tây",</p><p>`    `"capDoSuCoId": null,</p><p>`    `"quanHuyenId": 7244,</p><p>`    `"noiDung": "Hiện tại, vỉa hè trước Bệnh viện Da liễu thành phố Đà Nẵng, địa chỉ: 91 Dũng Sĩ Thanh Khê, phường Thanh Khê Tây có tình trạng đổ rác trên vỉa hè gây mất vệ sinh và mỹ quan khu vực này. Kính đề nghị quý cấp quan tâm giải quyết.",</p><p>`    `"tieuDe": "Rác trên vỉa hè trước bệnh viện Da Liễu",</p><p>`    `"maTinhTrangXuLy": "CHUYEN\_TIEP",</p><p>`    `"quanHuyenDienRa": "quận Thanh Khê",</p><p>`    `"ngayDienRa": "07/02/2018",</p><p>`    `"hinhAnh": [],</p><p>`    `"urlAnhDaiDien": "",</p><p>`    `"phuongXaId": 7246,</p><p>`    `"linhVucId": 4,</p><p>`    `"id": 12733,</p><p>`    `"noiDienRa": "91 Dũng Sĩ Thanh Khê",</p><p>`    `"tenLinhVuc": "Môi trường",</p><p>`    `"longitude": null,</p><p>`    `"fileDinhKem": null</p><p>`  `},</p><p>`  `"maTinhTrangXuLyCuaDonVi": 2,</p><p>`  `"ghiChu": "",</p><p>`  `"ngayXuLy": "2018-02-23 08:31:48.0",</p><p>`  `"thongTinTiepNhanTruocDay": {</p><p>`    `"tenCoQuanQuanLy": "UBND quận Thanh Khê",</p><p>`    `"coQuanQuanLyId": 8,</p><p>`    `"moTa": "Kính chuyển UBND quận Thanh Khê ý kiến phản ánh của công dân: \n\nHiện tại, vỉa hè trước Bệnh viện Da liễu thành phố Đà Nẵng, địa chỉ: 91 Dũng Sĩ Thanh Khê, phường Thanh Khê Tây có tình trạng đổ rác trên vỉa hè gây mất vệ sinh và mỹ quan khu vực này. Kính đề nghị quý cấp quan tâm giải quyết.\n\nKính mong UBND quận Thanh Khê quan tâm xử lý và phản hồi để Ban quản trị hồi đáp thông tin đến công dân. \n\nTrân trọng."</p><p>`  `},</p><p>`  `"coQuanQuanLy": {</p><p>`    `"coQuanQuanLyCha": {</p><p>`      `"id": 8,</p><p>`      `"ten": "UBND quận Thanh Khê"</p><p>`    `},</p><p>`    `"id": 10,</p><p>`    `"ten": "UBND phường Thanh Khê Tây"</p><p>`  `},</p><p>`  `"hanPhanHoi": "23/02/2018",</p><p>`  `"xuLyThongTinId": 47191,</p><p>`  `"ngayHetHan": 1519374117741,</p><p>`  `"hinhAnh": [],</p><p>`  `"fileDinhKemDonViTruoc": null,</p><p>`  `"noiDungXuLyChuyenTiepCuaDonViTruoc": "",</p><p>`  `"hinhAnhDonViTruoc": [],</p><p>`  `"coQuanLienQuans": [],</p><p>`  `"moTa": "Kính chuyển UBND phường Thanh Khê Tây ý kiến phản ánh của công dân. \n\nHiện tại, vỉa hè trước Bệnh viện Da liễu thành phố Đà Nẵng, địa chỉ: 91 Dũng Sĩ Thanh Khê, phường Thanh Khê Tây có tình trạng đổ rác trên vỉa hè gây mất vệ sinh và mỹ quan khu vực này. Kính đề nghị quý cấp quan tâm giải quyết.\n\nKính mong UBND phường Thanh Khê Tây quan tâm xử lý và phản hồi để Ban quản trị hồi đáp thông tin đến công dân. \n\nTrân trọng cảm ơn, \nUBND quận Thanh Khê",</p><p>`  `"tonDong": false,</p><p>`  `"noiDungXuLy": "",</p><p>`  `"thongTinLienHe": {</p><p>`    `"soDienThoai": "",</p><p>`    `"website": null,</p><p>`    `"linkFacebook": null,</p><p>`    `"id": 15595,</p><p>`    `"tenDayDu": "Ngô Văn Tuyến",</p><p>`    `"email": "tuyennv@danang.gov.vn",</p><p>`    `"isAnDanh": true</p><p>`  `},</p><p>`  `"yKienTTDVC": "",</p><p>`  `"chuyenTiepCon": true,</p><p>`  `"fileDinhKem": null,</p><p>`  `"ngayChuyenTiep": "2018-02-09 10:16:39.0"</p><p>}</p>||
| :- | :- |
####
1. #### <a name="_heading=h.781h2r3e3257"></a><a name="_toc139015650"></a>***API chuyển tiếp góp ý***
- Đường dẫn: DOMAIN + /admin/xuluthongtin/{id}/chuyentiep
- Method: POST
- **Đầu vào:** Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|id|integer|id xử lý thông tin|X|

- Request body:

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|id|Integer|id thông tin liên hệ|X|
|2|tenDayDu|Integer|tên đầy đủ của người gửi góp |X|
|3|email|Integer|email của người gửi góp ý|X|
|4|soDienThoai|Integer|số điện thoại của người gửi góp ý|X|
|5|website|Integer|Website của người góp ý|X|
|6|linkFacebook|Integer|Link facebook của người góp ý|X|
|7|anDanh|True|Trạng thái ẩn danh|X|
|8|id|Integer|id góp ý|X|
|9|tieuDe|Integer|Tiêu đề góp ý|X|
|10|linhVucId|String|Id lĩnh vực|X|
|11|capDoSuCoId|String|Id cấp độ sự cố|X|
|12|tagId|String|Id tag|X|
|13|noiDung|String|Nội dung góp ý|X|
|14|noiDienRa|String|Nơi diễn ra|X|
|15|thoiGianDienRa|String|Thời gian diễn ra|X|
|16|ngayDienRa|String|Ngày diễn ra|X|
|17|trangThaiSuDung|True|Trạng thái sử dụng|X|
|18|quanhuyenId|Integer|Id quận huyện|X|
|19|phuongXaId|Integer|Id phường xã|X|
|20|latitude|Integer||X|
|21|longtitude|Integer||X|
|22|urlAnhDaiDien|String|Ảnh đại diện|X|
|23|listYKienLienQuanID|Integer|Các ý kiến liên quan|X|
|24|video|String|Video|X|
|25|amThanh|String|Âm thanh|X|
|26|hinhAnhs|String|Hình ảnh|X|
|27|fileDinhKem|String|File đính kèm|X|
|28|xuatBan|True|Trạng thái xuất bản|X|
|29|donViXuLyId|Integer|Id đơn vị xử lý|X|
|30|listDonViLienQuanId|Integer|Id các đơn vị liên quan|X|
|31|moTa|String|Mô tả|X|
|32|ghiChu|String|Ghi chú|X|
|33|noiDungYKienTTDVC|String|Nội dung ý kiến|X|
|34|hanPhanHoi|String|Hạn phản hồi|X|
|35|chuyenTiepNoiDungDonViTruoc|True|Chuyển tiếp đơn vị|X|
|36|giaHan|True|Gia hạn|X|

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau:
  - **Thất bại**: Không có dữ liệu.
- Ví dụ:

|<p>{</p><p>`  `"msg": "OK"</p><p>}</p>||
| :- | :- |
####
1. #### <a name="_heading=h.5e4krl9xqpzb"></a><a name="_toc139015651"></a>***API chỉnh sửa góp ý***
- Đường dẫn: DOMAIN + admin/xuluthongtin/{id}/xuly
- Method: POST
- **Đầu vào:** Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|id|integer|id xử lý thông tin|X|

- Request body:

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|id|Integer|id thông tin liên hệ|X|
|2|tenDayDu|Integer|tên đầy đủ của người gửi góp |X|
|3|email|Integer|email của người gửi góp ý|X|
|4|soDienThoai|Integer|số điện thoại của người gửi góp ý|X|
|5|website|Integer|Website của người góp ý|X|
|6|linkFacebook|Integer|Link facebook của người góp ý|X|
|7|anDanh|True|Trạng thái ẩn danh|X|
|8|id|Integer|id góp ý|X|
|9|tieuDe|Integer|Tiêu đề góp ý|X|
|10|linhVucId|String|Id lĩnh vực|X|
|11|capDoSuCoId|String|Id cấp độ sự cố|X|
|12|tagId|String|Id tag|X|
|13|noiDung|String|Nội dung góp ý|X|
|14|noiDienRa|String|Nơi diễn ra|X|
|15|thoiGianDienRa|String|Thời gian diễn ra|X|
|16|ngayDienRa|String|Ngày diễn ra|X|
|17|trangThaiSuDung|True|Trạng thái sử dụng|X|
|18|quanhuyenId|Integer|Id quận huyện|X|
|19|phuongXaId|Integer|Id phường xã|X|
|20|latitude|Integer||X|
|21|longtitude|Integer||X|
|22|urlAnhDaiDien|String|Ảnh đại diện|X|
|23|listYKienLienQuanID|Integer|Các ý kiến liên quan|X|
|24|video|String|Video|X|
|25|amThanh|String|Âm thanh|X|
|26|hinhAnhs|String|Hình ảnh|X|
|27|fileDinhKem|String|File đính kèm|X|
|28|xuatBan|True|Trạng thái xuất bản|X|
|29|donViXuLyId|Integer|Id đơn vị xử lý|X|
|30|listDonViLienQuanId|Integer|Id các đơn vị liên quan|X|
|31|moTa|String|Mô tả|X|
|32|ghiChu|String|Ghi chú|X|
|33|noiDungYKienTTDVC|String|Nội dung ý kiến|X|
|34|hanPhanHoi|String|Hạn phản hồi|X|
|35|chuyenTiepNoiDungDonViTruoc|True|Chuyển tiếp đơn vị|X|
|36|giaHan|True|Gia hạn|X|
|37|noiDungXuLy|String|Nội dung xử lý|X|
|38|chuyenTrangThai|True|Chuyển trạng thái|X|
|39|hinhAnhs|String|Hình ảnh|X|
|40|fileDinhKem|String|File đính kèm|X|

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau:
  - **Thất bại**: Không có dữ liệu.
- Ví dụ:

|<p>{</p><p>`  `"msg": "OK"</p><p>}</p>||
| :- | :- |

1. #### <a name="_toc139015652"></a>***API chuyển trạng thái góp ý đã xem***
- Đường dẫn: DOMAIN + admin/gopy{id}/chuyentrangthaidaxem
- Method: POST
- **Đầu vào:** Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|id|integer|` `id góp ý|X|

- <a name="_heading=h.pv9w3hkap6q2"></a>**Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau:
  - **Thất bại**: Không có dữ liệu.
- Ví dụ:

|<p>{</p><p>`  `"msg": "OK"</p><p>}</p>||
| :- | :- |
####
1. #### <a name="_toc139015653"></a>***API lấy danh sách góp ý không có phân trang***
- Đường dẫn: DOMAIN + /admin/gopy/list
- Method: GET
- **Đầu vào:** Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|keyword|string|`  `lọc theo từ khóa||
|2|coquan|integer|lọc theo cơ quan||
|3|linhvuc|integer|lọc theo lĩnh vực||
|4|quanHuyen|integer|lọc theo quận huyện||
|5|phuongxa|integer|lọc theo phường xã||
|6|tungay|string|lọc theo thời gian từ ngày||
|7|denngay|string|lọc theo thời gian đến ngày||
|8|capdosuco|integer|lọc theo cấp độ sự cố||
|9|tag|integer|lọc theo tag||
|10|trangthaixulytag|string|lọc theo trạng thái xử lý tag||
|11|tinhtrangxuly|string|lọc theo tình trạng xử lý góp ý||

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau:
  - **Thất bại**: Không có dữ liệu.
- Ví dụ:

|<p>{</p><p>`      `"xuatBan": false,</p><p>`      `"tinhTrangXuLy": "Đã xử lý",</p><p>`      `"thoiGianDienRa": "09:50",</p><p>`      `"tenCoQuan": "UBND quận Hải Châu",</p><p>`      `"tenChuDe": "Thành phố thông minh",</p><p>`      `"latitude": 16.06405373946468,</p><p>`      `"noiDung": "mất trật tự",</p><p>`      `"daXem": "DA\_XEM",</p><p>`      `"tieuDe": "mất trật tự",</p><p>`      `"maTinhTrangXuLy": "DA\_XU\_LY",</p><p>`      `"ngayDienRa": "07/04/2023",</p><p>`      `"xuLyThongTinId": 233539,</p><p>`      `"hinhAnh": [],</p><p>`      `"thongBaoThoiHan": "Đã quá hạn: 3 ngày 21 giờ 41 phút",</p><p>`      `"rate": 0,</p><p>`      `"urlAnhDaiDien": "",</p><p>`      `"id": 47191,</p><p>`      `"mauNen": "#065490",</p><p>`      `"longitude": 108.22104810633026</p><p>`    `}</p>||
| - | :- |
####
1. #### <a name="_heading=h.vraemk4ojr9t"></a><a name="_toc139015654"></a>***API upload file***
- Đường dẫn: DOMAIN + /admin/file
- Method: POST
- **Đầu vào:** Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|ten|string|tên file upload|X|
|2|base64Content|string||X|

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau:
  - **Thất bại**: Không có dữ liệu.

\- Ví dụ:

|<p>{</p><p>`  `"ten": "Hình ảnh upload",</p><p>`  `"base64Content": "/cgyfiles/2021/12/8/attp\_1638931039827.png"</p><p>}'</p>||
| :- | :- |
1. ### <a name="_heading=h.5lsmiinkn5l8"></a><a name="_toc139015655"></a>**Danh sách API các danh mục**
   1. #### <a name="_toc139015656"></a>***API lấy danh sách cấp độ sự cố***
- Đường dẫn: DOMAIN + /admin/capdosuco
- Method: GET
- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau:
  - **Thất bại**: Không có dữ liệu.
- Ví dụ:

|<p>{</p><p>`  `"data": [</p><p>`    `{</p><p>`      `"id": 6,</p><p>`      `"ten": "Test"</p><p>`    `},</p><p>`    `{</p><p>`      `"id": 3,</p><p>`      `"ten": "Nhẹ"</p><p>`    `},</p><p>`    `{</p><p>`      `"id": 2,</p><p>`      `"ten": "Khẩn"</p><p>`    `},</p><p>`    `{</p><p>`      `"id": 1,</p><p>`      `"ten": "Bình Thường"</p><p>`    `}</p><p>`  `]</p><p>}</p>||
| :- | :- |
####
<a name="_heading=h.5afa34yw7zn5"></a>
1. #### <a name="_toc139015657"></a>***API lấy danh sách cơ quan quản lý***
- Đường dẫn: DOMAIN + /admin/coquan
- Method: GET
- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau:
  - **Thất bại**: Không có dữ liệu.
- Ví dụ:

|<p>{</p><p>`  `"data": [</p><p>`    `{</p><p>`      `"id": 296,</p><p>`      `"ten": "Trung tâm Thông tin dịch vụ công Đà Nẵng"</p><p>`    `},</p><p>`    `{</p><p>`      `"id": 1,</p><p>`      `"ten": "UBND thành phố Đà Nẵng"</p><p>`    `},</p><p>`    `{</p><p>`      `"id": 39365,</p><p>`      `"ten": "Ban Chỉ huy Phòng chống thiên tai và Tìm kiếm cứu nạn"</p><p>`    `},</p><p>`    `{</p><p>`      `"id": 27466,</p><p>`      `"ten": "Ban Quản lý An toàn thực phẩm thành phố"</p><p>`    `},</p><p>`    `{</p><p>`      `"id": 84,</p><p>`      `"ten": "Ban Quản lý các Khu công nghiệp và Chế xuất Đà Nẵng"</p><p>`    `},</p><p>`    `{</p><p>`      `"id": 154692,</p><p>`      `"ten": "Ban Quản lý dự án đầu tư xây dựng các công trình dân dụng và công nghiệp Đà Nẵng"</p><p>`    `}</p><p>`  `]</p><p>}</p>||
| :- | :- |
####
1. #### <a name="_heading=h.t7tdex4y41px"></a><a name="_toc139015658"></a>***API lấy danh sách cơ quan quản lý con theo cha***
- Đường dẫn: DOMAIN + /admin/coquan/{id}/coquancon
- Method: GET
- **Đầu vào:** Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|id|integer|`  `id cơ quan|X|

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau:
  - **Thất bại**: Không có dữ liệu.
- Ví dụ:

|<p>{</p><p>`  `"data": [</p><p>`    `{</p><p>`      `"id": 1,</p><p>`      `"ten": "UBND thành phố Đà Nẵng"</p><p>`    `},</p><p>`    `{</p><p>`      `"id": 39365,</p><p>`      `"ten": "Ban Chỉ huy Phòng chống thiên tai và Tìm kiếm cứu nạn"</p><p>`    `},</p><p>`    `{</p><p>`      `"id": 27466,</p><p>`      `"ten": "Ban Quản lý An toàn thực phẩm thành phố"</p><p>`    `},</p><p>`    `{</p><p>`      `"id": 84,</p><p>`      `"ten": "Ban Quản lý các Khu công nghiệp và Chế xuất Đà Nẵng"</p><p>`    `},</p><p>`    `{</p><p>`      `"id": 154692,</p><p>`      `"ten": "Ban Quản lý dự án đầu tư xây dựng các công trình dân dụng và công nghiệp Đà Nẵng"</p><p>`    `},</p><p>`    `{</p><p>`      `"id": 154690,</p><p>`      `"ten": "Ban Quản lý dự án đầu tư xây dựng các công trình nông nghiệp và phát triển nông thôn Đà Nẵng"</p><p>`    `}</p><p>`  `]</p><p>}</p>||
| :- | :- |

1. #### <a name="_toc139015659"></a>***API lấy danh sách đơn vị hành chính***
- Đường dẫn: DOMAIN + /admin/donvihanhchinh
- Method: GET
- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau:
  - **Thất bại**: Không có dữ liệu.
- Ví dụ:

|<p>{</p><p>`  `"data": [</p><p>`    `{</p><p>`      `"childrens": [</p><p>`        `{</p><p>`          `"id": 7256,</p><p>`          `"ten": "phường Thanh Bình"</p><p>`        `},</p><p>`        `{</p><p>`          `"id": 7257,</p><p>`          `"ten": "phường Thuận Phước"</p><p>`        `},</p><p>`        `{</p><p>`          `"id": 7258,</p><p>`          `"ten": "phường Thạch Thang"</p><p>`        `},</p><p>`        `{</p><p>`          `"id": 7259,</p><p>`          `"ten": "phường Hải Châu  I"</p><p>`        `},</p><p>`        `{</p><p>`          `"id": 7260,</p><p>`          `"ten": "phường Hải Châu II"</p><p>`        `},</p><p>`        `{</p><p>`          `"id": 7261,</p><p>`          `"ten": "phường Phước Ninh"</p><p>`        `}</p><p>]</p><p>}</p>||
| :- | :- |
####
1. #### <a name="_heading=h.eaxmocknc45e"></a><a name="_toc139015660"></a>***API lấy danh sách lĩnh vực***
- Đường dẫn: DOMAIN + /admin/chude
- Method: GET
- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau:
  - **Thất bại**: Không có dữ liệu.
- Ví dụ:

|<p>{</p><p>`  `"data": [</p><p>`    `{</p><p>`      `"hinhAnh": "/cgyfiles/2021/12/8/2021\_07\_15\_\_\_\_\_\_551ea979157637f41a3d1970a1c39eea\_1638930451766.jpg",</p><p>`      `"id": 5015,</p><p>`      `"mauNen": "#904309",</p><p>`      `"ten": "Người tiêu dùng"</p><p>`    `},</p><p>`    `{</p><p>`      `"hinhAnh": "/cgyfiles/2021/12/8/virus-5862020\_1280\_1638930655807.png",</p><p>`      `"id": 5014,</p><p>`      `"mauNen": "#E0371D",</p><p>`      `"ten": "Covid - 19"</p><p>`    `},</p><p>`    `{</p><p>`      `"hinhAnh": "https://egov.danang.gov.vn/documents/10180/261989/0688\_V1000\_6626597.jpg?version=1.0",</p><p>`      `"id": 5008,</p><p>`      `"mauNen": "#065490",</p><p>`      `"ten": "Phản hồi báo nêu"</p><p>`    `},</p><p>`    `{</p><p>`      `"hinhAnh": "https://egov.danang.gov.vn/documents/10180/261989/0688\_V1000\_2721697.jpg?version=1.0",</p><p>`      `"id": 5007,</p><p>`      `"mauNen": "#065490",</p><p>`      `"ten": "Thành phố thông minh"</p><p>`    `}</p><p>`  `]</p><p>}</p>||
| :- | :- |
####
1. #### <a name="_heading=h.3pnhlbpy45pn"></a><a name="_toc139015661"></a>***API lấy danh sách tag***
- Đường dẫn: DOMAIN + /admin/tag
- Method: GET
- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau:
  - **Thất bại**: Không có dữ liệu.
- Ví dụ:

|<p>` `{</p><p>`  `"data": [</p><p>`    `{</p><p>`      `"id": 1,</p><p>`      `"ten": "Phản hồi báo nêu"</p><p>`    `},</p><p>`    `{</p><p>`      `"id": 2,</p><p>`      `"ten": "Thành phố thông minh"</p><p>`    `}</p><p>`  `]</p><p>}</p>||
| :- | :- |

1. ### <a name="_toc139015662"></a>**Danh sách các API báo cáo thống kê**
   1. #### <a name="_toc139015663"></a>***API báo cáo thống kê***
- Đường dẫn: DOMAIN + /admin/baocaothongke
- Method: GET
- **Đầu vào:** Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|loaithongke|string|`  `chọn loại thống kê|X|
|2|coquan|integer|nhập id cơ quan||
|3|linhvuc|integer|nhập id lĩnh vực||
|4|quanhuyenId|integer|nhập id quận huyện||
|5|phuongxaId|integer|nhập id phường xã||
|6|tungay|string|thống kê từ ngày||
|7|denngay|string|thống kê đến ngày||

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau:
  - **Thất bại**: Không có dữ liệu.
- Ví dụ:

|<p>{</p><p>`  `"data": [</p><p>`    `{</p><p>`      `"chuaXuLyConHan": 0,</p><p>`      `"id": 39365,</p><p>`      `"ten": "Ban Chỉ huy Phòng chống thiên tai và Tìm kiếm cứu nạn",</p><p>`      `"daXuLyDungHan": 0,</p><p>`      `"chuaXuLyQuaHan": 0,</p><p>`      `"daXuLyTreHan": 0</p><p>`    `},</p><p>`    `{</p><p>`      `"chuaXuLyConHan": 0,</p><p>`      `"id": 27466,</p><p>`      `"ten": "Ban Quản lý An toàn thực phẩm thành phố",</p><p>`      `"daXuLyDungHan": 17,</p><p>`      `"chuaXuLyQuaHan": 0,</p><p>`      `"daXuLyTreHan": 7</p><p>`    `}</p><p>`  `],</p><p>`  `"message": "OK"</p><p>}</p>||
| :- | :- |
####
1. #### <a name="_heading=h.s37gk8cx8h03"></a><a name="_toc139015664"></a>***API báo cáo thống kê theo đơn vị xử lý***
- Đường dẫn: DOMAIN + /admin/baocaothongke/donvixuly
- Method: GET
- **Đầu vào:** Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|coquan|integer|`  `id cơ quan||
|2|tungay|string|thống kê từ ngày||
|3|denngay|string|thống kê đến ngày||

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau:
  - **Thất bại**: Không có dữ liệu.
- Ví dụ:

|<p>{</p><p>`  `"data": [</p><p>`    `{</p><p>`      `"chuaXuLyConHan": 0,</p><p>`      `"id": 39365,</p><p>`      `"ten": "Ban Chỉ huy Phòng chống thiên tai và Tìm kiếm cứu nạn",</p><p>`      `"daXuLyDungHan": 0,</p><p>`      `"chuaXuLyQuaHan": 0,</p><p>`      `"daXuLyTreHan": 0</p><p>`    `},</p><p>`    `{</p><p>`      `"chuaXuLyConHan": 0,</p><p>`      `"id": 27466,</p><p>`      `"ten": "Ban Quản lý An toàn thực phẩm thành phố",</p><p>`      `"daXuLyDungHan": 3,</p><p>`      `"chuaXuLyQuaHan": 2,</p><p>`      `"daXuLyTreHan": 8</p><p>`    `},</p><p>`    `{</p><p>`      `"chuaXuLyConHan": 0,</p><p>`      `"id": 84,</p><p>`      `"ten": "Ban Quản lý các Khu công nghiệp và Chế xuất Đà Nẵng",</p><p>`      `"daXuLyDungHan": 33,</p><p>`      `"chuaXuLyQuaHan": 0,</p><p>`      `"daXuLyTreHan": 6</p><p>`    `},</p><p>`    `{</p><p>`      `"chuaXuLyConHan": 2,</p><p>`      `"id": 154692,</p><p>`      `"ten": "Ban Quản lý dự án đầu tư xây dựng các công trình dân dụng và công nghiệp Đà Nẵng",</p><p>`      `"daXuLyDungHan": 0,</p><p>`      `"chuaXuLyQuaHan": 0,</p><p>`      `"daXuLyTreHan": 0</p><p>`    `}</p><p>],</p><p>`  `"message": "OK"</p><p>}</p>||
| :- | :- |
####
1. #### <a name="_heading=h.vv9h5al25gzp"></a><a name="_toc139015665"></a>***API báo cáo thống kê theo đánh giá của công dân***
- Đường dẫn: DOMAIN + /admin/baocaothongke/danhgiacuacongdan
- Method: GET
- **Đầu vào:** Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|tungay|string|thống kê từ ngày||
|2|denngay|string|thống kê đến ngày||

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau:
  - **Thất bại**: Không có dữ liệu.
- Ví dụ:

|<p>{</p><p>`  `"data": {</p><p>`    `"khongHaiLong": 7,</p><p>`    `"haiLong": 11,</p><p>`    `"chapNhanDuoc": 3</p><p>`  `},</p><p>`  `"message": "OK"</p><p>}</p>||
| :- | :- |
####
1. #### <a name="_heading=h.yrv9si53r26t"></a><a name="_toc139015666"></a>***API báo cáo thống kê theo lĩnh vực***
- Đường dẫn: DOMAIN + /admin/baocaothongke/linhvuc
- Method: GET
- **Đầu vào:** Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|linhvuc|integer|lĩnh vực muốn thống kê||
|2|tungay|string|thống kê từ ngày||
|3|denngay|string|thống kê đến ngày||

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau
  - **Thất bại**: Không có dữ liệu.
- Ví dụ:

|<p>{</p><p>`  `"data": [</p><p>`    `{</p><p>`      `"chuaXuLyConHan": 20,</p><p>`      `"id": 21,</p><p>`      `"ten": "An ninh trật tự",</p><p>`      `"daXuLyDungHan": 1720,</p><p>`      `"chuaXuLyQuaHan": 100,</p><p>`      `"daXuLyTreHan": 1377</p><p>`    `},</p><p>`    `{</p><p>`      `"chuaXuLyConHan": 13,</p><p>`      `"id": 3,</p><p>`      `"ten": "An toàn giao thông",</p><p>`      `"daXuLyDungHan": 1636,</p><p>`      `"chuaXuLyQuaHan": 46,</p><p>`      `"daXuLyTreHan": 846</p><p>`    `},</p><p>`    `{</p><p>`      `"chuaXuLyConHan": 6,</p><p>`      `"id": 5010,</p><p>`      `"ten": "An toàn thực phẩm",</p><p>`      `"daXuLyDungHan": 38,</p><p>`      `"chuaXuLyQuaHan": 14,</p><p>`      `"daXuLyTreHan": 16</p><p>`    `},</p><p>`        `{</p><p>`      `"chuaXuLyConHan": 0,</p><p>`      `"id": 5003,</p><p>`      `"ten": "Hàng hoá - Dịch vụ",</p><p>`      `"daXuLyDungHan": 385,</p><p>`      `"chuaXuLyQuaHan": 8,</p><p>`      `"daXuLyTreHan": 119</p><p>`    `}</p><p>],</p><p>`  `"message": "OK"</p><p>}</p>||
| :- | :- |
####
1. #### <a name="_toc139015667"></a>***API báo cáo thống kê theo tag***
- Đường dẫn: DOMAIN + /admin/baocaothongke/tag
- Method: GET
- **Đầu vào:** Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|tag|integer|tag muốn thống kê||
|2|tungay|string|thống kê từ ngày||
|3|denngay|string|thống kê đến ngày||

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau
  - **Thất bại**: Không có dữ liệu.
- Ví dụ:

|<p>{</p><p>`  `"data": [</p><p>`    `{</p><p>`      `"chuaXuLyConHan": 0,</p><p>`      `"id": 3,</p><p>`      `"ten": "Kuuho",</p><p>`      `"daXuLyDungHan": 0,</p><p>`      `"chuaXuLyQuaHan": 0,</p><p>`      `"daXuLyTreHan": 0</p><p>`    `},</p><p>`    `{</p><p>`      `"chuaXuLyConHan": 6,</p><p>`      `"id": 1,</p><p>`      `"ten": "Phản hồi báo nêu",</p><p>`      `"daXuLyDungHan": 191,</p><p>`      `"chuaXuLyQuaHan": 74,</p><p>`      `"daXuLyTreHan": 48</p><p>`    `},</p><p>`    `{</p><p>`      `"chuaXuLyConHan": 4,</p><p>`      `"id": 2,</p><p>`      `"ten": "Thành phố thông minh",</p><p>`      `"daXuLyDungHan": 2,</p><p>`      `"chuaXuLyQuaHan": 0,</p><p>`      `"daXuLyTreHan": 1</p><p>`    `}</p><p>`  `],</p><p>`  `"message": "OK"</p><p>}</p>||
| :- | :- |
####
1. #### <a name="_heading=h.oqk9bm3o5lx3"></a><a name="_toc139015668"></a>***API báo cáo thống kê theo địa bàn diễn ra***
- Đường dẫn: DOMAIN + /admin/baocaothongke/diabandienra
- Method: GET
- **Đầu vào:** Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|quanhuyen|integer|quận huyện muốn thống kê||
|2|phuongxa|integer|phường xã muốn thống kê||
|3|tungay|string|thống kê từ ngày||
|4|denngay|string|thống kê đến ngày||

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau
  - **Thất bại**: Không có dữ liệu.
- Ví dụ:

|<p>{</p><p>`  `"data": [</p><p>`    `{</p><p>`      `"chuaXuLyConHan": 2,</p><p>`      `"id": 7251,</p><p>`      `"ten": "phường Vĩnh Trung",</p><p>`      `"daXuLyDungHan": 137,</p><p>`      `"chuaXuLyQuaHan": 2,</p><p>`      `"daXuLyTreHan": 51</p><p>`    `},</p><p>`    `{</p><p>`      `"chuaXuLyConHan": 2,</p><p>`      `"id": 7252,</p><p>`      `"ten": "phường Thạc Gián",</p><p>`      `"daXuLyDungHan": 154,</p><p>`      `"chuaXuLyQuaHan": 2,</p><p>`      `"daXuLyTreHan": 85</p><p>`    `},</p><p>`    `{</p><p>`      `"chuaXuLyConHan": 0,</p><p>`      `"id": 7253,</p><p>`      `"ten": "phường An Khê",</p><p>`      `"daXuLyDungHan": 172,</p><p>`      `"chuaXuLyQuaHan": 15,</p><p>`      `"daXuLyTreHan": 122</p><p>`    `},</p><p>`    `{</p><p>`      `"chuaXuLyConHan": 1,</p><p>`      `"id": 7254,</p><p>`      `"ten": "phường Hòa Khê",</p><p>`      `"daXuLyDungHan": 110,</p><p>`      `"chuaXuLyQuaHan": 3,</p><p>`      `"daXuLyTreHan": 168</p><p>`    `},</p><p>`    `{</p><p>`      `"chuaXuLyConHan": 2,</p><p>`      `"id": 7255,</p><p>`      `"ten": "quận Hải Châu",</p><p>`      `"daXuLyDungHan": 2818,</p><p>`      `"chuaXuLyQuaHan": 47,</p><p>`      `"daXuLyTreHan": 1225</p><p>`    `}</p><p>],</p><p>`  `"message": "OK"</p><p>}</p>||
| :- | :- |
####
1. #### <a name="_heading=h.c4uc2pezhkl9"></a><a name="_toc139015669"></a>***API báo cáo thống kê số liệu tổng quan***
- Đường dẫn: DOMAIN + /admin/baocaothongke/tongquan
- Method: GET
- **Đầu vào:** Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|tungay|string|thống kê từ ngày||
|2|denngay|string|thống kê đến ngày||

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau
  - **Thất bại**: Không có dữ liệu.
- Ví dụ:

|<p>{</p><p>`  `"tong": 19943,</p><p>`  `"chuaXuLyConHan": 236,</p><p>`  `"daXuLyDungHan": 19475,</p><p>`  `"chuaXuLyQuaHan": 232</p><p>}</p>||
| :- | :- |
1. ### <a name="_heading=h.tv5390x5j7iw"></a><a name="_toc139015670"></a>**Danh sách các API báo cáo thống kê bản đồ**
   1. #### <a name="_toc139015671"></a>***API báo cáo thống kê bản đồ***
- Đường dẫn: DOMAIN + /admin/baocaothongkebando
- Method: GET
- **Đầu vào:** Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|loaithongke|string|chọn loại thống kê bản đồ|X|
|2|coquan|integer|chọn cơ quan||
|3|linhvuc|integer|chọn lĩnh vực||
|4|quanhuyen|integer|chọn quận huyện||
|5|phuongxa|integer|chọn phường xã||
|6|tungay|string|chọn thời gian từ ngày||
|7|denngay|string|chọn thời gian đến ngày||

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau
  - **Thất bại**: Không có dữ liệu.
- Ví dụ:

|<p>` `{</p><p>`      `"chuaXuLyConHan": [],</p><p>`      `"id": 39365,</p><p>`      `"ten": "Ban Chỉ huy Phòng chống thiên tai và Tìm kiếm cứu nạn",</p><p>`      `"daXuLyDungHan": [],</p><p>`      `"chuaXuLyQuaHan": [],</p><p>`      `"daXuLyTreHan": []</p><p>`    `},</p><p>`    `{</p><p>`      `"chuaXuLyConHan": [],</p><p>`      `"id": 27466,</p><p>`      `"ten": "Ban Quản lý An toàn thực phẩm thành phố",</p><p>`      `"daXuLyDungHan": [],</p><p>`      `"chuaXuLyQuaHan": [],</p><p>`      `"daXuLyTreHan": []</p><p>`    `}</p>||
| :- | :- |
####
1. #### <a name="_heading=h.riomvss1nxxv"></a><a name="_toc139015672"></a>***API báo cáo thống kê theo lĩnh vực***
- Đường dẫn: DOMAIN + /admin/baocaothongkebando/linhvuc
- Method: GET
- **Đầu vào:** Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|linhvuc|integer|chọn lĩnh vực||
|2|tungay|string|chọn thời gian từ ngày||
|3|denngay|string|chọn thời gian đến ngày||

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau
  - **Thất bại**: Không có dữ liệu.
- Ví dụ:

|<p>{</p><p>`      `"chuaXuLyConHan": [],</p><p>`      `"id": 21,</p><p>`      `"ten": "An ninh trật tự",</p><p>`      `"daXuLyDungHan": [</p><p>`        `{</p><p>`          `"soDienThoai": "0346291769",</p><p>`          `"thoiGianDienRa": "13:55",</p><p>`          `"tenChuDe": "An ninh trật tự",</p><p>`          `"latitude": null,</p><p>`          `"videos": "",</p><p>`          `"noiDung": "Kính gửi: \n                  UBND TP Đà Nẵng\n                  UBND Huyện Hòa Vang\n\n\tCách đây 2 tháng người dân tại đường Đại La 2 - Khu tái định cư Đại La, Tổ 1 – thôn Đại La - xã Hòa Sơn - H. Hòa Vang - TP Đà Nẵng có kiến nghị về việc 1 cơ sở nuôi nhốt chó với số lượng lớn, chó sủa và rú cả ngày lãnh đêm, kèm mùi hồi thối cho cả khu dân cư. Sự việc đã được UBND TP Đà Nẵng, UBND huyện Hòa Vang, UBND xã Hòa Sơn giải quyết bằng cách yêu cầu chủ cơ sở di dời ra khỏi khu vực tái định cư tại tổ 1, thôn Đại La. Tuy nhiên, sau hơn 1 tháng di dời (có để lại 2 con chó nhỏ) thì đến cuối tháng 12/2022 chủ cơ sở lại mang thêm nhiều chó đến cơ sở để nuôi nhốt, tiếp tục gây ô nhiễm tiếng ồn (chó sủa, hú), đặc biệt thời tiết lạnh và mưa nên cơ sở không dọn dẹp dẫn đến tình trạng mùi hôi thối thêm trầm trọng cho cả khu dân cư. Thời gian tới chuẩn bị đón tết nguyên đán Quý Mão 2023 càng không thể để tình trạng trên tiếp diễn cho khu dân cư. \n\tMột lần nữa chúng tôi kính đề nghị UBND TP Đà Nẵng, UBND huyện Hòa Vang sớm vào cuộc xử lý dứt điểm tình trạng trên, tránh sự việc lặp đi lặp lại nhiều lần gây phẫn nộ cho người dân.\n\tChúng tôi chân thành cảm ơn./.",</p><p>`          `"tieuDe": "Nuôi chó hôi thối ô nhiễm tại Khu tái định cư Đại La 2, Xã Hòa Sơn",</p><p>`          `"ngayDienRa": "2023-01-05 13:38:50.0",</p><p>`          `"hinhAnh": [</p><p>`            `"https://cgy.greenglobal.com.vn//cgyfiles/2023/1/5/301619784\_1278233302714856\_1913347234110318046\_n\_1672901704456.jpg"</p><p>`          `],</p><p>`          `"urlAnhDaiDien": "https://cgy.greenglobal.com.vn//cgyfiles/2023/1/6/301619784\_1278233302714856\_1913347234110318046\_n\_1672901704456\_1672966580173.jpg",</p><p>`          `"ngayKhaiBao": "2023-01-05 13:55:00.0",</p><p>`          `"tenNguoiKhaiBao": "Lê Văn Huy",</p><p>`          `"noiDienRa": "Khu tái định cư Đại La, Tổ 1 – thôn Đại La",</p><p>`          `"yKienId": 45714,</p><p>`          `"longitude": null,</p><p>`          `"fileDinhKem": null</p><p>`        `}</p>||
| :- | :- |
####
1. #### <a name="_heading=h.qbzqm9tcie6l"></a><a name="_toc139015673"></a>***API báo cáo thống kê bản đồ theo đơn vị xử lý***
- Đường dẫn: DOMAIN + /admin/baocaothongkebando/donvixuly
- Method: GET
- **Đầu vào:** Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|coquan|integer|coquan||
|2|tungay|string|chọn thời gian từ ngày||
|3|denngay|string|chọn thời gian đến ngày||

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau
  - **Thất bại**: Không có dữ liệu.
- Ví dụ:

|<p>{</p><p>`      `"chuaXuLyConHan": [],</p><p>`      `"id": 154690,</p><p>`      `"ten": "Ban Quản lý dự án đầu tư xây dựng các công trình nông nghiệp và phát triển nông thôn Đà Nẵng",</p><p>`      `"daXuLyDungHan": [</p><p>`        `{</p><p>`          `"soDienThoai": "0905141469",</p><p>`          `"thoiGianDienRa": "4:30",</p><p>`          `"tenChuDe": "Hạ tầng đô thị",</p><p>`          `"latitude": 16.011564,</p><p>`          `"videos": "",</p><p>`          `"noiDung": "Thi công mở đường tại 31-33 Sơn Thủy 8 thuộc phường Hòa Hải, quận Ngũ Hành Sơn nhưng không có thông báo cho người dân được biết, đổ đất đổ đá ngổn ngang, ngoài ra thi công mà không có biển cảnh báo an toàn cho người dân, rất nguy hiểm. \nKính mong cơ quan chức năng kiểm tra và xử lý.",</p><p>`          `"tieuDe": "Thi công mở đường không có biển cảnh báo an toàn",</p><p>`          `"ngayDienRa": "2023-02-02 04:30:02.0",</p><p>`          `"hinhAnh": [],</p><p>`          `"urlAnhDaiDien": "",</p><p>`          `"ngayKhaiBao": "2023-02-03 08:00:00.0",</p><p>`          `"tenNguoiKhaiBao": "Anh Minh",</p><p>`          `"noiDienRa": "33 Đường Sơn Thủy 8",</p><p>`          `"yKienId": 46038,</p><p>`          `"longitude": 108.252836,</p><p>`          `"fileDinhKem": null</p><p>`        `},</p><p>`        `{</p><p>`          `"soDienThoai": "0905141469",</p><p>`          `"thoiGianDienRa": "4:30",</p><p>`          `"tenChuDe": "Hạ tầng đô thị",</p><p>`          `"latitude": 16.011564,</p><p>`          `"videos": "",</p><p>`          `"noiDung": "Thi công mở đường tại 31-33 Sơn Thủy 8 thuộc phường Hòa Hải, quận Ngũ Hành Sơn nhưng không có thông báo cho người dân được biết, đổ đất đổ đá ngổn ngang, ngoài ra thi công mà không có biển cảnh báo an toàn cho người dân, rất nguy hiểm. \nKính mong cơ quan chức năng kiểm tra và xử lý.",</p><p>`          `"tieuDe": "Thi công mở đường không có biển cảnh báo an toàn",</p><p>`          `"ngayDienRa": "2023-02-02 04:30:02.0",</p><p>`          `"hinhAnh": [],</p><p>`          `"urlAnhDaiDien": "",</p><p>`          `"ngayKhaiBao": "2023-02-03 08:00:00.0",</p><p>`          `"tenNguoiKhaiBao": "Anh Minh",</p><p>`          `"noiDienRa": "33 Đường Sơn Thủy 8",</p><p>`          `"yKienId": 46038,</p><p>`          `"longitude": 108.252836,</p><p>`          `"fileDinhKem": null</p><p>`        `}</p>||
| :- | :- |
####
1. #### <a name="_heading=h.mnfpee58yzdc"></a><a name="_toc139015674"></a>***API báo cáo thống kê bản đồ theo địa bàn diễn ra***
- Đường dẫn: DOMAIN + /admin/baocaothongkebando/diabandienra
- Method: GET
- **Đầu vào:** Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|quanhuyen|integer|chọn quận huyện||
|2|phuongxa|integer|chọn phường xã||
|3|tungay|string|chọn thời gian từ ngày||
|4|denngay|string|chọn thời gian đến ngày||

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau
  - **Thất bại**: Không có dữ liệu.
- Ví dụ:

|<p>{</p><p>`      `"chuaXuLyConHan": [],</p><p>`      `"id": 7251,</p><p>`      `"ten": "phường Vĩnh Trung",</p><p>`      `"daXuLyDungHan": [</p><p>`        `{</p><p>`          `"soDienThoai": "0236359000",</p><p>`          `"thoiGianDienRa": "9:14",</p><p>`          `"tenChuDe": "Hạ tầng đô thị",</p><p>`          `"latitude": null,</p><p>`          `"videos": "",</p><p>`          `"noiDung": "Theo thông tin  của người dân: Tại khu vực trước nhà 406 Nguyễn Hoàng, quận Thanh Khê, thành phố Đà Nẵng, rảnh cống thoát nước bị hỏng sụp xuống không có khung thép cản rác và vật thải nên xe ô tô đi qua sát đường dễ bị nguy hiểm xảy ra và hiện tượng này bị rất lâu rồi. \nKính đề nghị quý cơ quan quan tâm sửa chữa hư hỏng để tránh tình trạng trẻ em trượt chân, xe qua lại an toàn.",</p><p>`          `"tieuDe": "Cống thoát nước bị sụt lún trước 406 Nguyễn Hoàng",</p><p>`          `"ngayDienRa": "2023-01-03 09:00:51.0",</p><p>`          `"hinhAnh": [],</p><p>`          `"urlAnhDaiDien": "",</p><p>`          `"ngayKhaiBao": "2023-01-03 09:14:00.0",</p><p>`          `"tenNguoiKhaiBao": "Dân cư trước nhà 406 Nguyễn Hoàng, quận Thanh khê, TP Đà Nẵng",</p><p>`          `"noiDienRa": "406 Nguyễn Hoàng",</p><p>`          `"yKienId": 45684,</p><p>`          `"longitude": null,</p><p>`          `"fileDinhKem": null</p><p>`        `}</p>||
| :- | :- |
####
1. ## <a name="_toc139015675"></a>**Danh sách các API chia sẻ tích hợp**
   1. ### <a name="_toc139015676"></a>**API lấy dữ liệu báo cáo số liệu thống kê tổng hợp đơn vị theo trạng thái**
- Đường dẫn: DOMAIN + /baocaothongke/donvixuly
- Method: GET
- **Đầu vào:** Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|coquan|integer|Nhập Id cơ quan quản lý||
|2|tungay|string|Nhập thời gian từ ngày (Định dạng: dd/MM/yyyy)||
|3|denngay|string|Nhập thời gian đến ngày (Định dạng: dd/MM/yyyy)||

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau
  - **Thất bại**: Không có dữ liệu.
- Ví dụ:

|<p>{</p><p>`   `"data":[</p><p>`      `{</p><p>`         `"chuaXuLyConHan":0,</p><p>`         `"id":39365,</p><p>`         `"ten":"Ban Chỉ huy Phòng chống thiên tai và Tìm kiếm cứu nạn",</p><p>`         `"daXuLyDungHan":0,</p><p>`         `"chuaXuLyQuaHan":1,</p><p>`         `"daXuLyTreHan":0</p><p>`      `},</p><p>`      `{</p><p>`         `"chuaXuLyConHan":0,</p><p>`         `"id":27466,</p><p>`         `"ten":"Ban Quản lý An toàn thực phẩm thành phố",</p><p>`         `"daXuLyDungHan":8,</p><p>`         `"chuaXuLyQuaHan":0,</p><p>`         `"daXuLyTreHan":4</p><p>`      `},</p><p>`      `{</p><p>`         `"chuaXuLyConHan":0,</p><p>`         `"id":84,</p><p>`         `"ten":"Ban Quản lý các Khu công nghiệp và Chế xuất Đà Nẵng",</p><p>`         `"daXuLyDungHan":19,</p><p>`         `"chuaXuLyQuaHan":0,</p><p>`         `"daXuLyTreHan":0</p><p>`      `},</p><p>`      `…</p><p>`   `],</p><p>`   `"message":"OK"</p><p>}</p>||
| :- | :- |

1. ### <a name="_toc139015677"></a>**API lấy số liệu thống kê tổng hợp dạng biểu đồ theo trạng thái xử lý trên bản đồ GIS**
- Đường dẫn: DOMAIN + /baocaothongkebando/trangthaixuly
- Method: GET
- **Đầu vào:** Parameter: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|tungay|string|Nhập thời gian từ ngày (Định dạng: dd/MM/yyyy)|x|
|2|denngay|string|Nhập thời gian đến ngày (Định dạng: dd/MM/yyyy)|x|

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau
  - **Thất bại**: Không có dữ liệu.
- Ví dụ:

|<p>{</p><p>`   `"data":{</p><p>`      `"daXuLy":[</p><p>`         `{</p><p>`            `"soDienThoai":"0932505208",</p><p>`            `"thoiGianDienRa":"8:26",</p><p>`            `"tenChuDe":"An ninh trật tự",</p><p>`            `"latitude":16.07447,</p><p>`            `"noiDung":"Tình trạng quán nhậu tự phát tại 36 Nguyễn Cao, phường Thanh Khê Đông, quận Thanh Khê hoạt động từ 17h đến 22, 23h hát karaoke bằng loa kẹo kéo gây ồn ào. Đặc biệt, khách của quán nhậu đi vệ sinh, tiểu tiện ngoài đường rất hôi thối gây ô nhiễm môi trường. Quán nhậu tự phát hoạt động mới 2 năm nay, vừa bán quán vừa cho thuê loa kẹo kéo, nên tối đến các quán ở đây thi nhau hát karaoke gây mất an ninh trật tự và phóng uế bừa bãi ảnh hưởng đến người dân xung quanh. \nKính báo cơ quan chức năng kiểm tra xử lý và có biện pháp yêu cầu quán xây phòng vệ sinh cho khách./.",</p><p>`            `"tieuDe":"Quán nhậu tự phát hát karaoke gây ồn ào tại 36 Nguyễn Cao",</p><p>`            `"ngayDienRa":"2023-02-28 08:26:32.0",</p><p>`            `"hinhAnh":[</p><p>               </p><p>`            `],</p><p>`            `"urlAnhDaiDien":"",</p><p>`            `"ngayKhaiBao":"2023-03-01 08:14:00.0",</p><p>`            `"tenNguoiKhaiBao":"Anh Sa",</p><p>`            `"noiDienRa":"36 Đường Nguyễn Cao",</p><p>`            `"yKienId":46434,</p><p>`            `"longitude":108.18022</p><p>`         `},</p><p>`         `{</p><p>`            `"soDienThoai":"0935765545",</p><p>`            `"thoiGianDienRa":"5:30",</p><p>`            `"tenChuDe":"An ninh trật tự",</p><p>`            `"latitude":16.07972,</p><p>`            `"noiDung":"Quán nhậu Hùng Xiệc, 11 Nguyễn Chí Thanh, phường Thạch Thang, quận Hải Châu hoạt động kinh doanh rất ồn ào. Quán không mở nhạc, nhưng bán quán nhậu, nên khách nhậu la hét rất ồn ào, đặc biệt sau 22h quán vẫn còn rất đông khách, phần lớn là thanh niên, họ la hét hô hào quá ồn ào. \nKính báo cơ quan chức năng kiểm tra xử lý.",</p><p>`            `"tieuDe":"Quán nhậu Hùng Xiệc 11 Nguyễn Chí Thanh kinh doanh gây ồn ào",</p><p>`            `"ngayDienRa":"2023-02-28 05:30:35.0",</p><p>`            `"hinhAnh":[</p><p>               </p><p>`            `],</p><p>`            `"urlAnhDaiDien":"",</p><p>`            `"ngayKhaiBao":"2023-03-01 08:15:00.0",</p><p>`            `"tenNguoiKhaiBao":"Công dân",</p><p>`            `"noiDienRa":"11 Đường Nguyễn Chí Thanh",</p><p>`            `"yKienId":46435,</p><p>`            `"longitude":108.21997</p><p>`         `},</p><p>`         `{</p><p>`            `"soDienThoai":"0912549248",</p><p>`            `"thoiGianDienRa":"4:0",</p><p>`            `"tenChuDe":"An ninh trật tự",</p><p>`            `"latitude":16.07323,</p><p>`            `"noiDung":"Tình trạng người dân trên đường Phú Lộc 20, phường Hòa Minh, quận Liên Chiểu đổ bê tông lối đi lấn chiếm hết vỉa hè lòng đường. Bên cạnh đó xe ô tô đậu đỗ dưới lòng đường cản trở giao thông, hầu như nhà dân nào trên tuyến đường này không cho ô tô vào sân, lên vỉa hè mà đậu dưới lòng đường, nên người tham gia giao thông đi vào đường Phú Lộc 20 phải đi đường vòng, di chuyển rất khó khăn. \nKính báo cơ quan chức năng kiểm tra và xử lý vấn đề lấn chiếm lòng đường tại Phú Lộc 20./.",</p><p>`            `"tieuDe":"Lấn chiếm vỉa hè lòng đường trên đường Phú Lộc 20",</p><p>`            `"ngayDienRa":"2023-02-28 04:00:45.0",</p><p>`            `"hinhAnh":[</p><p>               </p><p>`            `],</p><p>`            `"urlAnhDaiDien":"",</p><p>`            `"ngayKhaiBao":"2023-03-01 08:15:00.0",</p><p>`            `"tenNguoiKhaiBao":"Chú Thành",</p><p>`            `"noiDienRa":"Đường Phú Lộc 20",</p><p>`            `"yKienId":46436,</p><p>`            `"longitude":108.16857</p><p>`         `},</p><p>         ...</p><p>`      `],</p><p>`      `"chuaXuLyQuaHan":[</p><p>`         `{</p><p>`            `"soDienThoai":"0934939218",</p><p>`            `"thoiGianDienRa":"8:15",</p><p>`            `"tenChuDe":"An ninh trật tự",</p><p>`            `"latitude":16.05842,</p><p>`            `"noiDung":"Quán cà phê tại 115 Huỳnh Ngọc Huệ, phường Hòa Khê, quận Thanh Khê mở nhạc hát cho nhau nghe gây ồn ào. Quán thường xuyên tụ tập hát nhạc từ 18h30 đến 22h rất ồn ào, khiến người dân xung quanh không thể nghỉ ngơi, các cháu không thể tập trung học bài. Quán hát không có phòng cách âm nên rất là to. \nKính báo cơ quan chức năng kiểm tra xử lý./.",</p><p>`            `"tieuDe":"Quán cà phê tại 115 Huỳnh Ngọc Huệ hát nhạc gây ồn ào",</p><p>`            `"ngayDienRa":"2023-03-28 08:15:20.0",</p><p>`            `"hinhAnh":[</p><p>               </p><p>`            `],</p><p>`            `"urlAnhDaiDien":"",</p><p>`            `"ngayKhaiBao":"2023-03-29 07:53:00.0",</p><p>`            `"tenNguoiKhaiBao":"Chị Hạnh",</p><p>`            `"noiDienRa":"Đường Huỳnh Ngọc Huệ",</p><p>`            `"yKienId":47021,</p><p>`            `"longitude":108.18637</p><p>`         `},</p><p>`         `{</p><p>`            `"soDienThoai":"0977701112",</p><p>`            `"thoiGianDienRa":"16:7",</p><p>`            `"tenChuDe":"An toàn giao thông",</p><p>`            `"latitude":16.00464,</p><p>`            `"noiDung":"Quán bún bò Huế ở số nhà 239 Diệp Minh Châu, phường Hòa Xuân, quận Cẩm Lệ thường lấn chiếm lòng lề đường làm nơi buôn bán, xe đậu hàng ngang chắn lối đi vào nhà, dùng đường thoát hiểm làm nơi tập kết rửa tô bát đổ nước thải bẩn ra vỉa trước nhà  tôi gây ô nhiễm mất vệ sinh. Chủ quán bún còn ngang nhiên lắp bạt vượt qua đường thoát hiểm gắn vào tường nhà tôi, tôi nhiều lần yêu cầu tháo dở nhưng không thực hiện. \nRất mong các cấp có thẩm quyền xử lý. Chân thành cảm ơn.",</p><p>`            `"tieuDe":"Bán bún lấn chiếm lòng lề đường Diệp Minh Châu",</p><p>`            `"ngayDienRa":"2023-03-27 16:02:25.0",</p><p>`            `"hinhAnh":[</p><p>               </p><p>`            `],</p><p>`            `"urlAnhDaiDien":"",</p><p>`            `"ngayKhaiBao":"2023-03-27 16:07:00.0",</p><p>`            `"tenNguoiKhaiBao":"Huỳnh Thị Thùy",</p><p>`            `"noiDienRa":"239 Đường Diệp Minh Châu",</p><p>`            `"yKienId":46985,</p><p>`            `"longitude":108.22655</p><p>`         `},</p><p>         ...</p><p>`      `],</p><p>`      `"chuaXuLy":[</p><p>`         `{</p><p>`            `"soDienThoai":"0934939218",</p><p>`            `"thoiGianDienRa":"8:15",</p><p>`            `"tenChuDe":"An ninh trật tự",</p><p>`            `"latitude":16.05842,</p><p>`            `"noiDung":"Quán cà phê tại 115 Huỳnh Ngọc Huệ, phường Hòa Khê, quận Thanh Khê mở nhạc hát cho nhau nghe gây ồn ào. Quán thường xuyên tụ tập hát nhạc từ 18h30 đến 22h rất ồn ào, khiến người dân xung quanh không thể nghỉ ngơi, các cháu không thể tập trung học bài. Quán hát không có phòng cách âm nên rất là to. \nKính báo cơ quan chức năng kiểm tra xử lý./.",</p><p>`            `"tieuDe":"Quán cà phê tại 115 Huỳnh Ngọc Huệ hát nhạc gây ồn ào",</p><p>`            `"ngayDienRa":"2023-03-28 08:15:20.0",</p><p>`            `"hinhAnh":[</p><p>               </p><p>`            `],</p><p>`            `"urlAnhDaiDien":"",</p><p>`            `"ngayKhaiBao":"2023-03-29 07:53:00.0",</p><p>`            `"tenNguoiKhaiBao":"Chị Hạnh",</p><p>`            `"noiDienRa":"Đường Huỳnh Ngọc Huệ",</p><p>`            `"yKienId":47021,</p><p>`            `"longitude":108.18637</p><p>`         `},</p><p>`         `{</p><p>`            `"soDienThoai":"0961210122",</p><p>`            `"thoiGianDienRa":"19:46",</p><p>`            `"tenChuDe":"Nhà đất - Xây dựng",</p><p>`            `"latitude":16.05007,</p><p>`            `"noiDung":"Kính gửi: UBND Quận Thanh Khê\n                Đội quy tắc đô thị Quận Thanh Khê\nTôi tên là: Nguyễn Đức Thịnh\nĐịa chỉ hiện tại: 243/50A Trường Chinh \u2013 An Khê \u2013 Thanh Khê \u2013 Đà Nẵng\nNội dung khiếu nại: Hiện nay, công trình xây dựng tại địa chỉ K243/48 Trường Chinh, phường An Khê, quận Thanh Khê (đối diện K243/71 Trường Chinh) do ông Trần Phi Hùng làm chủ đang có dấu hiệu xây dựng tự phát, không giấy phép xây dựng và ảnh hưởng nghiêm trọng đến nhà của tôi là nhà liền kề của ông Hùng. \nCụ thể: công trình xây dựng ông Hùng không có các phương án bảo đảm cho nhà liền kề, tự ý đóng đinh, đóng vào tường nhà tôi gây nứt phần thạch cao của nhà tôi (có hình ảnh kèm theo).\nNgoài ra, công trình tự phát của ông Hùng không xây dựng tường mà cố ý dùng tường của nhà tôi làm tường chung, đặc biệt là khu vực nhà vệ sinh (có hình ảnh kèm theo). Tôi đã nhiều lần gặp ông Hùng đề nghị ông Hùng có biện pháp xây dựng không dùng tường của nhà tôi làm tường chung nhưng không đi đến kết quả.\nTôi nhận thấy việc ông Nguyễn Phi Hùng chủ công trình xây dựng K243/48 Trường Chinh không có các biện pháp xây dựng đúng luật pháp đã làm ảnh hưởng nghiêm trọng đến nhà ở của tôi, gây ổn ào và không đảm bảo môi trường trong quá trình xây dựng.\nVậy tôi viết đơn này kính mong UBND quận Thanh Khê, Đội quy tắc đô thị quận Thanh Khê tiến hành kiểm tra và xử lý công trình của ông Nguyễn Phi Hùng tại địa chỉ K243/48 Trường Chinh nhằm đảm bảo an toàn, không gây ảnh hưởng đến nhà ở của tôi và có biện pháp khắc phục với những hư hại mà ông Hùng gây ra.\nKính mong quý cơ quan nhanh chóng giải quyết khiếu nại của tôi, xin chân thành cảm ơn./.",</p><p>`            `"tieuDe":"Xây dựng gây ảnh hưởng nhà liền kề tại 243/48 Trường Chinh",</p><p>`            `"ngayDienRa":"2023-03-30 19:21:07.0",</p><p>`            `"hinhAnh":[</p><p>`               `"https://cgy.greenglobal.com.vn//cgyfiles/2023/4/12/giamsat (1)\_1681268013021.jpeg"</p><p>`            `],</p><p>`            `"urlAnhDaiDien":"https://cgy.greenglobal.com.vn//cgyfiles/2023/4/12/giamsat (1)\_1681268007206\_1681268013212.jpeg",</p><p>`            `"ngayKhaiBao":"2023-03-30 19:46:00.0",</p><p>`            `"tenNguoiKhaiBao":"Đức Thịnh Nguyễn",</p><p>`            `"noiDienRa":"Kiệt 243 Trường Chinh",</p><p>`            `"yKienId":47066,</p><p>`            `"longitude":108.1846</p><p>`         `},</p><p>`         `{</p><p>`            `"soDienThoai":"0977701112",</p><p>`            `"thoiGianDienRa":"16:7",</p><p>`            `"tenChuDe":"An toàn giao thông",</p><p>`            `"latitude":16.00464,</p><p>`            `"noiDung":"Quán bún bò Huế ở số nhà 239 Diệp Minh Châu, phường Hòa Xuân, quận Cẩm Lệ thường lấn chiếm lòng lề đường làm nơi buôn bán, xe đậu hàng ngang chắn lối đi vào nhà, dùng đường thoát hiểm làm nơi tập kết rửa tô bát đổ nước thải bẩn ra vỉa trước nhà  tôi gây ô nhiễm mất vệ sinh. Chủ quán bún còn ngang nhiên lắp bạt vượt qua đường thoát hiểm gắn vào tường nhà tôi, tôi nhiều lần yêu cầu tháo dở nhưng không thực hiện. \nRất mong các cấp có thẩm quyền xử lý. Chân thành cảm ơn.",</p><p>`            `"tieuDe":"Bán bún lấn chiếm lòng lề đường Diệp Minh Châu",</p><p>`            `"ngayDienRa":"2023-03-27 16:02:25.0",</p><p>`            `"hinhAnh":[</p><p>               </p><p>`            `],</p><p>`            `"urlAnhDaiDien":"",</p><p>`            `"ngayKhaiBao":"2023-03-27 16:07:00.0",</p><p>`            `"tenNguoiKhaiBao":"Huỳnh Thị Thùy",</p><p>`            `"noiDienRa":"239 Đường Diệp Minh Châu",</p><p>`            `"yKienId":46985,</p><p>`            `"longitude":108.22655</p><p>`         `},</p><p>		 ...</p><p>`      `]</p><p>`   `}</p><p>}</p>||
| :- | :- |

1. ### <a name="_toc139015678"></a>**Xác thực thông tin tài khoản truy cập dịch vụ/ người sử dụng với hệ thống**
- Đường dẫn: DOMAIN + /admin/login
- Method: GET
- **Đầu vào:** Raw body: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|tenDangNhap|string|Nhập tên đăng nhập|x|
|2|matKhau|string|Nhập mật khẩu của tài khoản|x|

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau
  - **Thất bại**: Không có dữ liệu.
- Ví dụ:

|<p>{</p><p>`    `"access\_token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0YXBpIiwiYXV0aCI6InRlc3RhcGkiLCJleHAiOjE2ODgxNzU0MzZ9.RWhgKiMoZb6zxvjbqQiYDaayUbRRkTMBnuLqtuTQNtGahTVT\_pUSuhfcSOqVQzd64ppbOdqfzqt2oQjMikwknw"</p><p>}</p>||
| :- | :- |

1. ### <a name="_toc139015679"></a>**Bổ sung Service trả danh sách phản ánh kèm kết quả đánh giá cho hệ thống ngoài**
- Đường dẫn: DOMAIN + /admin/gopy
- Method: GET
- **Đầu vào:** Raw body: 

|**STT**|**Tham số**|**Thuộc tính tham số**|**Mô tả**|**Bắt buộc**|
| :-: | :-: | :-: | :-: | :-: |
|1|keyword|string|Lọc theo từ khóa||
|2|coquan|Integer|Lọc theo Id cơ quan||
|3|linhvuc|Integer|Lọc theo Id lĩnh vực||
|4|quanHuyen|Integer|Lọc theo Id quận huyện||
|5|phuongxa|Integer|Lọc theo id phường xã||
|6|tungay|string|Lọc theo thời gian từ ngày||
|7|denngay|string|Lọc theo thời gian đến ngày||
|8|capdosuco|Integer|Lọc theo id cấp độ sự cố||
|9|loai|Integer|Lọc theo tình trạng xử lý||
|10|kieu|string|<p>"Sắp xếp theo</p><p>1: thời gian (mặc định)</p><p>2: số quan tâm</p><p>3: số bình luận</p><p>khác: thời gian"				</p>||
|11|page|Integer|<p>"Sắp xếp:</p><p>asc: tăng dần</p><p>desc: giảm dần (mặc định)"		</p>||
|12|size|Integer|Default : 1||
|13|tinhtrangxuly|string|<p>Số phần tử trong 1 trang </p><p>Default : 15</p>||

- **Đầu ra**:
  - **Thành công**: Chuỗi json có dữ liệu như sau
  - **Thất bại**: Không có dữ liệu.
- Ví dụ:

|<p>{</p><p>`   `"data":[</p><p>`      `{</p><p>`         `"noiDungDanhGia":"",</p><p>`         `"tinhTrangXuLy":"Đã xử lý",</p><p>`         `"binhLuan":0,</p><p>`         `"thoiGianDienRa":"16:42",</p><p>`         `"tenCoQuan":"Trung tâm Thông tin và giám sát, điều hành thông minh Đà Nẵng",</p><p>`         `"tenChuDe":"Chuyển đổi số",</p><p>`         `"thongTinLienHeId":48441,</p><p>`         `"noiDung":"djdj",</p><p>`         `"tieuDe":"annount-2906",</p><p>`         `"maTinhTrangXuLy":"DA\_XU\_LY",</p><p>`         `"ngayDienRa":"29/06/2023",</p><p>`         `"hinhAnh":[</p><p>            </p><p>`         `],</p><p>`         `"rate":0,</p><p>`         `"urlAnhDaiDien":"",</p><p>`         `"id":47330,</p><p>`         `"mauNen":"#915213",</p><p>`         `"danhGia":"",</p><p>`         `"quanTam":0</p><p>`      `},</p><p>`      `{</p><p>`         `"noiDungDanhGia":"",</p><p>`         `"tinhTrangXuLy":"Đã xử lý",</p><p>`         `"binhLuan":0,</p><p>`         `"thoiGianDienRa":"15:48",</p><p>`         `"tenCoQuan":"UBND quận Hải Châu",</p><p>`         `"tenChuDe":"Chuyển đổi số",</p><p>`         `"thongTinLienHeId":48441,</p><p>`         `"noiDung":"jxxu",</p><p>`         `"tieuDe":"check thêm anhe file-2906",</p><p>`         `"maTinhTrangXuLy":"DA\_XU\_LY",</p><p>`         `"ngayDienRa":"29/06/2023",</p><p>`         `"hinhAnh":[</p><p>`            `"https://cgy.greenglobal.com.vn//cgyfiles/2023/6/29//data/user/0/com.gopydanang.admin/cache/45495543-9d62-4142-b6ed-3c08df7357de/Screenshot\_20230626-153856\_1688031236800.png",</p><p>`            `"https://cgy.greenglobal.com.vn//cgyfiles/2023/6/29//data/user/0/com.gopydanang.admin/cache/2aeb2461-68ee-4e4b-93f2-dd006c56b792/vn.mafc.mobileapp\_1688031265780.png",</p><p>`            `"https://cgy.greenglobal.com.vn//cgyfiles/2023/6/29//data/user/0/com.gopydanang.admin/cache/c37cda8c-85e5-4cbd-a685-4a9babcee93a/com.ftel.foxpay\_1688031277368.png"</p><p>`         `],</p><p>`         `"rate":0,</p><p>`         `"urlAnhDaiDien":"",</p><p>`         `"id":47326,</p><p>`         `"mauNen":"#915213",</p><p>`         `"danhGia":"",</p><p>`         `"quanTam":0</p><p>`      `},</p><p>`      `{</p><p>`         `"noiDungDanhGia":"",</p><p>`         `"tinhTrangXuLy":"Đã xử lý",</p><p>`         `"binhLuan":0,</p><p>`         `"thoiGianDienRa":"16:28",</p><p>`         `"tenCoQuan":"Trung tâm Thông tin và giám sát, điều hành thông minh Đà Nẵng",</p><p>`         `"tenChuDe":"Chuyển đổi số",</p><p>`         `"thongTinLienHeId":48441,</p><p>`         `"noiDung":" xxn",</p><p>`         `"tieuDe":"tb của dvc",</p><p>`         `"maTinhTrangXuLy":"DA\_XU\_LY",</p><p>`         `"ngayDienRa":"29/06/2023",</p><p>`         `"hinhAnh":[</p><p>            </p><p>`         `],</p><p>`         `"rate":0,</p><p>`         `"urlAnhDaiDien":"",</p><p>`         `"id":47329,</p><p>`         `"mauNen":"#915213",</p><p>`         `"danhGia":"",</p><p>`         `"quanTam":0</p><p>`      `},</p><p>`      `{</p><p>`         `"noiDungDanhGia":"",</p><p>`         `"tinhTrangXuLy":"Đang xử lý",</p><p>`         `"binhLuan":0,</p><p>`         `"thoiGianDienRa":"16:20",</p><p>`         `"tenCoQuan":"UBND quận Hải Châu",</p><p>`         `"tenChuDe":"Vướng mắc doanh nghiệp",</p><p>`         `"thongTinLienHeId":50390,</p><p>`         `"noiDung":"ok",</p><p>`         `"tieuDe":"ko đăng nhập-2906",</p><p>`         `"maTinhTrangXuLy":"DANG\_XU\_LY",</p><p>`         `"ngayDienRa":"29/06/2023",</p><p>`         `"hinhAnh":[</p><p>            </p><p>`         `],</p><p>`         `"rate":0,</p><p>`         `"urlAnhDaiDien":"",</p><p>`         `"id":47328,</p><p>`         `"mauNen":"#53b6e7",</p><p>`         `"danhGia":"",</p><p>`         `"quanTam":0</p><p>`      `},</p><p>`      `{</p><p>`         `"noiDungDanhGia":"",</p><p>`         `"tinhTrangXuLy":"Đang xử lý",</p><p>`         `"binhLuan":0,</p><p>`         `"thoiGianDienRa":"16:06",</p><p>`         `"tenCoQuan":"UBND quận Hải Châu",</p><p>`         `"tenChuDe":"Chuyển đổi số",</p><p>`         `"thongTinLienHeId":48441,</p><p>`         `"noiDung":"jxxk",</p><p>`         `"tieuDe":"ẩn danh-2906",</p><p>`         `"maTinhTrangXuLy":"DANG\_XU\_LY",</p><p>`         `"ngayDienRa":"29/06/2023",</p><p>`         `"hinhAnh":[</p><p>            </p><p>`         `],</p><p>`         `"rate":0,</p><p>`         `"urlAnhDaiDien":"",</p><p>`         `"id":47327,</p><p>`         `"mauNen":"#915213",</p><p>`         `"danhGia":"",</p><p>`         `"quanTam":0</p><p>`      `},</p><p>`      `{</p><p>`         `"noiDungDanhGia":"Thời gian xử lý chậm",</p><p>`         `"tinhTrangXuLy":"Đã xử lý",</p><p>`         `"binhLuan":0,</p><p>`         `"thoiGianDienRa":"15:34",</p><p>`         `"tenCoQuan":"UBND quận Cẩm Lệ",</p><p>`         `"tenChuDe":"Phản hồi báo nêu",</p><p>`         `"thongTinLienHeId":48441,</p><p>`         `"noiDung":"ok",</p><p>`         `"tieuDe":"check update-2609",</p><p>`         `"maTinhTrangXuLy":"DA\_XU\_LY",</p><p>`         `"ngayDienRa":"29/06/2023",</p><p>`         `"hinhAnh":[</p><p>`            `"https://cgy.greenglobal.com.vn//cgyfiles/2023/6/29//data/user/0/com.gopydanang.client/cache/scaled\_Screenshot\_20230407-085128\_1688027688683.png"</p><p>`         `],</p><p>`         `"rate":0,</p><p>`         `"urlAnhDaiDien":"",</p><p>`         `"id":47325,</p><p>`         `"mauNen":"#065490",</p><p>`         `"danhGia":"Không hài lòng",</p><p>`         `"quanTam":1</p><p>`      `},</p><p>`      `{</p><p>`         `"noiDungDanhGia":"",</p><p>`         `"tinhTrangXuLy":"Đã xử lý",</p><p>`         `"binhLuan":0,</p><p>`         `"thoiGianDienRa":"11:16",</p><p>`         `"tenCoQuan":"UBND quận Hải Châu",</p><p>`         `"tenChuDe":"Môi trường",</p><p>`         `"thongTinLienHeId":33935,</p><p>`         `"noiDung":"thông báo ngày 27.6",</p><p>`         `"tieuDe":"thông báo ngày 27.6",</p><p>`         `"maTinhTrangXuLy":"DA\_XU\_LY",</p><p>`         `"ngayDienRa":"27/06/2023",</p><p>`         `"hinhAnh":[</p><p>            </p><p>`         `],</p><p>`         `"rate":0,</p><p>`         `"urlAnhDaiDien":"",</p><p>`         `"id":47324,</p><p>`         `"mauNen":"#45B900",</p><p>`         `"danhGia":"",</p><p>`         `"quanTam":0</p><p>`      `},</p><p>`      `{</p><p>`         `"noiDungDanhGia":"",</p><p>`         `"tinhTrangXuLy":"Đã xử lý",</p><p>`         `"binhLuan":0,</p><p>`         `"thoiGianDienRa":"09:34",</p><p>`         `"tenCoQuan":"UBND quận Cẩm Lệ",</p><p>`         `"tenChuDe":"Vướng mắc doanh nghiệp",</p><p>`         `"thongTinLienHeId":50389,</p><p>`         `"noiDung":"ok",</p><p>`         `"tieuDe":"2706-android",</p><p>`         `"maTinhTrangXuLy":"DA\_XU\_LY",</p><p>`         `"ngayDienRa":"27/06/2023",</p><p>`         `"hinhAnh":[</p><p>            </p><p>`         `],</p><p>`         `"rate":0,</p><p>`         `"urlAnhDaiDien":"",</p><p>`         `"id":47323,</p><p>`         `"mauNen":"#53b6e7",</p><p>`         `"danhGia":"",</p><p>`         `"quanTam":0</p><p>`      `},</p><p>`      `{</p><p>`         `"noiDungDanhGia":"",</p><p>`         `"tinhTrangXuLy":"Đang xử lý",</p><p>`         `"binhLuan":0,</p><p>`         `"thoiGianDienRa":"09:29",</p><p>`         `"tenCoQuan":"UBND phường Hải Châu I",</p><p>`         `"tenChuDe":"Chuyển đổi số",</p><p>`         `"thongTinLienHeId":50388,</p><p>`         `"noiDung":"ok",</p><p>`         `"tieuDe":"khanhpdse03812-2706",</p><p>`         `"maTinhTrangXuLy":"DANG\_XU\_LY",</p><p>`         `"ngayDienRa":"27/06/2023",</p><p>`         `"hinhAnh":[</p><p>            </p><p>`         `],</p><p>`         `"rate":0,</p><p>`         `"urlAnhDaiDien":"",</p><p>`         `"id":47322,</p><p>`         `"mauNen":"#915213",</p><p>`         `"danhGia":"Hài lòng",</p><p>`         `"quanTam":0</p><p>`      `},</p><p>`      `{</p><p>`         `"noiDungDanhGia":"",</p><p>`         `"tinhTrangXuLy":"Đang xử lý",</p><p>`         `"binhLuan":0,</p><p>`         `"thoiGianDienRa":"08:55",</p><p>`         `"tenCoQuan":"UBND phường Hải Châu I",</p><p>`         `"tenChuDe":"Phản hồi báo nêu",</p><p>`         `"thongTinLienHeId":50328,</p><p>`         `"noiDung":"ok",</p><p>`         `"tieuDe":"check thông báo của người dân",</p><p>`         `"maTinhTrangXuLy":"DANG\_XU\_LY",</p><p>`         `"ngayDienRa":"19/06/2023",</p><p>`         `"hinhAnh":[</p><p>            </p><p>`         `],</p><p>`         `"rate":0,</p><p>`         `"urlAnhDaiDien":"",</p><p>`         `"id":47298,</p><p>`         `"mauNen":"#065490",</p><p>`         `"danhGia":"",</p><p>`         `"quanTam":0</p><p>`      `},</p><p>`      `{</p><p>`         `"noiDungDanhGia":"",</p><p>`         `"tinhTrangXuLy":"Đã xử lý",</p><p>`         `"binhLuan":0,</p><p>`         `"thoiGianDienRa":"17:31",</p><p>`         `"tenCoQuan":"UBND quận Hải Châu",</p><p>`         `"tenChuDe":"Hạ tầng đô thị",</p><p>`         `"thongTinLienHeId":33935,</p><p>`         `"noiDung":"Test thông báo web",</p><p>`         `"tieuDe":"Test thông báo web",</p><p>`         `"maTinhTrangXuLy":"DA\_XU\_LY",</p><p>`         `"ngayDienRa":"26/06/2023",</p><p>`         `"hinhAnh":[</p><p>            </p><p>`         `],</p><p>`         `"rate":0,</p><p>`         `"urlAnhDaiDien":"",</p><p>`         `"id":47317,</p><p>`         `"mauNen":"#F6900C",</p><p>`         `"danhGia":"",</p><p>`         `"quanTam":0</p><p>`      `},</p><p>`      `{</p><p>`         `"noiDungDanhGia":"",</p><p>`         `"tinhTrangXuLy":"Đã xử lý",</p><p>`         `"binhLuan":0,</p><p>`         `"thoiGianDienRa":"16:12",</p><p>`         `"tenCoQuan":"UBND quận Hải Châu",</p><p>`         `"tenChuDe":"An toàn giao thông",</p><p>`         `"thongTinLienHeId":33935,</p><p>`         `"noiDung":"test thông báo",</p><p>`         `"tieuDe":"test thông báo 27.6",</p><p>`         `"maTinhTrangXuLy":"DA\_XU\_LY",</p><p>`         `"ngayDienRa":"26/06/2023",</p><p>`         `"hinhAnh":[</p><p>            </p><p>`         `],</p><p>`         `"rate":0,</p><p>`         `"urlAnhDaiDien":"",</p><p>`         `"id":47316,</p><p>`         `"mauNen":"#0464A5",</p><p>`         `"danhGia":"",</p><p>`         `"quanTam":0</p><p>`      `},</p><p>`      `{</p><p>`         `"noiDungDanhGia":"",</p><p>`         `"tinhTrangXuLy":"Đã xử lý",</p><p>`         `"binhLuan":0,</p><p>`         `"thoiGianDienRa":"15:37",</p><p>`         `"tenCoQuan":"Trung tâm Thông tin và giám sát, điều hành thông minh Đà Nẵng",</p><p>`         `"tenChuDe":"Chuyển đổi số",</p><p>`         `"thongTinLienHeId":48441,</p><p>`         `"noiDung":"jdjd",</p><p>`         `"tieuDe":"thông báo khi dvc xử lý trực tiếp",</p><p>`         `"maTinhTrangXuLy":"DA\_XU\_LY",</p><p>`         `"ngayDienRa":"26/06/2023",</p><p>`         `"hinhAnh":[</p><p>            </p><p>`         `],</p><p>`         `"rate":0,</p><p>`         `"urlAnhDaiDien":"",</p><p>`         `"id":47315,</p><p>`         `"mauNen":"#915213",</p><p>`         `"danhGia":"",</p><p>`         `"quanTam":0</p><p>`      `},</p><p>`      `{</p><p>`         `"noiDungDanhGia":"",</p><p>`         `"tinhTrangXuLy":"Đang xử lý",</p><p>`         `"binhLuan":0,</p><p>`         `"thoiGianDienRa":"15:08",</p><p>`         `"tenCoQuan":"Trung tâm Thông tin và giám sát, điều hành thông minh Đà Nẵng",</p><p>`         `"tenChuDe":"Phản hồi báo nêu",</p><p>`         `"thongTinLienHeId":48441,</p><p>`         `"noiDung":"xxx",</p><p>`         `"tieuDe":"tiêu đề xuất bản",</p><p>`         `"maTinhTrangXuLy":"DANG\_XU\_LY",</p><p>`         `"ngayDienRa":"26/06/2023",</p><p>`         `"hinhAnh":[</p><p>            </p><p>`         `],</p><p>`         `"rate":0,</p><p>`         `"urlAnhDaiDien":"",</p><p>`         `"id":47314,</p><p>`         `"mauNen":"#065490",</p><p>`         `"danhGia":"",</p><p>`         `"quanTam":0</p><p>`      `},</p><p>`      `{</p><p>`         `"noiDungDanhGia":"",</p><p>`         `"tinhTrangXuLy":"Đã xử lý",</p><p>`         `"binhLuan":0,</p><p>`         `"thoiGianDienRa":"14:54",</p><p>`         `"tenCoQuan":"UBND quận Hải Châu",</p><p>`         `"tenChuDe":"Phản hồi báo nêu",</p><p>`         `"thongTinLienHeId":48441,</p><p>`         `"noiDung":"jdjd",</p><p>`         `"tieuDe":"thông báo 2606",</p><p>`         `"maTinhTrangXuLy":"DA\_XU\_LY",</p><p>`         `"ngayDienRa":"26/06/2023",</p><p>`         `"hinhAnh":[</p><p>            </p><p>`         `],</p><p>`         `"rate":0,</p><p>`         `"urlAnhDaiDien":"",</p><p>`         `"id":47313,</p><p>`         `"mauNen":"#065490",</p><p>`         `"danhGia":"",</p><p>`         `"quanTam":0</p><p>`      `}</p><p>`   `],</p><p>`   `"totalPages":1729,</p><p>`   `"totalElements":25929</p><p>}</p>||
| :- | :- |


