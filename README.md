# Tiếng Hàn cùng Queenie

Trang cá nhân của **Nguyễn Hồng Nguyệt Quế (Queenie)** — Thạc sĩ Biên–Phiên dịch Hàn–Việt.

Website tĩnh, không dùng framework, không cần cài thêm thư viện nào.
Nội dung nằm trong thư mục `content/` dưới dạng file JSON và Markdown —
sửa nội dung **không cần biết lập trình**.

---

## Chạy thử trên máy

Cần cài sẵn [Node.js](https://nodejs.org) phiên bản 18 trở lên.

```bash
npm run build     # dựng website, kết quả nằm trong thư mục dist/
npm run serve     # dựng rồi mở server tại http://localhost:8000
```

Nếu cổng 8000 đang bận:

```bash
PORT=8123 npm run serve
```

---

## Sửa nội dung ở đâu

| Muốn sửa gì | Mở file này |
|---|---|
| Tên trang, menu, email, mạng xã hội | `content/site.json` |
| Thư ngỏ ở trang chủ, các chương hành trình, ảnh | `content/story.json` |
| Hồ sơ: kinh nghiệm, học vấn, chứng chỉ | `content/cv.json` |
| Lớp học, khoá học, quy trình | `content/classes.json` |
| Nhận xét của học viên | `content/testimonials.json` |
| Bài viết blog | `content/blog/*.md` |
| Màu sắc, kiểu chữ | `src/styles/style.css` (phần `:root` ở đầu file) |

Sửa xong luôn chạy lại `npm run build`.

### Lưu ý quan trọng

- **Không sửa file trong `dist/`.** Thư mục đó bị xoá và tạo lại mỗi lần build.
- Trong file JSON, giữ nguyên dấu ngoặc kép và dấu phẩy. Nếu lỡ xoá nhầm,
  lệnh build sẽ báo lỗi và chỉ ra file bị hỏng.

---

## Viết một bài blog mới

1. Mở thư mục `content/blog/`.
2. Copy file `_mau-bai-viet.md`, đổi tên thành `2026-09-15-ten-bai-viet.md`
   (ngày tháng ở đầu, tên không dấu, không khoảng trắng).
3. Sửa phần thông tin giữa hai dòng `---` ở đầu file:

```markdown
---
title: Phân biệt 은/는 và 이/가
date: 2026-09-15
category: Ngữ pháp
summary: Hai cặp trợ từ làm khổ người học nhiều nhất, giải thích bằng cách dễ nhớ.
image: /assets/images/blog/eun-neun.jpg
imageAlt: Trang vở ghi chép ngữ pháp tiếng Hàn
---
```

4. Viết nội dung bên dưới.
5. Chạy `npm run build`.

Danh mục dùng được: `Ngữ pháp`, `Từ vựng`, `TOPIK`, `Tiếng Hàn công sở`, `Cuộc sống ở Hàn`.

File có tên bắt đầu bằng dấu gạch dưới `_` sẽ **không** được đăng lên website —
dùng để lưu bản nháp.

---

## Thêm ảnh

Bỏ file ảnh vào thư mục `assets/`, rồi trỏ tới nó bằng đường dẫn `/assets/ten-file.jpeg`.

Trong `content/story.json`, mỗi chương có thể có một hoặc hai ảnh:

```json
"photos": [
  {
    "src": "/assets/ten-file.jpeg",
    "alt": "Mô tả ảnh cho người khiếm thị và cho Google",
    "caption": "Chú thích hiện dưới ảnh",
    "ratio": "portrait"
  }
]
```

`ratio` có thể bỏ trống (ảnh ngang, khung 4:3), hoặc:
- `"portrait"` — ảnh chụp dọc, khung 3:4
- `"natural"` — giữ nguyên tỉ lệ gốc, không cắt gì cả

Nếu file ảnh chưa có, website vẫn chạy bình thường và hiện một khung giữ chỗ
có nhãn, chứ không bị vỡ ảnh.

### Ảnh không được đăng lên mạng

Những file sau nằm trong `assets/` nhưng **cố tình không** được đưa lên website:

- File `.docx` và `.pdf` — hồ sơ CV bản gốc, tài liệu nội bộ
- `queenie-template-reference.jpg` — ảnh mẫu thiết kế

Danh sách này khai báo trong `build.mjs`, biến `KHONG_XUAT_BAN`.

---

## Nhận xét học viên

Mặc định phần "Học viên nói gì" **không hiển thị**, vì `content/testimonials.json`
đang để rỗng. Khi có nhận xét thật, thêm vào:

```json
"items": [
  {
    "quote": "Chị giảng dễ hiểu, em thi TOPIK được 4급.",
    "name": "Minh Anh",
    "context": "Lớp luyện TOPIK, 2026"
  }
]
```

Chỉ thêm nhận xét **có thật từ học viên thật**.

---

## Đưa website lên mạng

Website là các file tĩnh trong `dist/`, đưa lên đâu cũng chạy.

### Netlify (khuyến nghị — miễn phí, có sẵn form liên hệ)

1. Đẩy thư mục này lên GitHub.
2. Vào [netlify.com](https://netlify.com), chọn **Add new site → Import an existing project**.
3. Khai báo:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Form liên hệ sẽ tự hoạt động (Netlify Forms). Thư gửi về xem ở tab **Forms**.

### Cloudflare Pages / GitHub Pages

Cũng chạy được, cấu hình tương tự. Riêng **form liên hệ sẽ không hoạt động**
vì đó là tính năng riêng của Netlify — khi đó nên đổi form sang
[Formspree](https://formspree.io) hoặc bỏ form, chỉ để email.

### Tên miền

Sau khi có tên miền thật, sửa `content/site.json`:

```json
"seo": { "url": "https://tenmiencuaban.com" }
```

Giá trị này dùng cho sitemap, RSS và thẻ chia sẻ mạng xã hội.

---

## Cấu trúc thư mục

```
queenie-korean-homepage/
├─ content/              ← NỘI DUNG (Queenie sửa ở đây)
│  ├─ site.json
│  ├─ story.json
│  ├─ cv.json
│  ├─ classes.json
│  ├─ testimonials.json
│  └─ blog/*.md
├─ assets/               ← ảnh và logo
├─ src/                  ← mã nguồn giao diện
│  ├─ lib/markdown.mjs   ← bộ chuyển Markdown sang HTML
│  ├─ templates/*.mjs    ← khuôn từng trang
│  ├─ styles/style.css
│  └─ scripts/main.js
├─ build.mjs             ← lệnh dựng website
├─ dist/                 ← KẾT QUẢ (tự sinh, đừng sửa tay)
└─ _v1-cu/               ← bản website cũ, giữ lại để tham khảo
```

---

## Trang hiện có

| Đường dẫn | Nội dung |
|---|---|
| `/` | Câu chuyện — thư ngỏ và hành trình 2009 → hôm nay |
| `/ho-so.html` | Hồ sơ đầy đủ: kinh nghiệm, học vấn, chứng chỉ |
| `/blog.html` | Danh sách bài viết, lọc theo chuyên mục |
| `/blog/<bài>.html` | Từng bài viết |
| `/lop-hoc.html` | Các lớp và cách bắt đầu |
| `/lien-he.html` | Form liên hệ và email |
| `/cam-on.html` | Trang hiện sau khi gửi form |
| `/404.html` | Trang báo không tìm thấy |

Ngoài ra build tự sinh `sitemap.xml`, `feed.xml` (RSS) và `robots.txt`.

---

## Về phần tiếng Hàn (làm sau)

Cấu trúc đã sẵn sàng cho một bản tiếng Hàn ở `/ko/` khi cần —
gửi cho công ty Hàn Quốc như một hồ sơ web. Hiện tại chưa làm,
để tránh có trang dịch dở dang.
