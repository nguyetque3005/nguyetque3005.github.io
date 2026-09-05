import { escapeHtml } from '../lib/markdown.mjs';
import { pageHead, icon, socialIcon } from './partials.mjs';

export function renderLienHe({ site }) {
  const socials = (site.socials || []).filter((s) => s.href);
  const socialHtml = socials.length
    ? `        <div class="contact-row">
          <p class="contact-label">Mạng xã hội</p>
          <p class="contact-links">
${socials
  .map(
    (s) =>
      `            <a class="contact-pill" href="${s.href}" target="_blank" rel="noopener noreferrer">${socialIcon(s)}<span>${escapeHtml(s.label)}</span></a>`
  )
  .join('\n')}
          </p>
        </div>
`
    : '';

  return `${pageHead({
    eyebrow: 'Liên hệ',
    title: 'Hãy liên hệ mình qua',
  })}

    <section class="contact">
      <div class="shell">
        <div class="contact-card reveal">

        <div class="contact-row">
          <p class="contact-label">Email</p>
          <p class="contact-email"><a href="mailto:${site.contact.email}">${icon('mail', 'icon contact-icon')}<span>${escapeHtml(site.contact.email)}</span></a></p>
        </div>

${socialHtml}
          <p class="contact-note">${icon('location', 'icon contact-icon')}<span>Local time: UTC+9 · ${escapeHtml(site.contact.location)}</span></p>

        </div>
      </div>
    </section>`;
}
