/** Prefix a public/ path with the deploy base (e.g. /<repo>/). External URLs and anchors pass through. */
export function url(path: string): string {
  if (/^([a-z]+:|#|\/\/)/i.test(path)) return path;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}
