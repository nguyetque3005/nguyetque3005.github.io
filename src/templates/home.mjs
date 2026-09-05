import { escapeHtml } from '../lib/markdown.mjs';
import { figure, postCard, testimonialSection } from './partials.mjs';

function letter(story) {
  const quote = escapeHtml(story.letter.quote)
    .split('\n')
    .map((l) => `<span>${l}</span>`)
    .join('\n            ');

  return `    <section class="letter">
      <div class="shell">
        <article class="letter-card reveal">
          <img class="letter-logo" src="/assets/logo.png" alt="Logo Tiếng Hàn cùng Queenie" width="120" height="120">
          <p class="eyebrow">${escapeHtml(story.letter.eyebrow)}</p>
          <h1 class="letter-quote">
            ${quote}
          </h1>
          ${story.letter.lead ? `<p class="letter-lead">${escapeHtml(story.letter.lead)}</p>` : ''}
          ${story.letter.body.map((p) => `<p class="letter-body">${escapeHtml(p)}</p>`).join('\n          ')}
          <p class="letter-actions">
            <a class="btn btn-primary" href="${story.letter.cta.href}">${escapeHtml(story.letter.cta.label)}</a>${story.letter.ctaSecondary
              ? `\n            <a class="btn btn-quiet" href="${story.letter.ctaSecondary.href}">${escapeHtml(story.letter.ctaSecondary.label)}</a>`
              : ''}
          </p>
        </article>
      </div>
    </section>`;
}

function chapter(ch, index) {
  const side = index % 2 === 0 ? 'is-left' : 'is-right';
  const body = ch.body.map((p) => `<p>${escapeHtml(p)}</p>`).join('\n              ');
  const aside = !ch.aside
    ? ''
    : Array.isArray(ch.aside)
      ? `<ul class="chapter-aside">${ch.aside.map((a) => `<li>${escapeHtml(a)}</li>`).join('')}</ul>`
      : `<p class="chapter-aside">${escapeHtml(ch.aside)}</p>`;

  const photos = ch.photos || [];
  const media = photos.length
    ? `<div class="chapter-media${photos.length > 1 ? ' is-stacked' : ''}">
            ${photos.map((p) => figure(p, 'chapter-photo')).join('\n            ')}
          </div>`
    : '';

  return `        <article class="chapter ${side} ${photos.length ? 'has-photo' : 'no-photo'} reveal">
          <div class="chapter-text">
            <p class="chapter-year">${escapeHtml(ch.year)}</p>
            <h3 class="chapter-title">${escapeHtml(ch.title)}</h3>
            <div class="chapter-body">
              ${body}
            </div>
            ${aside}
          </div>
          ${media}
        </article>`;
}

function journey(story) {
  return `    <section class="journey" id="hanh-trinh">
      <div class="shell">
        ${story.journeyIntro.title
          ? `<header class="section-head reveal">
          <p class="eyebrow">${escapeHtml(story.journeyIntro.eyebrow)}</p>
          <h2>${escapeHtml(story.journeyIntro.title)}</h2>
          <p class="section-lead">${escapeHtml(story.journeyIntro.lead)}</p>
        </header>`
          : ''}

        <div class="chapters">
${story.chapters.map(chapter).join('\n')}
        </div>
      </div>
    </section>`;
}

function latestPosts(posts) {
  if (!posts.length) {
    return `    <section class="posts-teaser">
      <div class="shell">
        <div class="empty-note reveal">
          <p class="eyebrow">Tài liệu</p>
          <h2>Tài liệu đầu tiên đang trên đường tới</h2>
          <p class="section-lead">Mình đang chuẩn bị những bài đầu tiên về ngữ pháp, từ vựng và chuyện sống ở Hàn. Ghé lại sau nhé.</p>
        </div>
      </div>
    </section>`;
  }

  return `    <section class="posts-teaser">
      <div class="shell">
        <header class="section-head section-head-row reveal">
          <div>
            <p class="eyebrow">Tài liệu</p>
            <h2>Tài liệu mới</h2>
          </div>
          <a class="btn btn-quiet" href="/blog.html">Xem tất cả tài liệu</a>
        </header>
        <div class="post-grid">
${posts.slice(0, 3).map((p) => postCard(p)).join('\n')}
        </div>
      </div>
    </section>`;
}

function closing(site) {
  return `    <section class="closing">
      <div class="shell closing-inner reveal">
        <h2>Nếu bạn muốn đạt tới cột mốc mới trong tiếng Hàn.</h2>
        <p>Nhưng chưa có kế hoạch cụ thể hãy nhắn cho mình, mình sẽ hỗ trợ bạn.</p>
        <p class="closing-actions">
          <a class="btn btn-primary" href="/lien-he.html">Inbox</a>
        </p>
      </div>
    </section>`;
}

export function renderHome({ site, story, testimonials, posts }) {
  return [
    letter(story),
    journey(story),
    latestPosts(posts),
    testimonialSection(testimonials),
    closing(site),
  ]
    .filter(Boolean)
    .join('\n\n');
}
