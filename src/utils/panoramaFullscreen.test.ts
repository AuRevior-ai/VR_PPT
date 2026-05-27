import { describe, expect, it, vi } from 'vitest';
import {
  getActiveFullscreenElement,
  requestSharedPanoramaFullscreen,
  shouldRequestSharedPanoramaFullscreen
} from './panoramaFullscreen';

describe('panorama fullscreen helpers', () => {
  it('does not request fullscreen for the default upload page', () => {
    expect(shouldRequestSharedPanoramaFullscreen(false, null)).toBe(false);
  });

  it('does not request fullscreen when the document is already fullscreen', () => {
    expect(
      shouldRequestSharedPanoramaFullscreen(true, {} as Element)
    ).toBe(false);
  });

  it('requests fullscreen for a shared source page before fullscreen is active', () => {
    expect(shouldRequestSharedPanoramaFullscreen(true, null)).toBe(true);
  });

  it('reads standard and legacy fullscreen elements', () => {
    const standardElement = {} as Element;
    const legacyElement = {} as Element;

    expect(
      getActiveFullscreenElement({
        fullscreenElement: standardElement
      })
    ).toBe(standardElement);
    expect(
      getActiveFullscreenElement({
        fullscreenElement: null,
        webkitFullscreenElement: legacyElement
      })
    ).toBe(legacyElement);
  });

  it('requests fullscreen through the standard API when available', async () => {
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);

    await expect(
      requestSharedPanoramaFullscreen(
        { requestFullscreen },
        true,
        null
      )
    ).resolves.toBe(true);
    expect(requestFullscreen).toHaveBeenCalledOnce();
  });

  it('falls back to the legacy webkit fullscreen API', async () => {
    const webkitRequestFullscreen = vi.fn();

    await expect(
      requestSharedPanoramaFullscreen(
        { webkitRequestFullscreen },
        true,
        null
      )
    ).resolves.toBe(true);
    expect(webkitRequestFullscreen).toHaveBeenCalledOnce();
  });

  it('skips fullscreen when no browser API is available', async () => {
    await expect(
      requestSharedPanoramaFullscreen({}, true, null)
    ).resolves.toBe(false);
  });
});
