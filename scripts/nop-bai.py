#!/usr/bin/env python3
"""Đọc một Google Docs rồi dựng thành bài viết, có kiểm tra thông tin.

Khác với gdoc-sang-md.py (chỉ in Markdown ra màn hình cho người sửa tay),
script này chạy trọn khâu: kiểm tra thông tin -> dựng content/blog/<ngày>-<slug>.md.
Thiếu hoặc sai thông tin thì không dựng gì cả, chỉ in ra danh sách chỗ phải sửa.

Thông tin bài (tiêu đề, ngày, chuyên mục, thẻ…) lấy từ phiếu Issues trên
GitHub — xem --phieu. Tài liệu Google Docs cứ để nguyên như tác giả vẫn viết.

Cách thứ hai, dùng khi không qua phiếu: ghi sẵn khối thông tin ở đầu tài liệu,
mỗi dòng một mục, kết thúc bằng dòng chỉ có dấu gạch:

    TIÊU ĐỀ: Cách phân biệt 은/는 và 이/가
    NGÀY: 22/09/2026
    CHUYÊN MỤC: Ngữ pháp
    THẺ: Ngữ pháp, Trợ từ
    BANNER: Phân biệt<br>은/는 và 이/가
    ---

    (nội dung bài bắt đầu từ đây)

BANNER, TÓM TẮT, SLUG có thể bỏ trống. Chữ có dấu hay không dấu, in hoa hay
in thường, in đậm hay bôi nền đều nhận.

Điền cả hai chỗ thì phiếu thắng.

Chạy:
    python3 scripts/nop-bai.py "<link Google Docs>"
    python3 scripts/nop-bai.py --phieu=<file chứa thân phiếu Issues>
    python3 scripts/nop-bai.py --tu-kiem      # tự kiểm tra script
"""

import importlib.util
import re
import sys
import unicodedata
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BLOG = ROOT / "content/blog"

# Dùng lại bộ chuyển đã có, tên file có dấu gạch nên phải nạp bằng tay.
_spec = importlib.util.spec_from_file_location("gdoc", ROOT / "scripts/gdoc-sang-md.py")
gdoc = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(gdoc)

# Tên mục (trong tài liệu hoặc trên phiếu) -> tên trường trong frontmatter
KHOA = {
    "tieu de": "title",
    "tieu de bai viet": "title",
    "ngay dang": "date",
    "chu tren banner": "bannerTitle",
    "link google docs": "link",
    "ngay": "date",
    "chuyen muc": "category",
    "the": "tags",
    "tom tat": "summary",
    "banner": "bannerTitle",
    "slug": "slug",
}
BAT_BUOC = ("title", "date", "category", "tags")
# Tên mục in ra khi báo lỗi — viết đúng như tác giả gõ trong tài liệu.
TEN_HIEN = {"title": "TIÊU ĐỀ", "date": "NGÀY", "category": "CHUYÊN MỤC", "tags": "THẺ"}

def khong_dau(s):
    """So khớp tên mục và tên thẻ mà không phụ thuộc dấu, hoa thường."""
    s = unicodedata.normalize("NFD", str(s)).replace("đ", "d").replace("Đ", "D")
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", s).strip().lower()


def lam_slug(s):
    """Giống slugify trong src/lib/markdown.mjs — giữ cả chữ Hàn."""
    s = khong_dau(s)
    s = re.sub(r"[^a-z0-9가-힣]+", "-", s)
    return s.strip("-")[:80]


def doc_phieu(than):
    """Đọc thân phiếu Issues: mỗi mục là một dòng '### Nhãn' rồi tới giá trị."""
    ra, ten = {}, None
    for d in than.replace("\r", "").split("\n"):
        if d.startswith("### "):
            ten = KHOA.get(khong_dau(d[4:]))
            continue
        gt = d.strip()
        if not ten or not gt or gt == "_No response_":
            continue
        if gt.startswith("- ["):                      # ô tick, chỉ lấy ô đã tick
            if gt[3:4].lower() == "x":
                ra[ten] = ", ".join(filter(None, [ra.get(ten), gt[6:].strip()]))
            continue
        ra[ten] = (ra[ten] + " " + gt) if ten in ra else gt
    return ra


def bo_dong_tieu_de(than, title):
    """Dòng đầu tài liệu thường là chính tên bài — đã có ở frontmatter rồi."""
    for i, d in enumerate(than.split("\n")):
        if not d.strip():
            continue
        if title and khong_dau(re.sub(r"[*#=]", "", d)) == khong_dau(title):
            return "\n".join(than.split("\n")[i + 1:]).strip()
        break
    return than


def tach_khoi(md):
    """Cắt khối thông tin ở đầu bài. Trả về (dict thông tin, phần nội dung)."""
    dong = md.split("\n")
    khoa, het = {}, None
    for i, d in enumerate(dong):
        tho = re.sub(r"[*=]+", "", d).replace("\xa0", " ").strip()
        if not tho:
            continue
        # Dòng toàn dấu gạch là hết khối (Docs hay tự đổi --- thành một dấu —).
        if re.fullmatch(r"[-–—_]+", tho):
            het = i
            break
        ten, _, gia_tri = tho.partition(":")
        truong = KHOA.get(khong_dau(ten))
        if not truong:
            break
        khoa[truong] = gia_tri.strip()
    # Không có khối nào thì cả tài liệu là nội dung.
    than = "\n".join(dong[het + 1:]).strip() if het is not None else md.strip()
    return (khoa, than) if het is not None else ({}, than)


def doc_the_va_muc():
    """Bộ thẻ và chuyên mục đang dùng, đọc từ chính các bài đã đăng."""
    the, muc = {}, {}
    for f in BLOG.glob("*.md"):
        dau = f.read_text(encoding="utf-8").split("---")[1] if "---" in f.read_text(encoding="utf-8") else ""
        for d in dau.split("\n"):
            ten, _, gt = d.partition(":")
            if ten.strip() == "tags":
                for t in gt.split(","):
                    if t.strip():
                        the[khong_dau(t)] = t.strip()
            elif ten.strip() == "category" and gt.strip():
                muc[khong_dau(gt)] = gt.strip()
    return the, muc


def kiem_tra(khoa, than, co_anh):
    """Trả về (danh sách lỗi, thông tin đã chuẩn hoá)."""
    loi, sach = [], {}
    for truong in BAT_BUOC:
        if not khoa.get(truong):
            loi.append(f"Thiếu mục {TEN_HIEN[truong]}.")

    if khoa.get("date"):
        for dinh_dang in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y"):
            try:
                sach["date"] = datetime.strptime(khoa["date"], dinh_dang).strftime("%Y-%m-%d")
                break
            except ValueError:
                continue
        else:
            loi.append(f"NGÀY không đọc được: “{khoa['date']}”. Viết dạng 22/09/2026.")

    the_co, muc_co = doc_the_va_muc()
    if khoa.get("category"):
        ten = muc_co.get(khong_dau(khoa["category"]))
        if ten:
            sach["category"] = ten
        else:
            loi.append(f"CHUYÊN MỤC “{khoa['category']}” chưa có. Đang dùng: "
                       + ", ".join(sorted(muc_co.values())) + ".")

    if khoa.get("tags"):
        nhan, la = [], []
        for t in khoa["tags"].split(","):
            if not t.strip():
                continue
            (nhan if khong_dau(t) in the_co else la).append(the_co.get(khong_dau(t), t.strip()))
        if la:
            loi.append("Thẻ chưa có: " + ", ".join(la) + ".\nBộ thẻ đang dùng: "
                       + ", ".join(sorted(the_co.values())) + ".")
        sach["tags"] = ", ".join(nhan)

    if not than.strip():
        loi.append("Sau dòng gạch không có nội dung nào.")
    if co_anh:
        loi.append("Tài liệu có ảnh. Luồng tự động chưa xử lý được ảnh — "
                   "phần này cần đăng tay.")

    sach["title"] = khoa.get("title", "")
    sach["slug"] = khoa.get("slug") or lam_slug(sach["title"])
    for t in ("summary", "bannerTitle"):
        if khoa.get(t):
            sach[t] = khoa[t]
    return loi, sach


def dung_bai(sach, than):
    """Ghi file bài viết, trả về đường dẫn."""
    fm = [f"title: {sach['title']}", f"date: {sach['date']}",
          f"category: {sach['category']}", f"tags: {sach['tags']}",
          f"image: /assets/banner/{sach['slug']}.jpg",
          f"imageAlt: Banner bài viết — {sach['title']}"]
    for t in ("summary", "bannerTitle"):
        if sach.get(t):
            fm.append(f"{t}: {sach[t]}")

    ra = BLOG / f"{sach['date']}-{sach['slug']}.md"
    ra.write_text("---\n" + "\n".join(fm) + "\n---\n\n" + than.strip() + "\n",
                  encoding="utf-8")
    return ra


def tu_kiem():
    md = ("**TIÊU ĐỀ:** Bài thử\nNGAY: 22/09/2026\nCHUYÊN MỤC: topik\n"
          "THẺ: tu vung, Ngữ pháp\n—\n\nCâu **đậm** của tác giả.\n")
    khoa, than = tach_khoi(md)
    assert khoa["title"] == "Bài thử", khoa
    assert khoa["date"] == "22/09/2026", khoa
    assert than == "Câu **đậm** của tác giả.", repr(than)

    loi, sach = kiem_tra(khoa, than, co_anh=False)
    assert not loi, loi
    assert sach["date"] == "2026-09-22" and sach["category"] == "TOPIK", sach
    assert sach["tags"] == "Từ vựng, Ngữ pháp", sach   # giữ đúng chữ của bộ thẻ cũ
    assert sach["slug"] == "bai-thu", sach

    # Tài liệu không có khối nào: giữ nguyên toàn bộ làm nội dung.
    khoa, than = tach_khoi("# Bài thử\n\nCâu đầu.\n")
    assert khoa == {} and than == "# Bài thử\n\nCâu đầu.", (khoa, than)

    # Thông tin lấy từ phiếu Issues thay vì từ tài liệu.
    phieu = doc_phieu("""### Link Google Docs

https://docs.google.com/document/d/abc

### Tiêu đề bài viết

Bài thử

### Ngày đăng

22/09/2026

### Chuyên mục

TOPIK

### Thẻ

- [x] Từ vựng
- [ ] Câu 51
- [X] Ngữ pháp

### Chữ trên banner

_No response_
""")
    assert phieu == {"link": "https://docs.google.com/document/d/abc",
                     "title": "Bài thử", "date": "22/09/2026",
                     "category": "TOPIK", "tags": "Từ vựng, Ngữ pháp"}, phieu
    loi, sach = kiem_tra(phieu, than, co_anh=False)
    assert not loi, loi
    assert bo_dong_tieu_de(than, sach["title"]) == "Câu đầu.", than

    loi, _ = kiem_tra(*tach_khoi("TIÊU ĐỀ: X\n---\nnội dung"), co_anh=True)
    assert loi[:3] == ["Thiếu mục NGÀY.", "Thiếu mục CHUYÊN MỤC.", "Thiếu mục THẺ."], loi
    assert "ảnh" in loi[3], loi
    assert len(kiem_tra({}, "x", False)[0]) == 4   # trống trơn: thiếu cả bốn mục
    print("Tự kiểm tra: đạt.")


def main():
    if "--tu-kiem" in sys.argv:
        return tu_kiem()

    phieu = {}
    for a in sys.argv[1:]:
        if a.startswith("--phieu="):
            phieu = doc_phieu(Path(a[8:]).read_text(encoding="utf-8"))
    tu_do = [a for a in sys.argv[1:] if not a.startswith("--")]
    link = tu_do[0] if tu_do else phieu.get("link", "")
    if not link:
        sys.exit("Không thấy link Google Docs.")

    html = gdoc.tai_ve(link)
    p = gdoc.DocParser(gdoc.bang_style(html))
    p.feed(html)
    p.dong_khoi()
    khoa, than = tach_khoi(gdoc.sang_markdown(p))
    khoa.update({k: v for k, v in phieu.items() if v})   # phiếu thắng tài liệu

    loi, sach = kiem_tra(khoa, than, co_anh="<img" in html)
    than = bo_dong_tieu_de(than, sach.get("title"))
    if loi:
        print("Chưa đăng được. Sửa trong Google Docs rồi nộp lại:\n")
        for l in loi:
            print("  • " + l.replace("\n", "\n    "))
        sys.exit(1)

    print(dung_bai(sach, than).relative_to(ROOT))


if __name__ == "__main__":
    main()
