import { escapeHtml, renderInline } from '../lib/markdown.mjs';
import { pageHead, testimonialSection } from './partials.mjs';

// Một ô nội dung có thể là một đoạn hoặc nhiều đoạn, giữ đúng như tài liệu gốc
function paragraphs(text, indent = '            ') {
  return (Array.isArray(text) ? text : [text])
    .map((t) => `${indent}<p>${renderInline(t)}</p>`)
    .join('\n');
}

function pains(c) {
  return `    <section class="pains">
      <div class="shell pains-inner reveal">
        <ul class="pain-list">
${c.pains.items.map((t) => `          <li>${escapeHtml(t)}</li>`).join('\n')}
        </ul>
        <p class="pain-note">${renderInline(c.pains.note)}</p>
      </div>
    </section>`;
}

function content(c) {
  const k = c.content;
  return `    <section class="skills">
      <div class="shell">
        <header class="section-head reveal">
          <h2>${escapeHtml(k.title)}</h2>
          <p class="section-lead">${renderInline(k.intro)}</p>
        </header>
        <div class="skill-grid">
${k.skills
  .map(
    (s) => `          <article class="skill reveal">
            <h3>${escapeHtml(s.title)}</h3>
${paragraphs(s.text)}
          </article>`
  )
  .join('\n')}
        </div>
      </div>
    </section>`;
}

function register(c) {
  const r = c.register;
  return `    <section class="closing" id="dang-ky">
      <div class="shell closing-inner reveal">
        <p class="closing-actions">
          <a class="btn btn-primary" href="${r.href}">${escapeHtml(r.label)}</a>
        </p>
      </div>
    </section>`;
}

export function renderLopHoc({ classes, testimonials }) {
  return [
    pageHead({
      eyebrow: classes.intro.eyebrow,
      title: classes.intro.title,
      lead: classes.intro.lead,
      note: classes.intro.statusNote,
    }),
    pains(classes),
    content(classes),
    testimonialSection(testimonials),
    register(classes),
  ]
    .filter(Boolean)
    .join('\n\n');
}
