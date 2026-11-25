// Reveal-on-scroll. Elements with .reveal fade up once when they enter the
// viewport. Without IntersectionObserver (or JS), everything is simply visible.
const items = document.querySelectorAll<HTMLElement>('.reveal');

if (!('IntersectionObserver' in window)) {
  items.forEach((el) => (el.dataset.visible = 'true'));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        (e.target as HTMLElement).dataset.visible = 'true';
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
  );
  items.forEach((el) => io.observe(el));
}
