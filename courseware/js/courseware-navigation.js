export function isElementWithinActiveSlide(element) {
  return Boolean(element?.closest?.('.slide.is-active'));
}

export function canRevealDialogueResponseVideo(video) {
  return (video?.readyState ?? 0) >= 2;
}

export function shouldDeferHomeAdvanceForFullscreen({
  direction,
  activeSlideId,
  fullscreenElement,
  canRequestFullscreen
}) {
  return (
    direction === 'next' &&
    activeSlideId === 'home' &&
    canRequestFullscreen &&
    !fullscreenElement
  );
}
