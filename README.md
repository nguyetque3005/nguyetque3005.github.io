# Tiếng Hàn cùng Queenie

Personal website for **Nguyễn Hồng Nguyệt Quế (Queenie)** — MA in Korean–Vietnamese
Interpreting & Translation, TOPIK 6급.

**Live: <https://nguyetque3005.github.io>**

Static site. No framework, no dependencies. Content lives in `content/` as JSON
and Markdown — editing it needs no coding.

## Run locally

Needs [Node.js](https://nodejs.org) 18+.

```bash
npm run serve             # build + open http://localhost:8000
PORT=8123 npm run serve   # if 8000 is busy
```

## Edit content

| To change | Edit |
| --- | --- |
| Site name, menu, email, socials | `content/site.json` |
| Homepage letter, journey chapters, photos | `content/story.json` |
| CV: experience, education, certificates | `content/cv.json` |
| Courses | `content/classes.json` |
| Student testimonials | `content/testimonials.json` |
| Blog posts | `content/blog/*.md` |
| Colours and fonts | `src/styles/style.css` (`:root` at the top) |

Never edit `dist/` — it is wiped and regenerated on every build.

## New blog post

Copy `content/blog/_mau-bai-viet.md`, rename to `2026-09-15-post-name.md`,
edit the header between the `---` lines, write below it, then build.
Files starting with `_` are drafts and are not published.

Categories: `Ngữ pháp`, `Từ vựng`, `TOPIK`, `Tiếng Hàn công sở`, `Cuộc sống ở Hàn`.

## Photos

Drop files in `assets/`, reference as `/assets/name.jpeg`. In `story.json` each
chapter takes one or two photos; optional `"ratio"` is `"portrait"` (tall),
`"natural"` (uncropped), or omitted (4:3). Missing files render a labelled
placeholder instead of a broken image.

## Publish

Two branches: `source` holds the project, `main` holds the built site that
GitHub Pages serves. Do not edit `main` by hand.

```bash
git add -A && git commit -m "..." && git push origin source
npm run deploy    # rebuilds and publishes; live in ~1 min
```

Pushing uses the `id_ed25519_nguyetque` SSH key (handled by the deploy script).

## Notes

- **Contact form** opens a pre-filled email in the visitor's mail app. A static
  host has no server to receive form posts. Switch to Formspree if you ever want
  submissions to arrive without the visitor opening their mail client.
- **`private/`** is gitignored — internal files that must never reach GitHub.
  `build.mjs` also blocks any `.docx`/`.pdf` in `assets/` from being published.
- **Testimonials and blog auto-hide** while empty. Nothing on the site is invented.
- **Korean version** at `/ko/` is not built yet; the structure is ready for it.

## Still to do

1. Fill the **2022–2024 gap** in the story — the CV had nothing between leaving
   HSBC (09/2022) and starting the MA (09/2024).
2. Confirm: the 성적 최우수상 award, the date of the "đi dạy tiếng Anh" photo, and
   whether the programme was Global Young **Force** (banner) or **Leader** (CV).
3. Add real blog posts and testimonials.
4. Fill in social links in `content/site.json`.
