/**
 * Utilitário puro de conversão de cores CSS3/CSS4 para RGB/RGBA.
 * Garante compatibilidade total com o html2canvas e motores de impressão em PDF.
 */

export const parseOklabStringToRgb = (input: string): string => {
  if (!input || !input.includes('oklab')) return input;

  return input.replace(/oklab\s*\(\s*([^)]+)\s*\)/gi, (fullMatch, paramsStr) => {
    try {
      const parts = paramsStr.trim().split(/\s*\/\s*/);
      const colorParts = parts[0].trim().split(/\s+/);

      if (colorParts.length < 3) return '#000000';

      const lRaw = colorParts[0];
      const aRaw = colorParts[1];
      const bRaw = colorParts[2];

      const L = lRaw.endsWith('%') ? parseFloat(lRaw) / 100 : parseFloat(lRaw);
      const a_lab = aRaw.endsWith('%') ? parseFloat(aRaw) / 100 : parseFloat(aRaw);
      const b_lab = bRaw.endsWith('%') ? parseFloat(bRaw) / 100 : parseFloat(bRaw);

      if (isNaN(L) || isNaN(a_lab) || isNaN(b_lab)) return '#000000';

      let alpha = 1;
      if (parts[1]) {
        const aAlphaRaw = parts[1].trim();
        alpha = aAlphaRaw.endsWith('%') ? parseFloat(aAlphaRaw) / 100 : parseFloat(aAlphaRaw);
        if (isNaN(alpha)) alpha = 1;
      }

      // OKLAB -> LMS
      const l_ = L + 0.3963377774 * a_lab + 0.2158037573 * b_lab;
      const m_ = L - 0.1055613458 * a_lab - 0.0638541728 * b_lab;
      const s_ = L - 0.0894841775 * a_lab - 1.2914855480 * b_lab;

      const l3 = l_ * l_ * l_;
      const m3 = m_ * m_ * m_;
      const s3 = s_ * s_ * s_;

      // LMS -> Linear sRGB
      const r_lin = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
      const g_lin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
      const b_lin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

      const gamma = (x: number) => {
        if (x <= 0) return 0;
        if (x >= 1) return 255;
        const abs = x > 0.0031308 ? 1.055 * Math.pow(x, 1 / 2.4) - 0.055 : 12.92 * x;
        return Math.min(255, Math.max(0, Math.round(abs * 255)));
      };

      const r = gamma(r_lin);
      const g = gamma(g_lin);
      const b = gamma(b_lin);

      if (alpha < 1) {
        return `rgba(${r}, ${g}, ${b}, ${Number(alpha.toFixed(3))})`;
      }
      return `rgb(${r}, ${g}, ${b})`;
    } catch {
      return '#000000';
    }
  });
};

export const parseOklchStringToRgb = (input: string): string => {
  if (!input || !input.includes('oklch')) return input;

  return input.replace(/oklch\s*\(\s*([^)]+)\s*\)/gi, (fullMatch, paramsStr) => {
    try {
      const parts = paramsStr.trim().split(/\s*\/\s*/);
      const colorParts = parts[0].trim().split(/\s+/);

      if (colorParts.length < 3) return '#000000';

      const lRaw = colorParts[0];
      const cRaw = colorParts[1];
      const hRaw = colorParts[2];

      const L = lRaw.endsWith('%') ? parseFloat(lRaw) / 100 : parseFloat(lRaw);
      const C = cRaw.endsWith('%') ? parseFloat(cRaw) / 100 : parseFloat(cRaw);

      let H = parseFloat(hRaw);
      if (hRaw.endsWith('deg')) H = parseFloat(hRaw);
      else if (hRaw.endsWith('rad')) H = (parseFloat(hRaw) * 180) / Math.PI;
      else if (hRaw.endsWith('turn')) H = parseFloat(hRaw) * 360;

      if (isNaN(L) || isNaN(C) || isNaN(H)) return '#000000';

      let alpha = 1;
      if (parts[1]) {
        const aAlphaRaw = parts[1].trim();
        alpha = aAlphaRaw.endsWith('%') ? parseFloat(aAlphaRaw) / 100 : parseFloat(aAlphaRaw);
        if (isNaN(alpha)) alpha = 1;
      }

      // OKLCH -> OKLAB
      const hRad = (H * Math.PI) / 180;
      const a_lab = C * Math.cos(hRad);
      const b_lab = C * Math.sin(hRad);

      // OKLAB -> LMS
      const l_ = L + 0.3963377774 * a_lab + 0.2158037573 * b_lab;
      const m_ = L - 0.1055613458 * a_lab - 0.0638541728 * b_lab;
      const s_ = L - 0.0894841775 * a_lab - 1.2914855480 * b_lab;

      const l3 = l_ * l_ * l_;
      const m3 = m_ * m_ * m_;
      const s3 = s_ * s_ * s_;

      // LMS -> Linear sRGB
      const r_lin = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
      const g_lin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
      const b_lin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

      const gamma = (x: number) => {
        if (x <= 0) return 0;
        if (x >= 1) return 255;
        const abs = x > 0.0031308 ? 1.055 * Math.pow(x, 1 / 2.4) - 0.055 : 12.92 * x;
        return Math.min(255, Math.max(0, Math.round(abs * 255)));
      };

      const r = gamma(r_lin);
      const g = gamma(g_lin);
      const b = gamma(b_lin);

      if (alpha < 1) {
        return `rgba(${r}, ${g}, ${b}, ${Number(alpha.toFixed(3))})`;
      }
      return `rgb(${r}, ${g}, ${b})`;
    } catch {
      return '#000000';
    }
  });
};

export const parseColorSrgbStringToRgb = (input: string): string => {
  if (!input || !input.includes('color(')) return input;

  return input.replace(/color\s*\(\s*srgb\s+([^)]+)\)/gi, (fullMatch, paramsStr) => {
    try {
      const parts = paramsStr.trim().split(/\s*\/\s*/);
      const colorParts = parts[0].trim().split(/\s+/);
      if (colorParts.length < 3) return '#000000';

      const parseVal = (v: string) => (v.endsWith('%') ? (parseFloat(v) / 100) * 255 : parseFloat(v) * 255);
      const r = Math.min(255, Math.max(0, Math.round(parseVal(colorParts[0]))));
      const g = Math.min(255, Math.max(0, Math.round(parseVal(colorParts[1]))));
      const b = Math.min(255, Math.max(0, Math.round(parseVal(colorParts[2]))));

      let alpha = 1;
      if (parts[1]) {
        const aAlphaRaw = parts[1].trim();
        alpha = aAlphaRaw.endsWith('%') ? parseFloat(aAlphaRaw) / 100 : parseFloat(aAlphaRaw);
        if (isNaN(alpha)) alpha = 1;
      }

      if (alpha < 1) {
        return `rgba(${r}, ${g}, ${b}, ${Number(alpha.toFixed(3))})`;
      }
      return `rgb(${r}, ${g}, ${b})`;
    } catch {
      return '#000000';
    }
  });
};

export const parseLightDarkStringToRgb = (input: string): string => {
  if (!input || !input.includes('light-dark')) return input;

  return input.replace(/light-dark\s*\(\s*([^,]+)\s*,\s*([^)]+)\)/gi, (fullMatch, lightColor) => {
    return lightColor.trim();
  });
};

export const parseColorMixStringToRgb = (input: string): string => {
  if (!input || !input.includes('color-mix')) return input;

  return input.replace(/color-mix\s*\([^)]*\)/gi, () => '#000000');
};

export const convertAllUnsupportedColors = (input: string): string => {
  if (!input) return input;
  let res = input;
  if (res.includes('oklch')) res = parseOklchStringToRgb(res);
  if (res.includes('oklab')) res = parseOklabStringToRgb(res);
  if (res.includes('color(')) res = parseColorSrgbStringToRgb(res);
  if (res.includes('light-dark')) res = parseLightDarkStringToRgb(res);
  if (res.includes('color-mix')) res = parseColorMixStringToRgb(res);
  return res;
};
