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

Tài liệu nội bộ nằm trong thư mục `private/` — thư mục này bị `.gitignore`
loại ra nên **không bao giờ** lên GitHub, cũng không lên website:

- `1345_NGUYEN_HONG_NGUYET_QUE.docx` — hồ sơ CV bản Word
- `queenie-template-reference.jpg` — ảnh mẫu thiết kế

Ngoài ra `build.mjs` còn chặn thêm một lớp nữa: mọi file `.docx`/`.pdf`
lỡ nằm trong `assets/` cũng không được chép ra bản xuất bản
(khai báo ở biến `KHONG_XUAT_BAN`).

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

Website đang chạy tại **https://nguyetque3005.github.io**

Repo dùng hai nhánh:

| Nhánh | Chứa gì |
|---|---|
| `source` | Mã nguồn: `content/`, `src/`, `assets/`, `build.mjs` — chỗ bạn làm việc |
| `main` | Chỉ website đã dựng — GitHub Pages đọc nhánh này, **không sửa tay** |

### Đăng bản mới sau khi sửa nội dung

```bash
npm run build     # xem thử ở máy trước
npm run serve     # mở http://localhost:8000 kiểm tra

git add -A
git commit -m "Thêm bài viết mới"
git push origin source

npm run deploy    # dựng lại và đẩy lên main → website cập nhật
```

`npm run deploy` lo hết phần nhánh `main`. Sau khi chạy, đợi khoảng
một phút để GitHub Pages cập nhật.

### Khoá SSH

Repo này đẩy bằng khoá `~/.ssh/id_ed25519_nguyetque` (tài khoản `nguyetque3005`).
Script deploy đã tự dùng đúng khoá. Nếu chạy lệnh `git push` tay:

```bash
export GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519_nguyetque -o IdentitiesOnly=yes"
```

### Form liên hệ

Website tĩnh nên không có máy chủ nhận form. Nút "Soạn email gửi Queenie"
mở sẵn một email đã điền đầy đủ trong ứng dụng mail của người gửi —
chạy được trên mọi nơi lưu trữ, không cần cấu hình gì.

Nếu sau này muốn nhận form thẳng vào hộp thư mà người gửi không phải
mở ứng dụng mail, có thể chuyển sang [Formspree](https://formspree.io)
hoặc dời website sang Netlify.

### Tên miền riêng

Khi có tên miền thật:

1. Sửa `content/site.json` → `"seo": { "url": "https://tenmiencuaban.com" }`
2. Thêm file `CNAME` chứa tên miền vào thư mục `dist/` khi build
   (hoặc khai báo trong Settings → Pages → Custom domain)
3. Chạy `npm run deploy`

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
├─ scripts/deploy.sh     ← đẩy website lên GitHub Pages
├─ dist/                 ← KẾT QUẢ (tự sinh, đừng sửa tay, không lên git)
├─ private/              ← tài liệu nội bộ (không lên git)
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
