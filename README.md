# Tiếng Hàn cùng Queenie

Personal website for **Nguyễn Hồng Nguyệt Quế (Queenie)** — MA in Korean–Vietnamese
Interpreting & Translation, TOPIK 6급.

**Live: <https://nguyetque3005.github.io>**

## Run locally

Needs [Node.js](https://nodejs.org) 18+.

```bash
npm run serve             # build + open http://localhost:8000
PORT=8123 npm run serve   # if 8000 is busy
```

## Đăng website

Nhánh `source` giữ mã nguồn, nhánh `main` chứa website đã dựng (GitHub Pages đọc nhánh này).

```bash
git add -A && git commit -m "..." && git push    # GitHub tự dựng và đăng, khoảng 1 phút
npm run deploy                                   # đăng ngay từ máy, khi cần gấp
```
