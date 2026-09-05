#!/usr/bin/env node
// Dựng website tĩnh: đọc nội dung trong content/, xuất HTML ra dist/
// Chạy: npm run build

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  parseFrontmatter,
  renderMarkdown,
  readingMinutes,
  slugify,
  escapeHtml,
} from "./src/lib/markdown.mjs";
import { page } from "./src/templates/layout.mjs";
import { renderHome } from "./src/templates/home.mjs";
import { renderHoSo } from "./src/templates/ho-so.mjs";
import { renderBlogIndex, renderPost } from "./src/templates/blog.mjs";
import { renderLopHoc } from "./src/templates/khoa-hoc.mjs";
import { renderLienHe, renderCamOn } from "./src/templates/lien-he.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const CONTENT = path.join(ROOT, "content");
const DIST = path.join(ROOT, "dist");

const readJson = async (file) =>
  JSON.parse(await fs.readFile(path.join(CONTENT, file), "utf8"));

// Những file KHÔNG được đưa lên website, dù nằm trong assets/.
// Đây là tài liệu nội bộ — nếu copy ra dist/ thì ai cũng tải về được.
const KHONG_XUAT_BAN = [
  /\.docx?$/i, // hồ sơ CV bản Word
  /\.pdf$/i, // tài liệu PDF không đưa lên website
  /^queenie-template-reference\./i, // ảnh mẫu thiết kế, không phải nội dung
  /^\./, // file ẩn
];

function biLoaiTru(name) {
  return KHONG_XUAT_BAN.some((re) => re.test(name));
}

async function copyDir(from, to, skipped = [], rel = "") {
  await fs.mkdir(to, { recursive: true });
  const entries = await fs.readdir(from, { withFileTypes: true });
  for (const e of entries) {
    const childRel = rel ? path.join(rel, e.name) : e.name;
    if (biLoaiTru(e.name)) {
      skipped.push(childRel);
      continue;
    }
    const src = path.join(from, e.name);
    const dest = path.join(to, e.name);
    if (e.isDirectory()) await copyDir(src, dest, skipped, childRel);
    else await fs.copyFile(src, dest);
  }
  return skipped;
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function write(relPath, html) {
  const target = path.join(DIST, relPath);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, html, "utf8");
  return relPath;
}

// --- Blog -------------------------------------------------------------------

async function loadPosts(site) {
  const dir = path.join(CONTENT, "blog");
  if (!(await exists(dir))) return [];

  const files = (await fs.readdir(dir)).filter(
    (f) => f.endsWith(".md") && !f.startsWith("_"),
  );
  const posts = [];
  const problems = [];

  for (const file of files) {
    const raw = await fs.readFile(path.join(dir, file), "utf8");
    const { data, body } = parseFrontmatter(raw);

    if (!data.title) {
      problems.push(`${file}: thiếu "title" trong phần đầu file`);
      continue;
    }
    if (!data.date) {
      problems.push(`${file}: thiếu "date" trong phần đầu file`);
      continue;
    }

    const slug =
      data.slug ||
      slugify(file.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, ""));

    posts.push({
      slug,
      url: `/blog/${slug}.html`,
      title: data.title,
      date: data.date,
      category: data.category || "Bài viết",
      tags: (data.tags || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      summary: data.summary || "",
      image: data.image || "",
      imageAlt: data.imageAlt || "",
      author: site.person.fullName,
      readingMinutes: readingMinutes(body),
      html: renderMarkdown(body),
      raw: body,
    });
  }

  for (const p of problems) console.warn(`  ! bỏ qua ${p}`);

  posts.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return posts;
}

// --- Sitemap, RSS, robots ---------------------------------------------------

function sitemap(site, urls) {
  const base = site.seo.url.replace(/\/$/, "");
  const body = urls
    .map((u) => `  <url><loc>${base}${u}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

function rss(site, posts) {
  const base = site.seo.url.replace(/\/$/, "");
  const items = posts
    .slice(0, 20)
    .map(
      (p) => `    <item>
      <title>${escapeHtml(p.title)}</title>
      <link>${base}${p.url}</link>
      <guid>${base}${p.url}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${escapeHtml(p.summary)}</description>
    </item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeHtml(site.brand.name)}</title>
    <link>${base}/</link>
    <description>${escapeHtml(site.seo.description)}</description>
    <language>vi</language>
${items}
  </channel>
</rss>
`;
}

function personSchema(site, cv) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.person.fullName,
    alternateName: site.person.nickname,
    jobTitle: site.person.role,
    email: `mailto:${site.contact.email}`,
    url: site.seo.url,
    image: site.seo.url.replace(/\/$/, "") + site.seo.image,
    knowsLanguage: cv.languages.map((l) => l.name),
    alumniOf: cv.education.map((e) => ({
      "@type": "EducationalOrganization",
      name: e.org,
    })),
    worksFor: { "@type": "Organization", name: site.brand.name },
  });
}

// --- Build ------------------------------------------------------------------

async function build() {
  const started = Date.now();
  console.log("Đang dựng website…");

  const [site, story, cv, classes, testimonials] = await Promise.all([
    readJson("site.json"),
    readJson("story.json"),
    readJson("cv.json"),
    readJson("classes.json"),
    readJson("testimonials.json"),
  ]);

  await fs.rm(DIST, { recursive: true, force: true });
  await fs.mkdir(DIST, { recursive: true });

  const posts = await loadPosts(site);
  // Thẻ dùng cho bộ lọc ở trang Tài liệu, giữ nguyên thứ tự xuất hiện trong bài.
  const tags = [...new Set(posts.flatMap((p) => p.tags))];
  const written = [];

  // Trang chủ
  written.push(
    await write(
      "index.html",
      page({
        site,
        title: "Câu chuyện",
        path: "/",
        bodyClass: "page-home",
        main: renderHome({ site, story, testimonials, posts }),
        extraHead: "",
      }).replace(
        "</head>",
        `<script type="application/ld+json">${personSchema(site, cv)}</script>\n</head>`,
      ),
    ),
  );

  // Hồ sơ
  written.push(
    await write(
      "ho-so.html",
      page({
        site,
        title: "Hồ sơ",
        description: cv.intro.lead,
        path: "/ho-so.html",
        bodyClass: "page-cv",
        main: renderHoSo({ cv }),
      }),
    ),
  );

  // Blog
  written.push(
    await write(
      "blog.html",
      page({
        site,
        title: "Tài liệu",
        description:
          "Tài liệu và bài viết về ngữ pháp, từ vựng, luyện thi TOPIK và cuộc sống ở Hàn Quốc.",
        path: "/blog.html",
        bodyClass: "page-blog",
        main: renderBlogIndex({ posts, tags }),
      }),
    ),
  );

  for (const post of posts) {
    const related = posts
      .filter((p) => p.slug !== post.slug && p.category === post.category)
      .slice(0, 3);
    const fallback = posts.filter((p) => p.slug !== post.slug).slice(0, 3);
    written.push(
      await write(
        `blog/${post.slug}.html`,
        page({
          site,
          title: post.title,
          description: post.summary,
          path: post.url,
          bodyClass: "page-post",
          ogType: "article",
          ogImage: post.image || undefined,
          main: renderPost({
            post,
            related: related.length ? related : fallback,
          }),
        }),
      ),
    );
  }

  // Khóa học
  written.push(
    await write(
      "khoa-hoc.html",
      page({
        site,
        title: "Khóa học",
        description: classes.intro.lead,
        path: "/khoa-hoc.html",
        bodyClass: "page-classes",
        main: renderLopHoc({ classes, testimonials }),
      }),
    ),
  );

  // Liên hệ + trang cảm ơn
  written.push(
    await write(
      "lien-he.html",
      page({
        site,
        title: "Liên hệ",
        path: "/lien-he.html",
        bodyClass: "page-contact",
        main: renderLienHe({ site }),
      }),
    ),
  );

  written.push(
    await write(
      "cam-on.html",
      page({
        site,
        title: "Cảm ơn bạn",
        path: "/cam-on.html",
        bodyClass: "page-thanks",
        main: renderCamOn({ site }),
      }),
    ),
  );

  // Trang 404
  written.push(
    await write(
      "404.html",
      page({
        site,
        title: "Không tìm thấy trang",
        path: "/404.html",
        bodyClass: "page-404",
        main: `    <section class="page-head">
      <div class="shell">
        <p class="eyebrow">404</p>
        <h1>Trang này không có ở đây</h1>
        <p class="page-lead">Có thể đường dẫn đã đổi, hoặc mình gõ nhầm ở đâu đó. Bạn thử quay về trang chủ nhé.</p>
        <p class="closing-actions"><a class="btn btn-primary" href="/">Về trang chủ</a> <a class="btn btn-quiet" href="/blog.html">Xem blog</a></p>
      </div>
    </section>`,
      }),
    ),
  );

  // Tài nguyên tĩnh
  await fs.copyFile(
    path.join(ROOT, "src/styles/style.css"),
    path.join(DIST, "style.css"),
  );
  await fs.copyFile(
    path.join(ROOT, "src/scripts/main.js"),
    path.join(DIST, "main.js"),
  );
  let skipped = [];
  if (await exists(path.join(ROOT, "assets"))) {
    skipped = await copyDir(
      path.join(ROOT, "assets"),
      path.join(DIST, "assets"),
    );
  }

  const pageUrls = written
    .filter((u) => !u.startsWith("404"))
    .map((u) => "/" + u.replace(/^index\.html$/, ""));
  await fs.writeFile(path.join(DIST, "sitemap.xml"), sitemap(site, pageUrls));
  await fs.writeFile(path.join(DIST, "feed.xml"), rss(site, posts));
  await fs.writeFile(
    path.join(DIST, "robots.txt"),
    `User-agent: *\nAllow: /\nSitemap: ${site.seo.url.replace(/\/$/, "")}/sitemap.xml\n`,
  );
  // GitHub Pages tự dùng 404.html, không cần file cấu hình chuyển hướng.
  // Chặn Jekyll xử lý lại thư mục xuất bản (nếu không, file bắt đầu bằng _ bị bỏ qua).
  await fs.writeFile(path.join(DIST, ".nojekyll"), "");

  console.log(
    `  ${written.length} trang · ${posts.length} bài viết · ${Date.now() - started}ms`,
  );
  console.log(`  Xuất ra: dist/`);

  if (skipped.length) {
    console.log(`\n  Không xuất bản (tài liệu nội bộ): ${skipped.join(", ")}`);
  }

  if (!posts.length) {
    console.log("\n  Ghi chú: chưa có bài viết nào trong content/blog/.");
    console.log("  Thêm file .md vào đó rồi chạy lại lệnh này.");
  }
}

build().catch((err) => {
  console.error("\nDựng website thất bại:");
  console.error(err);
  process.exit(1);
});
