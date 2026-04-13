export interface RGB { r: number; g: number; b: number }

function quantize(v: number, levels = 5): number {
  const step = 256 / levels;
  return Math.min(levels - 1, Math.floor(v / step)) * step + step / 2;
}

/**
 * Extract dominant colors from an array of RGBA or RGB pixels.
 * pixels: flat Uint8 array [r,g,b,(a),r,g,b,(a)...]
 */
export function extractPalette(pixels: ArrayLike<number>, options: { count?: number; stride?: number; levels?: number } = {}): RGB[] {
  const { count = 5, stride = 4, levels = 5 } = options;
  const buckets = new Map<string, { r: number; g: number; b: number; n: number }>();
  for (let i = 0; i < pixels.length; i += stride) {
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
    if (r === undefined || g === undefined || b === undefined) continue;
    if (stride === 4 && pixels[i + 3] === 0) continue;
    const qr = quantize(r, levels), qg = quantize(g, levels), qb = quantize(b, levels);
    const key = `${qr}_${qg}_${qb}`;
    const cur = buckets.get(key);
    if (cur) { cur.r += r; cur.g += g; cur.b += b; cur.n++; }
    else buckets.set(key, { r, g, b, n: 1 });
  }
  const sorted = [...buckets.values()].sort((a, b) => b.n - a.n);
  return sorted.slice(0, count).map(c => ({
    r: Math.round(c.r / c.n),
    g: Math.round(c.g / c.n),
    b: Math.round(c.b / c.n),
  }));
}

export function dominantColor(pixels: ArrayLike<number>, stride = 4): RGB {
  return extractPalette(pixels, { count: 1, stride })[0] ?? { r: 0, g: 0, b: 0 };
}

export function averageColor(pixels: ArrayLike<number>, stride = 4): RGB {
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < pixels.length; i += stride) {
    r += pixels[i]; g += pixels[i + 1]; b += pixels[i + 2]; n++;
  }
  return { r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) };
}

export function toHex(c: RGB): string {
  const h = (n: number) => n.toString(16).padStart(2, '0');
  return '#' + h(c.r) + h(c.g) + h(c.b);
}
