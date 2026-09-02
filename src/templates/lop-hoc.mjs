import { escapeHtml } from '../lib/markdown.mjs';
import { pageHead, testimonialSection } from './partials.mjs';

function skills(classes) {
  return `    <section class="skills">
      <div class="shell">
        <div class="skill-grid">
${classes.skills
  .map(
    (s) => `          <article class="skill reveal">
            <span class="skill-icon" aria-hidden="true">${s.icon}</span>
            <h2>${escapeHtml(s.title)}</h2>
            <p>${escapeHtml(s.text)}</p>
          </article>`
  )
  .join('\n')}
        </div>
      </div>
    </section>`;
}

function goal(classes) {
  return `    <section class="goal">
      <div class="shell goal-inner reveal">
        <span class="goal-icon" aria-hidden="true">${classes.goal.icon}</span>
        <h2>${escapeHtml(classes.goal.title)}</h2>
        <ul class="goal-list">
${classes.goal.items.map((i) => `          <li>${escapeHtml(i)}</li>`).join('\n')}
        </ul>
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
    skills(classes),
    goal(classes),
    testimonialSection(testimonials),
    process(classes),
    cta(classes),
  ]
    .filter(Boolean)
    .join('\n\n');
}
