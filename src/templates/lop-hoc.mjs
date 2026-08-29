import { escapeHtml } from '../lib/markdown.mjs';
import { pageHead, testimonialSection } from './partials.mjs';

function principles(classes) {
  return `    <section class="principles">
      <div class="shell">
        <div class="principle-grid">
${classes.principles
  .map(
    (p) => `          <article class="principle reveal">
            <h3>${escapeHtml(p.title)}</h3>
            <p>${escapeHtml(p.text)}</p>
          </article>`
  )
  .join('\n')}
        </div>
      </div>
    </section>`;
}

function courses(classes) {
  return `    <section class="courses">
      <div class="shell">
        <header class="section-head reveal">
          <p class="eyebrow">Các lớp</p>
          <h2>Bốn hướng đi, tuỳ bạn cần gì</h2>
        </header>
        <div class="course-list">
${classes.courses
  .map(
    (c) => `          <article class="course reveal">
            <h3 class="course-name">${escapeHtml(c.name)}</h3>
            <dl class="course-meta">
              <div><dt>Dành cho</dt><dd>${escapeHtml(c.for)}</dd></div>
              <div><dt>Hình thức</dt><dd>${escapeHtml(c.format)}</dd></div>
              <div><dt>Học xong bạn làm được</dt><dd>${escapeHtml(c.outcome)}</dd></div>
            </dl>
            ${c.note ? `<p class="course-note">${escapeHtml(c.note)}</p>` : ''}
          </article>`
  )
  .join('\n')}
        </div>
      </div>
    </section>`;
}

function process(classes) {
  return `    <section class="process">
      <div class="shell">
        <header class="section-head reveal">
          <h2>${escapeHtml(classes.process.title)}</h2>
        </header>
        <ol class="step-list">
${classes.process.steps
  .map(
    (s, i) => `          <li class="step reveal">
            <span class="step-number">${i + 1}</span>
            <span class="step-title">${escapeHtml(s.title)}</span>
            <span class="step-text">${escapeHtml(s.text)}</span>
          </li>`
  )
  .join('\n')}
        </ol>
      </div>
    </section>`;
}

function cta(classes) {
  return `    <section class="closing">
      <div class="shell closing-inner reveal">
        <h2>${escapeHtml(classes.cta.title)}</h2>
        <p>${escapeHtml(classes.cta.text)}</p>
        <p class="closing-actions">
          <a class="btn btn-primary" href="${classes.cta.href}">${escapeHtml(classes.cta.label)}</a>
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
    principles(classes),
    courses(classes),
    testimonialSection(testimonials),
    process(classes),
    cta(classes),
  ]
    .filter(Boolean)
    .join('\n\n');
}
