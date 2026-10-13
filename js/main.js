/* ============================================================
   main.js — shared behaviour across all pages
   ============================================================ */

/* ---------- Theme toggle (remembers your choice) ---------- */
const root = document.documentElement;
if (localStorage.getItem("theme")) root.dataset.theme = localStorage.getItem("theme");

const themeBtn = document.getElementById("theme-toggle");
if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", root.dataset.theme);
  });
}

/* ---------- Mobile menu ---------- */
const menu = document.getElementById("mobile-menu");
const burger = document.getElementById("hamburger");
if (burger && menu) {
  burger.addEventListener("click", () => menu.classList.toggle("open"));
  menu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => menu.classList.remove("open"))
  );
}

/* ---------- Scroll progress bar ---------- */
const bar = document.getElementById("progress");
if (bar) {
  addEventListener("scroll", () => {
    const h = document.documentElement;
    bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + "%";
  });
}

/* ---------- Scroll reveal animations ---------- */
const revealObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        revealObs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));

/* ---------- Typewriter (home page only — guarded) ---------- */
const tw = document.getElementById("typewriter");
if (tw) {
  // ✏️ CHANGE: the roles that rotate in the hero
  const roles = ["Computer Science Graduate", "Full-Stack Developer", "Software Developer", "Problem Solver"];
  let r = 0, c = 0, deleting = false;
  (function type() {
    const word = roles[r];
    tw.textContent = word.slice(0, c);
    if (!deleting && c < word.length) { c++; setTimeout(type, 70); }
    else if (!deleting) { deleting = true; setTimeout(type, 1800); }
    else if (c > 0) { c--; setTimeout(type, 35); }
    else { deleting = false; r = (r + 1) % roles.length; setTimeout(type, 400); }
  })();
}

/* ---------- Contact form (FormSubmit AJAX) ---------- */
const contactForm = document.getElementById("contact-form");
if (contactForm) {
  const formStatus = document.getElementById("form-status");
  const urlField = contactForm.querySelector('input[name="_url"]');
  if (urlField) urlField.value = window.location.href;

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { "Accept": "application/json" }
      });
      const result = await response.json();
      if (!response.ok || result.success === false) throw new Error("Submission failed");

      contactForm.reset();
      if (formStatus) {
        formStatus.textContent = "Message sent successfully. Thank you for reaching out!";
        formStatus.classList.add("success");
      }
    } catch (error) {
      if (formStatus) {
        formStatus.textContent = "Something went wrong. Please email me directly at thindisakarabo77@gmail.com.";
        formStatus.classList.add("error");
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

/* ---------- Experience: timeline tabs ---------- */
document.querySelectorAll(".timeline-item .tabs").forEach((tabs) => {
  const item = tabs.closest(".timeline-item");
  tabs.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.querySelectorAll(".tab-btn").forEach((b) => {
        const on = b === btn;
        b.classList.toggle("active", on);
        b.setAttribute("aria-selected", on);
      });
      item.querySelectorAll(".tab-panel").forEach((p) =>
        p.classList.toggle("active", p.dataset.panel === btn.dataset.tab)
      );
    });
  });
});

/* ---------- Lightbox (gallery photos + certificate images) ---------- */
(function () {
  const triggers = document.querySelectorAll(".gallery-item, [data-cert]");
  if (!triggers.length) return;

  const box = document.createElement("div");
  box.className = "lightbox";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.innerHTML =
    '<button class="lightbox-btn lightbox-close" aria-label="Close">&times;</button>' +
    '<button class="lightbox-btn lightbox-prev" aria-label="Previous">&#8249;</button>' +
    '<img alt="" />' +
    '<div class="lightbox-caption"></div>' +
    '<button class="lightbox-btn lightbox-next" aria-label="Next">&#8250;</button>';
  document.body.appendChild(box);
  const img = box.querySelector("img");
  const cap = box.querySelector(".lightbox-caption");
  let set = [], idx = 0;

  const show = () => {
    img.src = set[idx].src;
    img.alt = set[idx].caption;
    cap.textContent = set[idx].caption;
  };
  const open = (list, i) => {
    set = list; idx = i;
    box.classList.toggle("single", list.length < 2);
    show();
    box.classList.add("open");
  };
  const close = () => box.classList.remove("open");
  const step = (d) => { idx = (idx + d + set.length) % set.length; show(); };

  box.querySelector(".lightbox-close").addEventListener("click", close);
  box.querySelector(".lightbox-prev").addEventListener("click", () => step(-1));
  box.querySelector(".lightbox-next").addEventListener("click", () => step(1));
  box.addEventListener("click", (e) => { if (e.target === box) close(); });
  addEventListener("keydown", (e) => {
    if (!box.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft" && set.length > 1) step(-1);
    if (e.key === "ArrowRight" && set.length > 1) step(1);
  });

  // Photo galleries: each gallery is its own slideshow
  document.querySelectorAll(".gallery").forEach((g) => {
    const items = [...g.querySelectorAll(".gallery-item")];
    const list = items.map((b) => ({ src: b.dataset.full, caption: b.dataset.caption || "" }));
    items.forEach((b, i) => b.addEventListener("click", () => open(list, i)));
  });

  // Certificates: a card/slot with data-cert="path" switches its View button on
  document.querySelectorAll("[data-cert]").forEach((el) => {
    const path = (el.dataset.cert || "").trim();
    const btn = el.querySelector(".cert-view");
    if (!btn || !path) return;
    btn.disabled = false;
    const t = el.dataset.title || (el.querySelector("h3,h4") || {}).textContent || "Certificate";
    const p = el.querySelector("p");
    if (p) p.textContent = "Certificate available";
    btn.addEventListener("click", () => {
      if (/\.pdf($|\?)/i.test(path)) window.open(path, "_blank", "noopener");
      else open([{ src: path, caption: t }], 0);
    });
  });
})();
