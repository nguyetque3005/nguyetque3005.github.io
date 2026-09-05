import { escapeHtml } from '../lib/markdown.mjs';
import { pageHead, postCard, formatDate } from './partials.mjs';

export function renderBlogIndex({ posts, tags }) {
  const head = pageHead({ eyebrow: '', title: 'Tài liệu' });

  if (!posts.length) {
    return `${head}

    <section class="blog-list">
      <div class="shell">
        <div class="empty-note reveal">
          <h2>Chưa có tài liệu nào</h2>
          <p class="section-lead">Mình đang viết những bài đầu tiên. Bạn ghé lại sau một chút nhé — hoặc nhắn cho mình chủ đề bạn muốn đọc, mình sẽ viết cái đó trước.</p>
          <p><a class="btn btn-primary" href="/lien-he.html">Gợi ý chủ đề cho mình</a></p>
        </div>
      </div>
    </section>`;
  }

  const filters = tags.length
    ? `        <div class="blog-filters reveal">
          <button type="button" class="chip is-active" data-filter="*">Tất cả</button>
${tags.map((t) => `          <button type="button" class="chip" data-filter="${escapeHtml(t)}">${escapeHtml(t)}</button>`).join('\n')}
        </div>`
    : '';

  const cards = posts.map((p) => postCard(p)).join('\n');

  return `${head}

    <section class="blog-list">
      <div class="shell">
${filters}
        <div class="post-grid" data-post-grid>
${cards}
        </div>
        <p class="blog-empty-filter" data-empty-filter hidden>Chưa có bài viết nào trong mục này.</p>
      </div>
    </section>`;
}

export function renderPost({ post, related }) {
  const relatedHtml = related.length
    ? `    <section class="post-related">
      <div class="shell">
        <header class="section-head reveal"><h2>Đọc tiếp</h2></header>
        <div class="post-grid">
${related.map((p) => postCard(p)).join('\n')}
        </div>
      </div>
    </section>`
    : '';

  return `    <article class="post">
      <div class="shell shell-narrow">
        <header class="post-head reveal">
          <p class="post-breadcrumb"><a href="/blog.html">Tài liệu</a> <span aria-hidden="true">/</span> ${escapeHtml(post.category || 'Bài viết')}</p>
          <h1>${escapeHtml(post.title)}</h1>
          <p class="post-byline">
            <span>${escapeHtml(post.author)}</span>
            <span aria-hidden="true">·</span>
            <time datetime="${escapeHtml(post.date)}">${formatDate(post.date)}</time>
            <span aria-hidden="true">·</span>
            <span>${post.readingMinutes} phút đọc</span>
          </p>
          ${post.summary ? `<p class="post-lead">${escapeHtml(post.summary)}</p>` : ''}
          ${(post.tags || []).length
            ? `<p class="post-tags">${post.tags
                .map((t) => `<a class="tag" href="/blog.html?tag=${encodeURIComponent(t)}">${escapeHtml(t)}</a>`)
                .join('')}</p>`
            : ''}
        </header>
        <div class="doc-sheet">
          <span class="doc-corner tl" aria-hidden="true">&#9825;</span>
          <span class="doc-corner tr" aria-hidden="true">&#9825;</span>
          <span class="doc-corner bl" aria-hidden="true">&#9825;</span>
          <span class="doc-corner br" aria-hidden="true">&#9825;</span>
          <img class="doc-logo" src="/assets/logo.png" alt="" width="76" height="76">
          <div class="prose">
${post.html}
          </div>
        </div>

        <footer class="post-foot reveal">
          <img class="post-foot-logo" src="/assets/logo.png" alt="" width="72" height="72">
          <div>
            <p class="post-foot-name">${escapeHtml(post.author)}</p>
            <p class="post-foot-text">Thạc sĩ Biên–Phiên dịch Hàn–Việt, TOPIK 6급, KIIP 5. <br> Yêu tiếng Hàn, thích dạy TOPIK.</p>
            <p><a class="btn btn-quiet" href="/lop-hoc.html">Xem lớp học</a></p>
          </div>
        </footer>
      </div>
    </article>

${relatedHtml}`;
}
