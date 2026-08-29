/* Tiếng Hàn cùng Queenie — tương tác phía trình duyệt.
   Không dùng thư viện ngoài. Mọi thứ đều có phương án dự phòng
   nếu JavaScript bị tắt: trang vẫn đọc được bình thường. */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Menu trên điện thoại ---------- */

  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* ---------- Đầu trang khi cuộn, và nút lên đầu trang ---------- */

  var header = document.querySelector('[data-header]');
  var toTop = document.querySelector('[data-to-top]');

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle('is-stuck', y > 8);
    if (toTop) toTop.classList.toggle('is-visible', y > 600);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Hiện dần khi cuộn tới ---------- */

  var revealables = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revealables, function (el) {
      el.classList.add('is-visible');
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -60px 0px', threshold: 0.08 }
    );

    Array.prototype.forEach.call(revealables, function (el) {
      observer.observe(el);
    });
  }

  /* ---------- Ảnh chưa có file: thay bằng khung giữ chỗ ---------- */

  Array.prototype.forEach.call(document.querySelectorAll('img[data-fallback]'), function (img) {
    img.addEventListener('error', function () {
      var box = document.createElement('span');
      box.className = 'img-missing';
      box.textContent = img.getAttribute('data-fallback') || 'Ảnh';
      if (img.parentNode) img.parentNode.replaceChild(box, img);
    });
  });

  /* ---------- Form liên hệ ----------
     Website tĩnh nên không có máy chủ nhận form. Thay vì để nút bấm
     không làm gì cả, mình soạn sẵn một email đầy đủ nội dung và mở
     bằng ứng dụng mail của người gửi. */

  var mailForm = document.querySelector('[data-mailto-form]');

  if (mailForm) {
    mailForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Ô bẫy spam: robot điền vào thì im lặng bỏ qua
      var bot = mailForm.querySelector('[name="bot-field"]');
      if (bot && bot.value) return;

      var get = function (name) {
        var el = mailForm.querySelector('[name="' + name + '"]');
        return el ? el.value.trim() : '';
      };

      var ten = get('ten');
      var email = get('email');
      var chuDe = get('chu-de');
      var loiNhan = get('loi-nhan');

      var subject = 'Liên hệ từ website — ' + (chuDe || 'Chuyện khác');
      var body =
        'Tên: ' + ten + '\n' +
        'Email: ' + email + '\n' +
        'Chủ đề: ' + chuDe + '\n\n' +
        loiNhan + '\n';

      var to = mailForm.getAttribute('data-mailto');
      window.location.href =
        'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }

  /* ---------- Lọc bài viết theo chuyên mục ---------- */

  var chips = document.querySelectorAll('[data-filter]');
  var grid = document.querySelector('[data-post-grid]');
  var emptyMsg = document.querySelector('[data-empty-filter]');

  if (chips.length && grid) {
    Array.prototype.forEach.call(chips, function (chip) {
      chip.addEventListener('click', function () {
        var want = chip.getAttribute('data-filter');

        Array.prototype.forEach.call(chips, function (c) {
          c.classList.toggle('is-active', c === chip);
        });

        var shown = 0;
        Array.prototype.forEach.call(grid.children, function (card) {
          var match = want === '*' || card.getAttribute('data-category') === want;
          card.hidden = !match;
          if (match) shown++;
        });

        if (emptyMsg) emptyMsg.hidden = shown !== 0;
      });
    });
  }
})();
