import { escapeHtml } from '../lib/markdown.mjs';

// Ảnh có sẵn phương án dự phòng: nếu file ảnh chưa có, JS sẽ thay bằng
// một khung giữ chỗ có nhãn, thay vì hiện biểu tượng ảnh vỡ.
// photo.ratio: bỏ trống = khung ngang 4:3 (mặc định)
//              "portrait" = khung dọc 3:4, hợp với ảnh chụp dọc
//              "natural"  = giữ nguyên tỉ lệ gốc, không cắt gì cả
export function figure(photo, className = '') {
  if (!photo || !photo.src) return '';
  const caption = photo.caption
    ? `<figcaption>${escapeHtml(photo.caption)}</figcaption>`
    : '';
  const ratio = photo.ratio === 'portrait' ? ' is-portrait' : photo.ratio === 'natural' ? ' is-natural' : '';
  return `<figure class="photo ${className}${ratio}">
            <img src="${photo.src}" alt="${escapeHtml(photo.alt || '')}" loading="lazy" data-fallback="${escapeHtml(photo.alt || 'Ảnh')}">
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
    ? `<span class="post-thumb"><img src="${post.image}" alt="${escapeHtml(post.imageAlt || '')}" loading="lazy" data-fallback="${escapeHtml(post.category || 'Bài viết')}"></span>`
    : '<span class="post-thumb post-thumb-blank" aria-hidden="true"></span>';

  return `          <a class="post-card reveal" href="${post.url}">
            ${thumb}
            <span class="post-meta">
              <span class="post-category">${escapeHtml(post.category || 'Bài viết')}</span>
              <span class="post-date">${formatDate(post.date)}</span>
            </span>
            <span class="post-title">${escapeHtml(post.title)}</span>
            <span class="post-summary">${escapeHtml(post.summary || '')}</span>
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
