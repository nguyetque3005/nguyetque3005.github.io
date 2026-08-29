import { escapeHtml } from '../lib/markdown.mjs';
import { pageHead } from './partials.mjs';

export function renderLienHe({ site }) {
  const socials = (site.socials || []).filter((s) => s.href);
  const socialHtml = socials.length
    ? `          <div class="contact-socials">
            <p class="contact-label">Mạng xã hội</p>
            <p>${socials
              .map(
                (s) =>
                  `<a href="${s.href}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.label)}</a>`
              )
              .join(' · ')}</p>
          </div>`
    : '';

  return `${pageHead({
    eyebrow: 'Liên hệ',
    title: 'Nhắn cho mình một câu',
    lead: 'Bạn muốn học, muốn hỏi lộ trình, hay cần biên – phiên dịch Hàn–Việt cho công việc — cứ viết cho mình. Bạn không cần chuẩn bị gì trước cả.',
  })}

    <section class="contact">
      <div class="shell contact-grid">

        <div class="contact-side reveal">
          <div class="contact-block">
            <p class="contact-label">Email</p>
            <p class="contact-email"><a href="mailto:${site.contact.email}">${escapeHtml(site.contact.email)}</a></p>
          </div>

          <div class="contact-block">
            <p class="contact-label">Mình đang ở</p>
            <p>${escapeHtml(site.contact.location)}</p>
          </div>

${socialHtml}

          <p class="contact-note">${escapeHtml(site.contact.note)}</p>
        </div>

        <form class="contact-form reveal" name="lien-he" data-mailto-form data-mailto="${site.contact.email}">
          <p class="hidden-field"><label>Đừng điền ô này <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>

          <div class="field">
            <label for="ten">Tên của bạn</label>
            <input id="ten" name="ten" type="text" required autocomplete="name">
          </div>

          <div class="field">
            <label for="email">Email</label>
            <input id="email" name="email" type="email" required autocomplete="email">
          </div>

          <div class="field">
            <label for="chu-de">Bạn muốn trao đổi về</label>
            <select id="chu-de" name="chu-de">
              <option>Học tiếng Hàn từ đầu</option>
              <option>Luyện thi TOPIK</option>
              <option>Tiếng Hàn công sở / tài chính – ngân hàng</option>
              <option>Tiếng Hàn để sống ở Hàn</option>
              <option>Biên dịch – phiên dịch Hàn–Việt</option>
              <option>Chuyện khác</option>
            </select>
          </div>

          <div class="field">
            <label for="loi-nhan">Lời nhắn</label>
            <textarea id="loi-nhan" name="loi-nhan" rows="6" required placeholder="Bạn đang học tới đâu rồi, và bạn muốn đi tới đâu?"></textarea>
          </div>

          <button class="btn btn-primary" type="submit">Soạn email gửi Queenie</button>
          <p class="form-fallback">Nút này mở sẵn một email đã điền đầy đủ trong ứng dụng mail của bạn — bạn chỉ cần bấm gửi. Nếu máy bạn không mở được, viết thẳng cho mình qua <a href="mailto:${site.contact.email}">${escapeHtml(site.contact.email)}</a> nhé.</p>
        </form>

      </div>
    </section>`;
}

export function renderCamOn({ site }) {
  return `${pageHead({
    eyebrow: 'Cảm ơn bạn',
    title: 'Mình đã nhận được lời nhắn rồi',
    lead: 'Cảm ơn bạn đã viết cho mình. Mình sẽ trả lời sớm nhất có thể — thường trong vòng một, hai ngày.',
  })}

    <section class="closing">
      <div class="shell closing-inner reveal">
        <p class="closing-actions">
          <a class="btn btn-primary" href="/">Về trang chủ</a>
          <a class="btn btn-quiet" href="/blog.html">Đọc vài bài viết trong lúc chờ</a>
        </p>
        <p class="contact-note">Nếu sau ba ngày bạn chưa thấy hồi âm, có thể thư đã lạc vào hộp spam — bạn viết thẳng cho mình qua <a href="mailto:${site.contact.email}">${escapeHtml(site.contact.email)}</a> nhé.</p>
      </div>
    </section>`;
}
