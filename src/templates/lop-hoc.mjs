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

function method(c) {
  const m = c.method;
  return `    <section class="method">
      <div class="shell">
        <header class="section-head reveal">
          <h2>${escapeHtml(m.title)}</h2>
          <p class="section-lead">${renderInline(m.intro)}</p>
        </header>

        <ol class="flow reveal">
${m.flow.map((s) => `          <li>${escapeHtml(s)}</li>`).join('\n')}
        </ol>

        <p class="focus-label reveal">${escapeHtml(m.focusLabel)}</p>
        <ul class="focus-list reveal">
${m.focus
  .map(
    (f) => `          <li>${escapeHtml(f)}</li>`
  )
  .join('\n')}
        </ul>
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

function audience(c) {
  const a = c.audience;
  return `    <section class="audience">
      <div class="shell audience-inner reveal">
        <h2>${escapeHtml(a.title)}</h2>
        <p class="section-lead">${renderInline(a.intro)}</p>
        <ul class="check-list">
${a.items.map((t) => `          <li>${escapeHtml(t)}</li>`).join('\n')}
        </ul>
        <p class="audience-note">${renderInline(a.note)}</p>
      </div>
    </section>`;
}

function goal(c) {
  return `    <section class="goal">
      <div class="shell goal-inner reveal">
        <h2>${escapeHtml(c.goal.title)}</h2>
        <ol class="goal-flow">
${c.goal.items.map((i) => `          <li>${escapeHtml(i)}</li>`).join('\n')}
        </ol>
      </div>
    </section>`;
}

function register(c) {
  const r = c.register;
  return `    <section class="closing" id="dang-ky">
      <div class="shell closing-inner reveal">
        <h2>${escapeHtml(r.title)}</h2>
        <p>${renderInline(r.text)}</p>
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
    method(classes),
    content(classes),
    audience(classes),
    goal(classes),
    testimonialSection(testimonials),
    register(classes),
  ]
    .filter(Boolean)
    .join('\n\n');
}
