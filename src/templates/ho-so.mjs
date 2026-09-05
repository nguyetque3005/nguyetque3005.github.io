import { escapeHtml } from '../lib/markdown.mjs';
import { pageHead } from './partials.mjs';

function entry(item) {
  const bullets = (item.bullets || []).length
    ? `<ul class="entry-bullets">${item.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>`
    : '';
  const awards = (item.awards || []).length
    ? `<div class="entry-awards">
              <p class="entry-awards-label">Ghi nhận</p>
              <ul>${item.awards.map((a) => `<li>${escapeHtml(a)}</li>`).join('')}</ul>
            </div>`
    : '';

  return `        <article class="entry reveal">
          <div class="entry-period">${escapeHtml(item.period)}</div>
          <div class="entry-main">
            <h3 class="entry-org">${escapeHtml(item.org)}</h3>
            <p class="entry-role">${escapeHtml(item.role)}</p>
            ${bullets}
            ${awards}
          </div>
        </article>`;
}

function block(id, label, title, items) {
  return `    <section class="cv-block" id="${id}">
      <div class="shell">
        <header class="section-head reveal">
          <p class="eyebrow">${escapeHtml(label)}</p>
          <h2>${escapeHtml(title)}</h2>
        </header>
        <div class="entries">
${items.map(entry).join('\n')}
        </div>
      </div>
    </section>`;
}

function certificates(cv) {
  const items = cv.certificates
    .map(
      (c) => `          <li class="cert-card reveal">
            <span class="cert-card-name">${escapeHtml(c.name)}</span>
            <span class="cert-card-issuer">${escapeHtml(c.issuer)}</span>
            ${c.detail ? `<span class="cert-card-detail">${escapeHtml(c.detail)}</span>` : ''}
          </li>`
    )
    .join('\n');

  return `    <section class="cv-block" id="chung-chi">
      <div class="shell">
        <header class="section-head reveal">
          <p class="eyebrow">Chứng chỉ</p>
          <h2>Chứng chỉ &amp; năng lực</h2>
        </header>
        <ul class="cert-cards">
${items}
        </ul>
      </div>
    </section>`;
}

function languages(cv) {
  const rows = cv.languages
    .map(
      (l) => `          <li class="reveal"><span class="lang-name">${escapeHtml(l.name)}</span><span class="lang-level">${escapeHtml(l.level)}</span></li>`
    )
    .join('\n');

  return `    <section class="cv-block" id="ngon-ngu">
      <div class="shell">
        <header class="section-head reveal">
          <p class="eyebrow">Ngôn ngữ</p>
          <h2>Ngôn ngữ làm việc</h2>
        </header>
        <ul class="lang-list">
${rows}
        </ul>
        <p class="cv-status reveal">${escapeHtml(cv.status.residence)} · ${escapeHtml(cv.status.visa)}</p>
      </div>
    </section>`;
}

export function renderHoSo({ cv }) {
  return [
    pageHead({
      eyebrow: cv.intro.eyebrow,
      title: cv.intro.title,
      lead: cv.intro.lead,
    }),
    block('kinh-nghiem', 'Kinh nghiệm', 'Quá trình làm việc', cv.experience),
    block('hoc-van', 'Học vấn', 'Quá trình học tập', cv.education),
    certificates(cv),
    languages(cv),
  ].join('\n\n');
}
