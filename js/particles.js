/* ============================================================
   particles.js — animated network background (all pages)
   ============================================================ */
(function () {
  const canvas = document.getElementById("particles");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let parts = [];

  function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
  addEventListener("resize", resize);
  resize();

  const COUNT = Math.min(70, Math.floor(innerWidth / 20));
  for (let i = 0; i < COUNT; i++) {
    parts.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 1.8 + 0.6,
    });
  }

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  (function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(140,140,180,0.6)";
      ctx.fill();
    }
    for (let i = 0; i < parts.length; i++) {
      for (let j = i + 1; j < parts.length; j++) {
        const dx = parts[i].x - parts[j].x, dy = parts[i].y - parts[j].y;
        const d = Math.hypot(dx, dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(parts[i].x, parts[i].y);
          ctx.lineTo(parts[j].x, parts[j].y);
          ctx.strokeStyle = `rgba(99,102,241,${0.14 * (1 - d / 120)})`;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  })();
})();