// Muted autoplay while a video is on screen; paused when it leaves.
// Skipped entirely under prefers-reduced-motion. Controls stay visible, and
// once the reader touches the controls we stop managing that video.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const videos = document.querySelectorAll<HTMLVideoElement>('video[data-autoplay-on-view]');

if (!reduce && 'IntersectionObserver' in window && videos.length) {
  const manual = new WeakSet<HTMLVideoElement>();
  videos.forEach((v) => {
    const markManual = () => manual.add(v);
    v.addEventListener('pointerdown', markManual);
    v.addEventListener('keydown', markManual);
  });

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const v = e.target as HTMLVideoElement;
        if (manual.has(v)) continue;
        if (e.isIntersecting) {
          v.muted = true;
          v.play().catch(() => {});
        } else if (!v.paused) {
          v.pause();
        }
      }
    },
    { threshold: 0.6 },
  );
  videos.forEach((v) => io.observe(v));
}
