---
name: dang-bai-tu-google-docs
description: Use when the user gives a Google Docs link (or PDF/doc file) from Queenie and asks to post it, add a new blog post, update a page from that document, fix an existing post against its source, or regenerate a banner for this site.
---

# Đăng bài từ tài liệu của Queenie

Tài liệu gốc là lời của một người dạy học có thật. Việc ở đây là **chuyển
định dạng**, không phải viết lại. Hai lỗi đã xảy ra thật trên repo này: một
phiên tự thêm đoạn mở đầu theo giọng tác giả, một phiên chép đúng chữ nhưng bỏ
hết in đậm và highlight.

## Quy trình

### 1. Đọc tài liệu gốc, cả chữ lẫn định dạng

```bash
python3 scripts/gdoc-sang-md.py "<link Google Docs>"              # Markdown thô
python3 scripts/gdoc-sang-md.py "<link Google Docs>" --dinh-dang  # danh sách chỗ nhấn
```

Markdown thô luôn cần sửa tay (bảng của Docs hay là bảng bố cục, không phải
bảng dữ liệu). Cứ sửa cấu trúc cho hợp web, nhưng **không đụng vào câu chữ**.

### 2. Xác định tài liệu này thuộc về đâu

Không phải link nào cũng là bài blog. Đọc nội dung rồi mới quyết:

| Nội dung tài liệu | Đích đến |
| --- | --- |
| Bài dạy, kinh nghiệm, tổng hợp từ vựng/ngữ pháp | `content/blog/YYYY-MM-DD-slug.md` |
| Giới thiệu / đăng ký khoá học | `content/classes.json` |
| Giới thiệu bản thân, hành trình | `content/story.json`, `content/cv.json` |

Nếu tài liệu là trang giới thiệu mà người dùng lại nói "thêm bài viết", **hỏi
lại** — hai việc này khác hẳn nhau.

### 3. Dựng file

Frontmatter cho bài blog:

```yaml
---
title: Cách phân biệt 은/는 và 이/가      # đúng tên trong tài liệu
date: 2026-09-04
category: TOPIK                          # TOPIK | Ngữ pháp | …
tags: Ngữ pháp, Trợ từ                   # chọn trong bộ thẻ dưới đây
image: /assets/banner/<slug>.jpg
imageAlt: Banner bài viết — <title>
summary: <một câu cắt từ chính tài liệu gốc>
---
```

`date` chưa biết thì hỏi, đừng lấy ngày hôm nay.

**Bộ thẻ đang dùng** — chọn trong đây, đừng đặt thẻ mới đồng nghĩa với thẻ cũ
("Đọc hiểu" khi đã có "Luyện đọc"). Cần thẻ thật sự mới thì hỏi trước:

| Nhóm | Thẻ |
| --- | --- |
| Câu hỏi trong đề | `Câu 51` `Câu 52` `Câu 53` `Câu 54` |
| Kỹ năng | `Luyện nghe` `Luyện đọc` `Luyện viết` |
| Chủ đề | `Từ vựng` `Ngữ pháp` `Trợ từ` |
| Loại bài | `Kinh nghiệm` |

Thẻ chỉ hiện lên trang Tài liệu khi đã có ít nhất một bài mang thẻ đó.

### 4. Giữ định dạng

`**đậm**`, `*nghiêng*`, `==vàng==`, `==xanh: …==`, `==tim: …==`, `==la: …==`,
`<br>` trong ô bảng. Xem bảng đầy đủ trong `CLAUDE.md`.

`*nghiêng*` không lồng được `**đậm**` bên trong — chỗ nào tài liệu vừa nghiêng
vừa đậm thì giữ đậm, bỏ nghiêng.

Bỏ qua vệt highlight lẻ trên một dấu `?` hay một chữ `N` — đó là vết gõ nhầm,
không phải ý đồ.

### 5. Banner và dựng

```bash
python3 scripts/tao-banner.py    # dựng lại banner cho mọi bài, theo mẫu chung
npm run build
```

Banner dùng chung một mẫu: nền chữ ký "Queenie" mờ, chữ hồng in hoa ở giữa,
lấy nguyên văn từ `title`. Không rút gọn tiêu đề cho banner, không tự
thiết kế banner khác.

### 6. Kiểm lại trước khi báo xong

- [ ] Chạy `--dinh-dang` và soi lại từng dòng: chỗ nhấn nào cũng có trong bài?
- [ ] `grep -c '\*\*\|==' dist/blog/<slug>.html` — không còn dấu Markdown lọt ra
- [ ] Mở trang bằng trình duyệt, xem thật bằng mắt
- [ ] Đọc lại bài, mọi câu đều tìm được trong tài liệu gốc?

### 7. Đăng

`git push origin source` — GitHub Actions tự dựng và cập nhật web sau ~1 phút.

## Cờ đỏ — dừng lại

Nghĩ đến những câu này nghĩa là đang sắp tự viết chữ:

- "Thêm câu dẫn cho mượt"
- "Đoạn này cụt quá, viết thêm một ý"
- "Tóm tắt lại cho gọn"
- "Tài liệu thiếu phần kết, thêm một câu chốt"
- "Bảng này nên có thêm cột giải thích"
- "Highlight nhìn rối, bỏ đi cho sạch"

| Lý do tự bào chữa | Sự thật |
| --- | --- |
| "Chỉ một câu chuyển ý thôi" | Một câu cũng là chữ không phải của tác giả. |
| "Bài đọc sẽ hay hơn" | Hay theo giọng mình, không phải giọng người dạy. |
| "summary phải viết mới được" | Cắt một câu có sẵn trong bài. |
| "In đậm/highlight là chuyện nhỏ" | Trong bài ngữ pháp, màu chính là nội dung dạy. |
| "Bảng đã tách cột rồi, khỏi in đậm" | Cứ hỏi trước khi bỏ, đừng tự quyết. |
