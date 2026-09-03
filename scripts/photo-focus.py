#!/usr/bin/env python3
"""Tính điểm lấy nét (`focus`) cho ảnh trong content/story.json.

Không chạy khi build — giống scripts/deploy.sh, đây là script chạy tay.
Khi thêm ảnh mới thì khai báo vùng mặt vào bảng FACES rồi chạy:

    python3 scripts/photo-focus.py

Script chỉ đọc assets/*.jpeg và in ra kết quả; không sửa file nào cả.
Chép giá trị in ra vào content/story.json, ví dụ:

    { "src": "/assets/shinhan-1.jpeg", "alt": "...", "caption": "...",
      "ratio": "portrait", "focus": "50% 38%" }

Cách tính: gộp tất cả khuôn mặt thành một vùng, rồi tìm `object-position`
sao cho vùng đó luôn nằm trọn trong khung, kể cả khi khung đổi tỉ lệ.
Nhờ vậy ảnh không bao giờ bị cắt mất mặt.

Bảng FACES lấy từ OpenCV rồi soát lại bằng mắt: đã bỏ người lạ phía sau và
mấy khuôn mặt in trên poster ở ảnh tình nguyện Seoul — máy nhận nhầm những
thứ đó là mặt người.
"""

from PIL import Image

# Vùng chứa mặt (x0, y0, x1, y1), toạ độ 0..1 so với ảnh gốc.
FACES = {
    'di-day-tieng-anh':   (0.40, 0.12, 0.60, 0.28),
    'hinh-tot-nghiep-dh': (0.43, 0.19, 0.55, 0.28),
    'shinhan-1':          (0.40, 0.34, 0.64, 0.48),
    'shinhan-2':          (0.05, 0.35, 0.93, 0.48),
    'shinhan-3':          (0.14, 0.21, 0.90, 0.34),
    'hsbc-1':             (0.13, 0.08, 0.95, 0.62),
    'hsbc-2':             (0.10, 0.53, 0.85, 0.61),
}

# Đặt mặt hơi cao hơn giữa khung — nhìn tự nhiên hơn là canh giữa đúng 50%.
THIRD = 0.42

# Dưới ngưỡng này coi như chiều đó không bị cắt; tránh việc chỉ hụt vài phần
# nghìn mà lại cho ra 0% hoặc 100% trông như lỗi.
NO_CROP = 0.99


def axis(lo, hi, visible):
    """Vị trí (0..1) cho một chiều, đảm bảo dải [lo, hi] nằm trong khung."""
    if visible >= NO_CROP:
        return 0.5
    centre = (lo + hi) / 2
    p = (centre - visible * THIRD) / (1 - visible)
    lo_p = max(0.0, (hi - visible) / (1 - visible))
    hi_p = min(1.0, lo / (1 - visible))
    if lo_p > hi_p:                      # dải mặt rộng hơn khung: đành canh giữa
        p = (centre - visible / 2) / (1 - visible)
    else:
        p = min(max(p, lo_p), hi_p)
    return min(max(p, 0.0), 1.0)


def focus(iw, ih, band, ratio):
    """`object-position` cho ảnh iw×ih đặt trong khung có tỉ lệ `ratio`."""
    scale = max(ratio / iw, 1 / ih)
    return (axis(band[0], band[2], ratio / (iw * scale)),
            axis(band[1], band[3], 1 / (ih * scale)))


if __name__ == '__main__':
    # Các khung mà ảnh có thể rơi vào, xem style.css
    boxes = {'4/3 mặc định': 4 / 3, '3/4 is-portrait': 3 / 4, '16/10 thumb': 1.6}
    for name, band in sorted(FACES.items()):
        iw, ih = Image.open(f'assets/{name}.jpeg').size
        portrait = iw / ih < 1
        px, py = focus(iw, ih, band, 3 / 4 if portrait else 4 / 3)
        print(f'{name:22s} {iw}x{ih}  '
              f'ratio={"portrait" if portrait else "—":9s} focus="{px:.0%} {py:.0%}"')
        for label, r in boxes.items():
            scale = max(r / iw, 1 / ih)
            vh = 1 / (ih * scale)
            top = focus(iw, ih, band, r)[1] * (1 - vh)
            ok = top <= band[1] + 1e-6 and top + vh >= band[3] - 1e-6
            print(f'    {label:16s} thấy y=[{top:.2f},{top + vh:.2f}]'
                  f'  mặt=[{band[1]:.2f},{band[3]:.2f}]  {"ok" if ok else "CẮT MẤT MẶT"}')
