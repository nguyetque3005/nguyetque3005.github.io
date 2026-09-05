#!/usr/bin/env python3
"""Đọc một Google Docs và đổi sang Markdown, giữ in đậm / in nghiêng / bôi nền.

Google Docs không xuất Markdown, nhưng bản xuất HTML có đủ thông tin: mỗi đoạn
chữ nằm trong <span class="cNN">, và bảng <style> ở đầu file cho biết class đó
đậm hay nhạt, nền màu gì. Script đọc ngược bảng đó rồi dịch sang Markdown.

Chạy:
    python3 scripts/gdoc-sang-md.py <link Google Docs hoặc file .html>
    python3 scripts/gdoc-sang-md.py <link> --dinh-dang

  (mặc định)     in ra Markdown thô, còn phải sửa tay cho gọn
  --dinh-dang    liệt kê mọi chỗ in đậm / in nghiêng / bôi nền trong tài liệu

Bước --dinh-dang là bước quan trọng nhất: sau khi dựng xong bài .md, đối chiếu
danh sách này với bài viết để chắc chắn không rơi mất chỗ nhấn nào của tác giả.

Màu nền được dịch theo bảng màu tác giả hay dùng:
    #fff2cc vàng -> ==chữ==        #cfe2f3 xanh -> ==xanh: chữ==
    #d9d2e9 tím  -> ==tim: chữ==   #d9ead3 lá   -> ==la: chữ==
Màu lạ cũng thành ==chữ== (vàng) — xem lại rồi chỉnh tay nếu cần.
"""

import re
import sys
import urllib.request
from html.parser import HTMLParser

# Màu nền trong Google Docs -> tên màu trong cú pháp ==...== của website
MAU = {
    "#fff2cc": "",       # vàng, mặc định
    "#cfe2f3": "xanh: ",
    "#d9d2e9": "tim: ",
    "#d9ead3": "la: ",
}
# Nền trắng/đen không phải là bôi nền, chỉ là màu giấy
NEN_KHONG_TINH = {"#ffffff", "#000000"}

INLINE = ("span", "a", "b", "strong", "i", "em")
KHOI = ("p", "h1", "h2", "h3", "h4", "h5", "h6", "li")


def tai_ve(nguon):
    """Nhận link Google Docs hoặc đường dẫn file, trả về HTML."""
    m = re.search(r"/document/d/([a-zA-Z0-9_-]+)", nguon)
    if m:
        url = f"https://docs.google.com/document/d/{m.group(1)}/export?format=html"
        with urllib.request.urlopen(url) as r:
            return r.read().decode("utf-8", "replace")
    if nguon.startswith("http"):
        with urllib.request.urlopen(nguon) as r:
            return r.read().decode("utf-8", "replace")
    return open(nguon, encoding="utf-8").read()


def bang_style(src):
    """Gom mọi định nghĩa .cNN{...} trong các thẻ <style>."""
    css = {}
    for block in re.findall(r"<style[^>]*>(.*?)</style>", src, re.S):
        for m in re.finditer(r"\.(c\d+)\s*\{([^}]*)\}", block):
            css[m.group(1)] = m.group(2)
    return css


def doc_style(css, attrs):
    d = dict(attrs)
    gop = "".join(css.get(c, "") + ";" for c in (d.get("class") or "").split())
    return gop + d.get("style", "")


def dinh_dang(style):
    dam = bool(re.search(r"font-weight:\s*(700|800|900|bold)", style))
    nghieng = bool(re.search(r"font-style:\s*italic", style))
    nen = re.search(r"background-color:\s*(#[0-9a-fA-F]{6})", style)
    mau = nen.group(1).lower() if nen else None
    if mau in NEN_KHONG_TINH:
        mau = None
    return dam, nghieng, mau


class DocParser(HTMLParser):
    """Duyệt HTML, gom từng khối văn bản kèm dấu **, *, == của Markdown."""

    def __init__(self, css):
        super().__init__(convert_charrefs=True)
        self.css = css
        self.khoi = []          # [(loai, noi_dung, phu)] đã dựng xong
        self.the_mo = []
        self.dem = []           # ngăn xếp định dạng đang mở
        self.buf = []
        self.loai = None
        self.danh_sach = []
        self.bang = self.hang = self.o = None
        self.runs = []          # cho chế độ --dinh-dang

    # --- gom chữ ---------------------------------------------------------
    def _dich(self):
        return self.o if self.o is not None else self.buf

    def handle_data(self, data):
        if self.loai is None and self.o is None:
            return
        self._dich().append(data)

    def handle_starttag(self, tag, attrs):
        style = doc_style(self.css, attrs)
        if tag in KHOI:
            self.dong_khoi()
            self.loai = tag
        elif tag in ("ul", "ol"):
            self.dong_khoi()
            self.danh_sach.append(tag)
        elif tag == "table":
            self.dong_khoi()
            self.bang = []
        elif tag == "tr":
            self.hang = []
        elif tag in ("td", "th"):
            self.o = []
        elif tag in INLINE:
            dam, nghieng, mau = dinh_dang(style)
            if tag in ("b", "strong"):
                dam = True
            if tag in ("i", "em"):
                nghieng = True
            self.dem.append({
                "dam": dam, "nghieng": nghieng, "mau": mau,
                "href": dict(attrs).get("href") if tag == "a" else None,
                "tu": len(self._dich()),
            })
            self.the_mo.append(tag)
        elif tag == "br":
            self._dich().append("<br>")

    def handle_endtag(self, tag):
        if tag in INLINE:
            if not self.the_mo or self.the_mo[-1] != tag:
                return
            self.the_mo.pop()
            f = self.dem.pop()
            dich = self._dich()
            phan = "".join(dich[f["tu"]:])
            del dich[f["tu"]:]
            dich.append(self.boc(phan, f))
        elif tag in KHOI:
            self.dong_khoi()
        elif tag in ("ul", "ol"):
            self.dong_khoi()
            if self.danh_sach:
                self.danh_sach.pop()
        elif tag in ("td", "th"):
            if self.hang is not None and self.o is not None:
                self.hang.append(gon("".join(self.o)))
            self.o = None
        elif tag == "tr":
            if self.bang is not None and self.hang is not None:
                self.bang.append(self.hang)
            self.hang = None
        elif tag == "table":
            if self.bang:
                self.khoi.append(("bang", self.bang, None))
            self.bang = None

    def boc(self, phan, f):
        """Bọc một đoạn chữ bằng dấu Markdown tương ứng."""
        if not phan.strip():
            return phan
        dau = re.match(r"^\s*", phan).group(0)
        cuoi = re.search(r"\s*$", phan).group(0)
        loi = phan[len(dau):len(phan) - len(cuoi) or None]
        if f["dam"] or f["nghieng"] or f["mau"]:
            self.runs.append((
                "đậm" if f["dam"] else "", "nghiêng" if f["nghieng"] else "",
                f["mau"] or "", re.sub(r"\s+", " ", loi),
            ))
        if f["href"]:
            loi = f'[{loi}]({f["href"]})'
        if f["mau"]:
            loi = f'=={MAU.get(f["mau"], "")}{loi}=='
        if f["dam"]:
            loi = f"**{loi}**"
        if f["nghieng"]:
            loi = f"*{loi}*"
        return dau + loi + cuoi

    def dong_khoi(self):
        if self.loai is None:
            return
        chu = gon("".join(self.buf))
        if chu:
            if self.loai == "li":
                self.khoi.append(("li", chu, self.danh_sach[-1] if self.danh_sach else "ul"))
            else:
                self.khoi.append((self.loai, chu, None))
        self.buf = []
        self.loai = None


def gon(s):
    s = s.replace("\xa0", " ").replace("﻿", "")
    s = re.sub(r"\*\*\s*\*\*", "", s)
    s = re.sub(r"==\s*==", "", s)
    return re.sub(r"[ \t]+", " ", s).strip()


def noi_lien(s):
    """Gộp các đoạn nhấn liền nhau: **a** **b** -> **a b**."""
    for _ in range(4):
        s = re.sub(r"\*\*([^*]*?)\*\*(\s*)\*\*", lambda m: f"**{m.group(1)}{m.group(2)}", s)
        s = re.sub(r"==([^=]*?)==(\s*)==", lambda m: f"=={m.group(1)}{m.group(2)}", s)
    return s


def sang_markdown(p):
    ra, vua_li = [], False
    for loai, chu, phu in p.khoi:
        if loai == "bang":
            hang = [h for h in chu if any(h)]
            if not hang:
                continue
            dau = hang[0]
            ra += ["", "| " + " | ".join(dau) + " |",
                   "| " + " | ".join(["---"] * len(dau)) + " |"]
            for h in hang[1:]:
                h = (h + [""] * len(dau))[:len(dau)]
                ra.append("| " + " | ".join(h) + " |")
            ra.append("")
            vua_li = False
            continue
        chu = noi_lien(chu)
        if loai == "li":
            ra.append(("- " if phu == "ul" else "1. ") + chu)
            vua_li = True
            continue
        if vua_li:
            ra.append("")
            vua_li = False
        if loai.startswith("h"):
            ra += ["", "#" * int(loai[1]) + " " + chu.strip("*"), ""]
        else:
            ra += [chu, ""]
    return re.sub(r"\n{3,}", "\n\n", "\n".join(ra)).strip() + "\n"


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    src = tai_ve(sys.argv[1])
    p = DocParser(bang_style(src))
    p.feed(src)
    p.dong_khoi()

    if "--dinh-dang" in sys.argv:
        print(f"{len(p.runs)} chỗ có định dạng:\n")
        for dam, nghieng, mau, chu in p.runs:
            ten = {"": "", "xanh: ": "xanh", "tim: ": "tím", "la: ": "lá"}
            nen = ten.get(MAU[mau], "vàng") if mau in MAU else ("nền " + mau if mau else "")
            nhan = " ".join(x for x in (dam, nghieng, nen) if x)
            print(f"  [{nhan or '?'}] {chu}")
    else:
        sys.stdout.write(sang_markdown(p))


if __name__ == "__main__":
    main()
