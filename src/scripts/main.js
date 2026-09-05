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
      // threshold phải là 0: khối nội dung cao hơn màn hình thì không bao giờ
      // đạt được tỉ lệ hiển thị lớn, để 0.08 sẽ khiến nó không bao giờ hiện ra.
      { rootMargin: '0px 0px -60px 0px', threshold: 0 }
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

  /* ---------- Hạn chế sao chép nội dung tài liệu ----------
     Chỉ là rào cản với người đọc thông thường. Không thể chặn tuyệt đối:
     ai muốn lấy vẫn xem được mã nguồn, tắt JavaScript hoặc chụp màn hình. */

  var sheet = document.querySelector('.doc-sheet');

  if (sheet) {
    ['copy', 'cut', 'dragstart'].forEach(function (evt) {
      sheet.addEventListener(evt, function (e) {
        e.preventDefault();
      });
    });

    sheet.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    });
  }

  /* ---------- Lọc bài viết theo thẻ ----------
     Bấm một thẻ: các bài mang thẻ đó được gom lên đầu, những bài còn lại
     xếp xuống dưới mục "Bài viết khác" chứ không bị ẩn đi. Thẻ đang chọn
     được ghi vào địa chỉ (?tag=…) nên có thể chia sẻ hoặc tải lại trang. */

  var chips = document.querySelectorAll('[data-filter]');
  var grid = document.querySelector('[data-post-grid]');
  var emptyMsg = document.querySelector('[data-empty-filter]');

  if (chips.length && grid) {
    var cards = Array.prototype.slice.call(grid.children);

    var headMatch = document.createElement('h2');
    headMatch.className = 'post-group-head';
    headMatch.hidden = true;

    var headRest = document.createElement('h2');
    headRest.className = 'post-group-head is-rest';
    headRest.textContent = 'Bài viết khác';
    headRest.hidden = true;

    function applyFilter(want) {
      var match = [];
      var rest = [];

      cards.forEach(function (card) {
        var tags = (card.getAttribute('data-tags') || '').split('|');
        if (want === '*' || tags.indexOf(want) !== -1) match.push(card);
        else rest.push(card);
      });

      Array.prototype.forEach.call(chips, function (c) {
        c.classList.toggle('is-active', c.getAttribute('data-filter') === want);
      });

      headMatch.hidden = want === '*' || match.length === 0;
      headMatch.textContent = 'Thẻ: ' + want;
      headRest.hidden = want === '*' || rest.length === 0;

      grid.appendChild(headMatch);
      match.forEach(function (c) { grid.appendChild(c); });
      grid.appendChild(headRest);
      rest.forEach(function (c) { grid.appendChild(c); });

      if (emptyMsg) emptyMsg.hidden = !(want !== '*' && match.length === 0);
    }

    Array.prototype.forEach.call(chips, function (chip) {
      chip.addEventListener('click', function () {
        var want = chip.getAttribute('data-filter');
        applyFilter(want);

        if (window.history && window.history.replaceState) {
          var url = window.location.pathname + (want === '*' ? '' : '?tag=' + encodeURIComponent(want));
          window.history.replaceState(null, '', url);
        }
      });
    });

    // Thẻ đến từ địa chỉ, ví dụ /blog.html?tag=TOPIK
    var fromUrl = (function () {
      var m = /[?&]tag=([^&]*)/.exec(window.location.search);
      if (!m) return null;
      try { return decodeURIComponent(m[1].replace(/\+/g, ' ')); } catch (e) { return null; }
    })();

    if (fromUrl) {
      var known = false;
      Array.prototype.forEach.call(chips, function (c) {
        if (c.getAttribute('data-filter') === fromUrl) known = true;
      });
      if (known) applyFilter(fromUrl);
    }
  }
})();
