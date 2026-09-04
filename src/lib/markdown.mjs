// Bộ chuyển Markdown -> HTML tối giản, không phụ thuộc thư viện ngoài.
// Hỗ trợ: tiêu đề, đoạn văn, danh sách, trích dẫn, đường kẻ, khối mã,
// ảnh, liên kết, in đậm, in nghiêng, mã inline.
// Không hỗ trợ (có chủ đích): danh sách lồng nhau, HTML thô (trừ <br>).

const CODE_TOKEN = '@@QKCODE';

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function slugify(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .normalize('NFC')
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function renderInline(text) {
  const codes = [];
  let s = escapeHtml(text);

  // Mã inline được giữ nguyên, không xử lý tiếp bên trong
  s = s.replace(/`([^`]+)`/g, (_m, c) => {
    codes.push(c);
    return `${CODE_TOKEN}${codes.length - 1}@@`;
  });

  // Ảnh phải xử lý trước liên kết
  s = s.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g,
    (_m, alt, src) => `<img src="${src}" alt="${alt}" loading="lazy" data-fallback>`
  );

  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label, href) => {
    const external = /^https?:/i.test(href);
    const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${href}"${attrs}>${label}</a>`;
  });

  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');

  // Cho phép duy nhất thẻ <br> để giữ ngắt dòng trong ô bảng
  s = s.replace(/&lt;br\s*\/?&gt;/g, '<br>');

  s = s.replace(new RegExp(`${CODE_TOKEN}(\\d+)@@`, 'g'), (_m, i) => `<code>${codes[Number(i)]}</code>`);

  return s;
}

const RE_FENCE = /^```/;
const RE_HR = /^(-{3,}|\*{3,}|_{3,})\s*$/;
const RE_HEADING = /^(#{1,6})\s+(.*)$/;
const RE_QUOTE = /^>\s?/;
const RE_UL = /^[-*]\s+/;
const RE_OL = /^\d+\.\s+/;
const RE_TABLE_ROW = /^\s*\|.*\|\s*$/;
const RE_TABLE_SEP = /^\s*\|[\s:|-]+\|\s*$/;

function startsBlock(line) {
  return (
    RE_FENCE.test(line) ||
    RE_HR.test(line) ||
    RE_HEADING.test(line) ||
    RE_QUOTE.test(line) ||
    RE_UL.test(line) ||
    RE_OL.test(line) ||
    RE_TABLE_ROW.test(line)
  );
}

// Tách một dòng bảng thành các ô, bỏ dấu | ở hai đầu
function tableCells(line) {
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((c) => c.trim());
}

// Đoạn văn chỉ chứa một tấm ảnh -> dựng thành <figure> có chú thích
const RE_LONE_IMAGE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;

export function renderMarkdown(src, { headingIds = true } = {}) {
  const lines = String(src).replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    if (RE_FENCE.test(line)) {
      const lang = line.slice(3).trim();
      const buf = [];
      i++;
      while (i < lines.length && !RE_FENCE.test(lines[i])) buf.push(lines[i++]);
      i++; // bỏ qua dòng đóng
      const cls = lang ? ` class="language-${escapeHtml(lang)}"` : '';
      out.push(`<pre><code${cls}>${escapeHtml(buf.join('\n'))}</code></pre>`);
      continue;
    }

    if (RE_HR.test(line)) {
      out.push('<hr>');
      i++;
      continue;
    }

    // Bảng: dòng tiêu đề, dòng phân cách, rồi các dòng dữ liệu
    if (RE_TABLE_ROW.test(line) && i + 1 < lines.length && RE_TABLE_SEP.test(lines[i + 1])) {
      const head = tableCells(lines[i]);
      i += 2;
      const rows = [];
      while (i < lines.length && RE_TABLE_ROW.test(lines[i])) rows.push(tableCells(lines[i++]));

      const thead = `<thead><tr>${head.map((c) => `<th>${renderInline(c)}</th>`).join('')}</tr></thead>`;
      const tbody = `<tbody>${rows
        .map((r) => `<tr>${r.map((c) => `<td>${renderInline(c)}</td>`).join('')}</tr>`)
        .join('')}</tbody>`;
      out.push(`<div class="table-wrap"><table>${thead}${tbody}</table></div>`);
      continue;
    }

    const heading = line.match(RE_HEADING);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2].trim();
      const id = headingIds ? ` id="${slugify(text)}"` : '';
      out.push(`<h${level}${id}>${renderInline(text)}</h${level}>`);
      i++;
      continue;
    }

    if (RE_QUOTE.test(line)) {
      const buf = [];
      while (i < lines.length && RE_QUOTE.test(lines[i])) buf.push(lines[i++].replace(RE_QUOTE, ''));
      out.push(`<blockquote>${renderMarkdown(buf.join('\n'), { headingIds: false })}</blockquote>`);
      continue;
    }

    if (RE_UL.test(line) || RE_OL.test(line)) {
      const ordered = RE_OL.test(line);
      const re = ordered ? RE_OL : RE_UL;
      const items = [];
      while (i < lines.length && re.test(lines[i])) {
        const buf = [lines[i++].replace(re, '')];
        // dòng nối tiếp của cùng một mục
        while (i < lines.length && lines[i].trim() && !startsBlock(lines[i])) buf.push(lines[i++].trim());
        items.push(`<li>${renderInline(buf.join(' '))}</li>`);
      }
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>${items.join('')}</${tag}>`);
      continue;
    }

    const buf = [];
    while (i < lines.length && lines[i].trim() && !startsBlock(lines[i])) buf.push(lines[i++].trim());
    const text = buf.join(' ');

    const lone = text.match(RE_LONE_IMAGE);
    if (lone) {
      const [, alt, src2] = lone;
      const caption = alt ? `<figcaption>${renderInline(alt)}</figcaption>` : '';
      out.push(
        `<figure class="prose-figure"><img src="${src2}" alt="${escapeHtml(alt)}" loading="lazy" data-fallback>${caption}</figure>`
      );
      continue;
    }

    out.push(`<p>${renderInline(text)}</p>`);
  }

  return out.join('\n');
}

// --- Frontmatter ------------------------------------------------------------

export function parseFrontmatter(raw) {
  const text = String(raw).replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  if (!text.startsWith('---\n')) return { data: {}, body: text };

  const end = text.indexOf('\n---', 3);
  if (end === -1) return { data: {}, body: text };

  const head = text.slice(4, end);
  const body = text.slice(end + 4).replace(/^\n/, '');
  const data = {};

  for (const line of head.split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const sep = line.indexOf(':');
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    let value = line.slice(sep + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }

  return { data, body };
}

// Ước lượng thời gian đọc, dùng cho trang blog
export function readingMinutes(text) {
  const words = String(text).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}
