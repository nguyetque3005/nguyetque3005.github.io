# Tiếng Hàn cùng Queenie

Trang cá nhân của Nguyễn Hồng Nguyệt Quế (Queenie) — Thạc sĩ Biên–Phiên dịch
Hàn–Việt. Website tĩnh, không framework: `build.mjs` đọc `content/` rồi dựng ra
`dist/`.

## Luật quan trọng nhất: không tự viết chữ thay tác giả

Mọi chữ hiện trên website đều là lời của một người dạy học có thật. Chữ bịa ra
là sai chuyên môn và sai giọng của họ.

**Tuyệt đối không tự tạo ra text.** Khi chuyển tài liệu của Queenie (Google
Docs, PDF) lên web:

- Không viết đoạn mở đầu, câu chuyển ý, câu kết, lời dẫn — kể cả một câu.
- Không thêm cột "ý nghĩa", không thêm ví dụ, không diễn giải rộng ra.
- Không tóm tắt lại bằng lời của mình. `summary` trong frontmatter cũng phải
  cắt từ chính câu chữ trong tài liệu gốc, vì nó hiện ở đầu bài và trên thẻ.
- Không sửa "cho hay hơn", không sửa chính tả trừ khi được yêu cầu.

Được phép: đổi cấu trúc (đoạn văn → bảng, danh sách), bỏ emoji trang trí trong
tiêu đề mục, đặt tiêu đề mục theo đúng chữ trong tài liệu.

Thiếu thông tin (chưa có tag, chưa có ngày đăng) thì hỏi, đừng đoán.

## Luật thứ hai: giữ đúng định dạng của tài liệu gốc

Chỗ nào tác giả in đậm, in nghiêng, bôi nền (highlight) hay dùng ngoặc kép cong
“…” thì bài đăng phải có đúng như vậy. Màu highlight cũng có ý nghĩa — ví dụ
bài 은/는 vs 이/가 dùng màu để phân biệt hai trợ từ; mất màu là mất ý đồ dạy học.

Bộ chuyển Markdown trong `src/lib/markdown.mjs` hiểu:

| Cú pháp | Kết quả |
| --- | --- |
| `**chữ**` | in đậm |
| `*chữ*` | in nghiêng (không lồng được `**` bên trong) |
| `==chữ==` | bôi nền vàng |
| `==xanh: chữ==` `==tim: chữ==` `==la: chữ==` | bôi nền xanh / tím / lá |
| `<br>` | xuống dòng trong ô bảng (thẻ HTML duy nhất được phép) |

Đăng bài mới hoặc sửa bài theo tài liệu: dùng skill `dang-bai-tu-google-docs`.

## Cách chạy

```bash
npm run build     # dựng ra dist/
npm run serve     # dựng rồi mở http://localhost:8000
npm run dev       # dựng lại mỗi khi sửa content/ hoặc src/
python3 scripts/tao-banner.py       # dựng lại banner cho mọi bài viết
```

## Cách đăng lên mạng

Hai nhánh:

- `source` — mã nguồn (`content/`, `src/`, `build.mjs`…). Đây là nhánh làm việc.
- `main` — chỉ chứa website đã dựng, GitHub Pages đọc nhánh này.

`git push origin source` là xong: GitHub Actions (`.github/workflows/deploy.yml`)
tự dựng và đẩy sang `main`, khoảng 1 phút sau web cập nhật. `npm run deploy` chỉ
dùng khi cần đẩy tay từ máy.

Không commit thư mục `dist/`.

## Bố cục thư mục

```
content/          nội dung — sửa ở đây là web đổi
  blog/           bài viết .md, đặt tên YYYY-MM-DD-slug.md
  site.json  story.json  cv.json  classes.json  testimonials.json
src/
  lib/markdown.mjs      bộ chuyển Markdown -> HTML tự viết
  templates/            mỗi trang một file
  styles/style.css      toàn bộ CSS, bảng màu ở :root
scripts/
  gdoc-sang-md.py       đọc Google Docs -> Markdown, giữ định dạng
  tao-banner.py         dựng banner cho bài viết
  deploy.sh             đẩy tay lên GitHub Pages
assets/banner/          banner đã dựng, có commit
private/                tài liệu riêng, không đăng
```

## Quy ước viết mã

Chú thích và tên biến trong `scripts/` viết bằng tiếng Việt không dấu hoặc có
dấu, theo đúng lối các file đang có. Không thêm thư viện ngoài — cả website chỉ
chạy bằng Node và Python chuẩn (riêng `tao-banner.py` cần Pillow).
