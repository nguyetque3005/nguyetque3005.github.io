import { escapeHtml } from '../lib/markdown.mjs';

// Ảnh có sẵn phương án dự phòng: nếu file ảnh chưa có, JS sẽ thay bằng
// một khung giữ chỗ có nhãn, thay vì hiện biểu tượng ảnh vỡ.
//
// Mọi ảnh nằm trong .photo-frame — khung cao bằng nhau, nhờ vậy cả cột ảnh
// đọc thành một mạch đều đặn thay vì cao thấp lộn xộn.
//
// photo.ratio: bỏ trống = ảnh ngang, lấp đầy khung
//              "portrait" = ảnh dọc, cao bằng khung nhưng hẹp lại theo 3:4
// photo.fit:   "contain"  = giấy tờ, bằng cấp — hiện trọn, không cắt mất chữ
// photo.focus: điểm lấy nét khi ảnh bị cắt, ví dụ "50% 38%" — giữ khuôn mặt
//              trong khung thay vì cắt từ giữa. Bỏ trống là canh giữa.
//              Tính bằng: python3 scripts/photo-focus.py
export function figure(photo, className = '') {
  if (!photo || !photo.src) return '';
  const caption = photo.caption
    ? `<figcaption>${escapeHtml(photo.caption)}</figcaption>`
    : '';
  const ratio = photo.ratio === 'portrait' ? ' is-portrait' : '';
  const fit = photo.fit === 'contain' ? ' is-contain' : '';
  const focus = photo.focus ? ` style="object-position:${escapeHtml(photo.focus)}"` : '';
  return `<figure class="photo ${className}${ratio}${fit}">
            <span class="photo-frame">
              <img src="${photo.src}"${focus} alt="${escapeHtml(photo.alt || '')}" loading="lazy" data-fallback="${escapeHtml(photo.alt || 'Ảnh')}">
            </span>
            ${caption}
          </figure>`;
}

export function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export function postCard(post) {
  const thumb = post.image
    ? `<span class="post-thumb"><img src="${post.image}" alt="${escapeHtml(post.imageAlt || '')}" loading="lazy" data-fallback="${escapeHtml(post.title)}"></span>`
    : '<span class="post-thumb post-thumb-blank" aria-hidden="true"></span>';

  const tagAttr = (post.tags || []).length
    ? ` data-tags="${escapeHtml((post.tags || []).join('|'))}"`
    : '';

  return `          <a class="post-card reveal"${tagAttr} href="${post.url}">
            ${thumb}
            <span class="post-meta">
              <span class="post-category">${escapeHtml(post.category || 'Bài viết')}</span>
              <span class="post-date">${formatDate(post.date)}</span>
            </span>
          </a>`;
}

export function testimonialSection(testimonials) {
  const items = (testimonials && testimonials.items) || [];
  if (!items.length) return '';

  const cards = items
    .map(
      (t) => `          <figure class="quote reveal">
            <blockquote>${escapeHtml(t.quote)}</blockquote>
            <figcaption>
              <span class="quote-name">${escapeHtml(t.name)}</span>
              ${t.context ? `<span class="quote-context">${escapeHtml(t.context)}</span>` : ''}
            </figcaption>
          </figure>`
    )
    .join('\n');

  return `    <section class="testimonials">
      <div class="shell">
        <header class="section-head reveal">
          <h2>${escapeHtml(testimonials.title || 'Học viên nói gì')}</h2>
        </header>
        <div class="quote-grid">
${cards}
        </div>
      </div>
    </section>`;
}

export function pageHead({ eyebrow, title, lead, note }) {
  return `    <section class="page-head">
      <div class="shell reveal">
        ${eyebrow ? `<p class="eyebrow">${escapeHtml(eyebrow)}</p>` : ''}
        <h1>${escapeHtml(title)}</h1>
        ${lead ? `<p class="page-lead">${escapeHtml(lead)}</p>` : ''}
        ${note ? `<p class="page-note">${escapeHtml(note)}</p>` : ''}
      </div>
    </section>`;
}

// Icon SVG viết thẳng trong mã, không dùng thư viện ngoài.
// Nét vẽ theo currentColor nên đổi màu chữ là icon đổi theo.
const ICONS = {
  facebook:
    '<path d="M14 8.5V7c0-.8.2-1.2 1.3-1.2H17V3.1c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v1.7H8.6V11h2.5v7h3v-7h2.4l.4-2.5H14z"/>',
  tiktok:
    '<path d="M16.6 6.9a4.3 4.3 0 0 1-2.7-1.6 4.2 4.2 0 0 1-.8-2.3h-2.6v9.6a2 2 0 1 1-1.5-1.9V8a4.6 4.6 0 1 0 4.1 4.6V8.9c.9.6 2 1 3.1 1V6.9h.4z"/>',
  youtube:
    '<path d="M19.2 7.2a2 2 0 0 0-1.4-1.4C16.5 5.4 10 5.4 10 5.4s-6.5 0-7.8.4A2 2 0 0 0 .8 7.2C.4 8.5.4 11 .4 11s0 2.5.4 3.8a2 2 0 0 0 1.4 1.4c1.3.4 7.8.4 7.8.4s6.5 0 7.8-.4a2 2 0 0 0 1.4-1.4c.4-1.3.4-3.8.4-3.8s0-2.5-.4-3.8zM8.1 13.5V8.5l5 2.5-5 2.5z"/>',
  instagram:
    '<path d="M10 2.7c2.4 0 2.7 0 3.6.1.9 0 1.4.2 1.7.3.4.2.7.4 1 .7.3.3.5.6.7 1 .1.3.3.8.3 1.7 0 .9.1 1.2.1 3.5s0 2.6-.1 3.5c0 .9-.2 1.4-.3 1.7-.2.4-.4.7-.7 1-.3.3-.6.5-1 .7-.3.1-.8.3-1.7.3-.9 0-1.2.1-3.6.1s-2.7 0-3.6-.1c-.9 0-1.4-.2-1.7-.3a2.8 2.8 0 0 1-1-.7 2.8 2.8 0 0 1-.7-1c-.1-.3-.3-.8-.3-1.7 0-.9-.1-1.2-.1-3.5s0-2.6.1-3.5c0-.9.2-1.4.3-1.7.2-.4.4-.7.7-1 .3-.3.6-.5 1-.7.3-.1.8-.3 1.7-.3.9 0 1.2-.1 3.6-.1m0 3.7a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2m0 5.9a2.3 2.3 0 1 1 0-4.6 2.3 2.3 0 0 1 0 4.6m4.6-6a.85.85 0 1 1-1.7 0 .85.85 0 0 1 1.7 0"/>',
  zalo:
    '<path fill-rule="evenodd" d="M6 2h8a5 5 0 0 1 5 5v4a5 5 0 0 1-5 5H8.6l-5 2.9a.5.5 0 0 1-.73-.6L4.2 15A5 5 0 0 1 1 10.3V7a5 5 0 0 1 5-5zm.5 4.3v1.5h4.3l-4.5 4v1.6h7.2v-1.6H9.1l4.4-4V6.3H6.5z"/>',
  mail:
    '<path d="M3 5h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm.9 1.6L10 10.4l6.1-3.8V6.4H3.9v.2zm12.2 1.7-5.7 3.5a.9.9 0 0 1-.8 0L3.9 8.3v5.3h12.2V8.3z"/>',
  location:
    '<path d="M10 2a5.4 5.4 0 0 0-5.4 5.4c0 4 4.7 10 4.9 10.2a.7.7 0 0 0 1 0c.2-.2 4.9-6.2 4.9-10.2A5.4 5.4 0 0 0 10 2zm0 7.7a2.3 2.3 0 1 1 0-4.6 2.3 2.3 0 0 1 0 4.6z"/>',
};

// Tên mạng xã hội trong site.json -> khoá icon
function iconKey(label = '') {
  const k = label.toLowerCase().replace(/[^a-z]/g, '');
  return ICONS[k] ? k : '';
}

export function icon(name, className = 'icon') {
  const path = ICONS[name];
  if (!path) return '';
  return `<svg class="${className}" viewBox="0 0 20 20" width="20" height="20" fill="currentColor" aria-hidden="true" focusable="false">${path}</svg>`;
}

// Icon cho một mục trong site.socials; không nhận ra tên thì trả về chữ
export function socialIcon(social, className = 'icon') {
  const key = iconKey(social.label);
  return key ? icon(key, className) : '';
}
