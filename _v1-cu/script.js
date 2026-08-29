/* =========================================================
   TIẾNG HÀN CÙNG QUEENIE — interactions
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.querySelector(".main-nav");
  const backTop = document.querySelector(".back-to-top");
  const navLinks = [...document.querySelectorAll(".main-nav a")];

  // Mobile navigation
  menuToggle?.addEventListener("click", () => {
    const isOpen = menuToggle.classList.toggle("open");
    mainNav.classList.toggle("open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      menuToggle?.classList.remove("open");
      mainNav?.classList.remove("open");
      document.body.classList.remove("menu-open");
      menuToggle?.setAttribute("aria-expanded", "false");
    });
  });

  // Header shadow + back-to-top
  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle("scrolled", y > 12);
    backTop?.classList.toggle("show", y > 650);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Reveal on scroll
  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add("is-visible"));
  }

  // Highlight current navigation item
  const sections = [...document.querySelectorAll("main section[id]")];

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${id}`
          );
        });
      });
    }, {
      rootMargin: "-35% 0px -55% 0px",
      threshold: 0
    });

    sections.forEach(section => sectionObserver.observe(section));
  }

  // Subtle hero decoration movement
  const hero = document.querySelector(".hero");
  const orbitOne = document.querySelector(".orbit-one");
  const orbitTwo = document.querySelector(".orbit-two");

  if (hero && orbitOne && orbitTwo && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      orbitOne.style.transform = `translate(${x * 8}px, ${y * 8}px)`;
      orbitTwo.style.transform = `translate(${x * -5}px, ${y * -5}px) rotate(20deg)`;
    });

    hero.addEventListener("pointerleave", () => {
      orbitOne.style.transform = "";
      orbitTwo.style.transform = "";
    });
  }
});
