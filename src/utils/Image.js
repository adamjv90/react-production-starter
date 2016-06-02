export const domain = 'http://o.aolcdn.com/smp/is';

export function resize(src, width, height) {
  if (!src) return src;
  const extRx = /\.(gif|jpg|jpeg|tiff|png)$/i;
  const ext = typeof src === 'string' ? src.match(extRx) : '';
  src = typeof src === 'string' ? src.replace(domain, '').replace(/\$![0-9]*?x?[0-9]*?\.[^$]+$/, Array.isArray(ext) && ext.length ? ext[0] : '') : '';
  return ext !== null ? domain + src.replace(extRx, '') + '$!' + (width ? width : '') + 'x' + (height ? height : '') + ext[0] : false;
}
