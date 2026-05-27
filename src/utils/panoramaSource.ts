export type PanoramaSourceResolution =
  | {
      ok: true;
      src: string;
      fromQuery: boolean;
    }
  | {
      ok: false;
      message: string;
    };

const localPathMessage =
  '分享链接不能读取本机路径，请使用已上传到 GitHub Pages 的 https 图片链接';

function isWindowsPath(value: string) {
  return /^[a-zA-Z]:[\\/]/.test(value) || value.startsWith('\\\\');
}

function normalizeSourceValue(value: string) {
  if (value.startsWith('VR_PPT_assets/')) {
    return `/${value}`;
  }

  return value;
}

export function resolvePanoramaSource(
  search: string,
  fallbackSrc: string,
  baseUrl: string
): PanoramaSourceResolution {
  const params = new URLSearchParams(search);
  const rawSource = params.get('source')?.trim();

  if (!rawSource) {
    return {
      ok: true,
      src: fallbackSrc,
      fromQuery: false
    };
  }

  if (isWindowsPath(rawSource)) {
    return {
      ok: false,
      message: localPathMessage
    };
  }

  let sourceUrl: URL;

  try {
    sourceUrl = new URL(normalizeSourceValue(rawSource), baseUrl);
  } catch {
    return {
      ok: false,
      message: 'source 参数不是有效的图片链接'
    };
  }

  if (sourceUrl.protocol === 'file:') {
    return {
      ok: false,
      message: localPathMessage
    };
  }

  if (sourceUrl.protocol !== 'http:' && sourceUrl.protocol !== 'https:') {
    return {
      ok: false,
      message: 'source 参数仅支持 http 或 https 图片链接'
    };
  }

  return {
    ok: true,
    src: sourceUrl.href,
    fromQuery: true
  };
}
