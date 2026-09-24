// Responsive sources for post covers; the WebP copies come from scripts/optimize-covers.mjs.
const base = (image: string) => image.replace(/\.(png|jpe?g)$/i, "");

export const isOptimizable = (image: string) => /^\/covers\/.+\.(png|jpe?g)$/i.test(image);

export function coverSources(image: string) {
  if (!isOptimizable(image)) return { src: image };
  return {
    src: `${base(image)}-1200.webp`,
    srcSet: `${base(image)}-480.webp 480w, ${base(image)}-800.webp 800w, ${base(image)}-1200.webp 1200w`,
  };
}
