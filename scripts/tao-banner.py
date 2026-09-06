#!/usr/bin/env python3
"""Tạo ảnh banner cho từng bài viết.

Nền chỉ có duy nhất chữ ký "Queenie" (scripts/nen-banner.jpeg) làm hình mờ,
phía trên là tên bài viết in màu hồng. Không khung, không logo — banner càng
đơn giản thì càng dễ đọc khi thu nhỏ lại trên thẻ bài viết.

Chạy:  python3 scripts/tao-banner.py
Kết quả: assets/banner/<slug>.jpg cho mỗi bài trong content/blog/.

Chữ trên banner lấy từ phần đầu file .md, in hoa toàn bộ và giữ nguyên từng
chữ — không rút gọn, không viết lại. Tiêu đề dài thì script tự hạ cỡ chữ và
ngắt xuống dòng cho vừa khổ.

Mặc định banner dùng "title". Muốn banner ghi khác tiêu đề bài — thường là
khi tiêu đề quá dài, đọc trên thẻ bài viết bị bé — thì thêm "bannerTitle"
vào phần đầu file:

    title: Tổng kết dạng nghe TOPIK II
    bannerTitle: Dạng nghe TOPIK II

Chữ trong bannerTitle cũng là lời tác giả, không tự nghĩ ra.

Muốn tự chọn chỗ xuống dòng thì đặt <br> vào đúng chỗ đó:

    bannerTitle: Tổng kết<br>dạng nghe TOPIK II

Có <br> thì script ngắt đúng theo ý bạn, không tự xếp lại, và chỉ hạ cỡ chữ
cho tới khi dòng dài nhất vừa khổ.
"""

import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
NEN_GOC = ROOT / "scripts/nen-banner.jpeg"
BLOG = ROOT / "content/blog"
XUAT = ROOT / "assets/banner"
FONTS = ROOT / "scripts/fonts"

# Font tiếng Việt của trang web; chữ Hàn rơi sang Noto Sans CJK.
FONT_DAM = FONTS / "BeVietnamPro-Bold.ttf"
FONT_HAN_DAM = ("/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc", 1)

W, H = 1600, 900          # khổ 16:9, khớp với .post-hero trên web
CO_LON_NHAT = 112         # cỡ chữ lớn nhất cho phép
CO_NHO_NHAT = 40          # cỡ chữ nhỏ nhất cho phép
TOI_DA_DONG = 2           # tiêu đề dài mấy cũng chỉ được xuống 2 dòng
NEN = (255, 252, 253)     # --paper
CHU = (59, 48, 52)        # --ink, nâu sẫm — cùng màu chữ tiêu đề trên web
MO = 0.16                 # độ đậm hình mờ: 0 là nền trơn, 1 là ảnh gốc
GIAN = 0.04               # giãn chữ, tính theo cỡ chữ; chữ in hoa cần thở

# Vùng chữ ký trong ảnh gốc, đã cắt bỏ lề trắng.
CHU_KY = (80, 165, 1452, 837)


# --- Chữ pha tiếng Việt + tiếng Hàn ----------------------------------------

def _la_han(ch):
    return "ᄀ" <= ch <= "ᇿ" or "㄰" <= ch <= "㆏" or "가" <= ch <= "힯"


def cat_doan(text):
    """Tách chuỗi thành các đoạn cùng hệ chữ để chọn đúng font."""
    doan = []
    for ch in text:
        loai = "han" if _la_han(ch) else "latin"
        if doan and doan[-1][0] == loai:
            doan[-1][1] += ch
        else:
            doan.append([loai, ch])
    return doan


def bo_font(size):
    duong, idx = FONT_HAN_DAM
    return {
        "latin": ImageFont.truetype(str(FONT_DAM), size),
        "han": ImageFont.truetype(duong, size, index=idx),
    }


def do_rong(draw, text, fonts, gian=0):
    rong = sum(draw.textlength(t, font=fonts[loai]) for loai, t in cat_doan(text))
    return rong + gian * max(len(text) - 1, 0)


def ve_dong(draw, x, day, text, fonts, mau, gian=0):
    """Vẽ một dòng trên cùng một đường chân chữ, tự đổi font khi gặp chữ Hàn.

    Neo "ls" là đường chân chữ (baseline). Trước đây neo theo đỉnh ("lt") nên
    chữ Hàn tụt xuống, vì Noto Sans CJK cao hơn Be Vietnam Pro 16% — chính là
    chỗ làm 듣기 lệch khỏi hàng chữ Việt.
    """
    for loai, t in cat_doan(text):
        for ch in t:
            draw.text((x, day), ch, font=fonts[loai], fill=mau, anchor="ls")
            x += draw.textlength(ch, font=fonts[loai]) + gian


def xuong_dong(draw, text, fonts, rong_toi_da, gian=0):
    # Có <br> nghĩa là tác giả tự chọn chỗ ngắt — cứ theo đúng vậy, không tự
    # xếp lại. Cỡ chữ vẫn tự hạ cho tới khi dòng dài nhất vừa khổ.
    if "<BR>" in text.upper():
        return [d.strip() for d in re.split(r"(?i)<br\s*/?>", text) if d.strip()]

    dong, hien_tai = [], ""
    for tu in text.split():
        thu = f"{hien_tai} {tu}".strip()
        if hien_tai and do_rong(draw, thu, fonts, gian) > rong_toi_da:
            dong.append(hien_tai)
            hien_tai = tu
        else:
            hien_tai = thu
    if hien_tai:
        dong.append(hien_tai)

    # Tiêu đề hai dòng: chọn chỗ ngắt sao cho hai dòng cân nhau, tránh kiểu
    # dòng trên dài hết cỡ còn dòng dưới trơ trọi hai chữ.
    if len(dong) == 2:
        tu = text.split()
        tot = None
        for k in range(1, len(tu)):
            t, d = " ".join(tu[:k]), " ".join(tu[k:])
            rt, rd = do_rong(draw, t, fonts, gian), do_rong(draw, d, fonts, gian)
            if max(rt, rd) > rong_toi_da:
                continue
            if tot is None or abs(rt - rd) < tot[0]:
                tot = (abs(rt - rd), [t, d])
        if tot:
            dong = tot[1]
    return dong


# --- Dựng nền ---------------------------------------------------------------

def dung_nen(goc):
    """Chữ ký "Queenie" phủ gần kín khổ 16:9 rồi làm nhạt thành hình mờ."""
    chu_ky = goc.crop(CHU_KY)

    rong = round(W * 0.86)
    cao = round(chu_ky.height * rong / chu_ky.width)
    chu_ky = chu_ky.resize((rong, cao), Image.LANCZOS)

    nen = Image.new("RGB", (W, H), NEN)
    nen.paste(chu_ky, ((W - rong) // 2, (H - cao) // 2))

    # Pha với màu giấy để chữ ký lùi hẳn ra sau, chữ phía trên đọc rõ.
    return Image.blend(Image.new("RGB", (W, H), NEN), nen, MO)


def co_chu_vua(draw, tieu_de, toi_da_dong=TOI_DA_DONG):
    """Cỡ chữ lớn nhất mà tiêu đề này còn vừa trong toi_da_dong dòng."""
    rong_toi_da = W - 260
    tieu_de = tieu_de.upper()
    tu_ngat = bool(re.search(r"(?i)<br\s*/?>", tieu_de))

    for size in range(CO_LON_NHAT, CO_NHO_NHAT - 1, -2):
        fonts, gian = bo_font(size), size * GIAN
        dong = xuong_dong(draw, tieu_de, fonts, rong_toi_da, gian)
        vua_ngang = max(do_rong(draw, d, fonts, gian) for d in dong) <= rong_toi_da
        # Tác giả tự ngắt bằng <br> thì tôn trọng số dòng họ chọn.
        if vua_ngang and (tu_ngat or len(dong) <= toi_da_dong):
            return size
    return CO_NHO_NHAT


def ve_chu(anh, tieu_de, size=None):
    draw = ImageDraw.Draw(anh)
    rong_toi_da = W - 260
    tieu_de = tieu_de.upper()  # banner luôn viết hoa toàn bộ

    if size is None:
        size = co_chu_vua(draw, tieu_de)
    fonts, gian = bo_font(size), size * GIAN
    dong = xuong_dong(draw, tieu_de, fonts, rong_toi_da, gian)

    cao_dong = round(size * 1.24)
    # Đường chân chữ lấy theo font tiếng Việt, để chữ Hàn xen giữa cũng đứng
    # đúng hàng chứ không tụt xuống theo chiều cao riêng của font Hàn.
    len_tren = fonts["latin"].getmetrics()[0]
    day = (H - len(dong) * cao_dong) // 2 + len_tren

    for d in dong:
        rong = do_rong(draw, d, fonts, gian)
        # Chữ cuối không có khoảng giãn theo sau nên trừ ra khi căn giữa.
        ve_dong(draw, (W - rong + gian) / 2, day, d, fonts, CHU, gian)
        day += cao_dong
    return anh


# --- Đọc phần đầu file .md --------------------------------------------------

def doc_frontmatter(duong):
    raw = duong.read_text(encoding="utf-8")
    m = re.match(r"^---\n([\s\S]*?)\n---\n", raw)
    if not m:
        return {}
    data = {}
    for dong in m.group(1).split("\n"):
        if ":" in dong and not dong.startswith(" "):
            k, v = dong.split(":", 1)
            data[k.strip()] = v.strip().strip('"').strip("'")
    return data


def main():
    if not NEN_GOC.exists():
        sys.exit(f"Không tìm thấy ảnh nền: {NEN_GOC}")

    goc = Image.open(NEN_GOC).convert("RGB")
    XUAT.mkdir(parents=True, exist_ok=True)

    files = sorted(p for p in BLOG.glob("*.md") if not p.name.startswith("_"))
    if not files:
        sys.exit("Chưa có bài viết nào trong content/blog/.")

    # Gom chữ của mọi banner trước, để chọn một cỡ chữ chung.
    bai = []
    for f in files:
        fm = doc_frontmatter(f)
        if not fm.get("title"):
            print(f"  ! bỏ qua {f.name}: thiếu title")
            continue
        slug = fm.get("slug") or re.sub(r"^\d{4}-\d{2}-\d{2}-", "", f.stem)
        # bannerTitle cho phép banner ghi khác tiêu đề bài; không có thì dùng title
        chu = fm.get("bannerTitle") or fm["title"]
        bai.append((slug, chu, bool(fm.get("bannerTitle"))))

    # Cỡ chữ chung: bài nào cũng phải vừa, nên lấy cỡ của bài chật nhất.
    # Nhờ vậy mọi banner trên site có chữ to bằng nhau.
    do = ImageDraw.Draw(Image.new("RGB", (W, H)))
    moi_co = {slug: co_chu_vua(do, chu) for slug, chu, _ in bai}
    co_chung = min(moi_co.values())
    chat_nhat = min(moi_co, key=moi_co.get)
    print(f"  Cỡ chữ chung: {co_chung}px (bài chật nhất: {chat_nhat})\n")

    for slug, chu, rieng in bai:
        anh = ve_chu(dung_nen(goc), chu, co_chung)
        ra = XUAT / f"{slug}.jpg"
        anh.save(ra, "JPEG", quality=88, optimize=True, progressive=True)
        print(f"  {ra.relative_to(ROOT)}  ·  {chu}{' (bannerTitle)' if rieng else ''}")


if __name__ == "__main__":
    main()
