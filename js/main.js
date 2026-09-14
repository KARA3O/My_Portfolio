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
  const roles = ["Computer Science Student", "Full-Stack Developer", "ML Enthusiast", "Problem Solver"];
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