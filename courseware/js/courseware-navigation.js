export function isElementWithinActiveSlide(element) {
  return Boolean(element?.closest?.('.slide.is-active'));
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
