export type FullscreenDocumentLike = {
  fullscreenElement?: Element | null;
  webkitFullscreenElement?: Element | null;
  msFullscreenElement?: Element | null;
};

export type FullscreenTargetLike = {
  requestFullscreen?: () => Promise<void>;
  webkitRequestFullscreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
};

export function getActiveFullscreenElement(
  documentLike: FullscreenDocumentLike
) {
  return (
    documentLike.fullscreenElement ??
    documentLike.webkitFullscreenElement ??
    documentLike.msFullscreenElement ??
    null
  );
}

export function shouldRequestSharedPanoramaFullscreen(
  isSharedPanorama: boolean,
  fullscreenElement: Element | null
) {
  return isSharedPanorama && !fullscreenElement;
}

export async function requestSharedPanoramaFullscreen(
  target: FullscreenTargetLike,
  isSharedPanorama: boolean,
  fullscreenElement: Element | null
) {
  if (!shouldRequestSharedPanoramaFullscreen(isSharedPanorama, fullscreenElement)) {
    return false;
  }

  const requestFullscreen =
    target.requestFullscreen ??
    target.webkitRequestFullscreen ??
    target.msRequestFullscreen;

  if (!requestFullscreen) {
    return false;
  }

  await Promise.resolve(requestFullscreen.call(target));

  return true;
}
