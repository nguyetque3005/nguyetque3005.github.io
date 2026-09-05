import { escapeHtml } from '../lib/markdown.mjs';
import { icon, socialIcon } from './partials.mjs';

function navLinks(site, current) {
  return site.nav
    .map((item) => {
      const active = item.href === current ? ' class="is-active" aria-current="page"' : '';
      return `<a href="${item.href}"${active}>${escapeHtml(item.label)}</a>`;
    })
    .join('\n          ');
}

function header(site, current) {
  return `<a class="skip-link" href="#noi-dung">Bỏ qua, tới nội dung chính</a>

  <header class="site-header" data-header>
    <div class="shell header-inner">
      <a class="brand" href="/">
        <img class="brand-mark" src="${site.brand.logo}" alt="" width="52" height="52">
        <span class="brand-text">
          <span class="brand-name">${escapeHtml(site.brand.short)}</span>
          <span class="brand-tagline">${escapeHtml(site.brand.tagline)}</span>
        </span>
      </a>

      <button class="nav-toggle" type="button" aria-label="Mở menu" aria-expanded="false" aria-controls="main-nav" data-nav-toggle>
        <span></span><span></span><span></span>
      </button>

      <nav class="main-nav" id="main-nav" aria-label="Điều hướng chính" data-nav>
          ${navLinks(site, current)}${site.navCta
          ? `\n        <a class="nav-cta" href="${site.navCta.href}">${escapeHtml(site.navCta.label)}</a>`
          : ''}
      </nav>
    </div>
  </header>`;
}

function footer(site) {
  const socials = (site.socials || []).filter((s) => s.href);
  // Icon thay cho chữ; tên mạng xã hội vẫn có trong aria-label và title
  const socialHtml = socials.length
    ? `<div class="footer-socials">${socials
        .map((s) => {
          const svg = socialIcon(s);
          return `<a class="social-btn${svg ? '' : ' is-text'}" href="${s.href}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(s.label)}" title="${escapeHtml(s.label)}">${svg || escapeHtml(s.label)}</a>`;
        })
        .join('')}</div>`
    : '';

  return `<footer class="site-footer">
    <div class="shell footer-inner">
      <div class="footer-brand">
        <img src="${site.brand.logo}" alt="" width="64" height="64">
        <p class="footer-name">${escapeHtml(site.brand.name)}</p>
        <p class="footer-tagline">${escapeHtml(site.brand.tagline)}</p>
      </div>

      <nav class="footer-nav" aria-label="Điều hướng chân trang">
        ${site.nav.map((i) => `<a href="${i.href}">${escapeHtml(i.label)}</a>`).join('')}
      </nav>

      <div class="footer-contact">
        <p class="footer-line">${icon('mail')}<a href="mailto:${site.contact.email}">${escapeHtml(site.contact.email)}</a></p>
        <p class="footer-line">${icon('location')}<span>${escapeHtml(site.contact.location)}</span></p>
        ${socialHtml}
      </div>
    </div>
    <div class="shell footer-base">
      <p>&copy; ${new Date().getFullYear()} ${escapeHtml(site.person.fullName)}</p>
    </div>
  </footer>`;
}

export function page({
  site,
  title,
  description,
  path = '/',
  bodyClass = '',
  main = '',
  ogType = 'website',
  ogImage,
}) {
  const fullTitle = path === '/' ? `${site.brand.name} — ${site.person.role}` : `${title} · ${site.brand.short}`;
  const desc = description || site.seo.description;
  const canonical = site.seo.url.replace(/\/$/, '') + path;
  const image = site.seo.url.replace(/\/$/, '') + (ogImage || site.seo.image);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(fullTitle)}</title>
<meta name="description" content="${escapeHtml(desc)}">
<meta name="author" content="${escapeHtml(site.person.fullName)}">
<meta name="theme-color" content="#e889a7">
<link rel="canonical" href="${canonical}">

<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${escapeHtml(fullTitle)}">
<meta property="og:description" content="${escapeHtml(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${image}">
<meta property="og:locale" content="${site.seo.locale}">
<meta property="og:site_name" content="${escapeHtml(site.brand.name)}">
<meta name="twitter:card" content="summary_large_image">

<!-- favicon dùng PNG nền trong, đã bo tròn sẵn trong file.
     apple-touch-icon phải có nền đục: iOS ghép phần trong suốt lên nền đen. -->
<link rel="icon" type="image/png" href="${site.brand.logo}">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap">

<link rel="stylesheet" href="/style.css">
<script>document.documentElement.classList.add('js');</script>
</head>
<body class="${bodyClass}">

  ${header(site, path)}

  <main id="noi-dung">
${main}
  </main>

  ${footer(site)}

  <a class="to-top" href="#" aria-label="Lên đầu trang" data-to-top>↑</a>

  <script src="/main.js" defer></script>
</body>
</html>
`;
}
