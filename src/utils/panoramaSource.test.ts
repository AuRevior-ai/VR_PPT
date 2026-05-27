import { describe, expect, it } from 'vitest';
import { resolvePanoramaSource } from './panoramaSource';

const baseUrl = 'https://aurevior-ai.github.io/VR_PPT/';
const fallbackSrc = '/VR_PPT/assets/classroom/full_classroom_2to1.png';

describe('resolvePanoramaSource', () => {
  it('uses the fallback panorama when the URL has no source parameter', () => {
    expect(resolvePanoramaSource('', fallbackSrc, baseUrl)).toEqual({
      ok: true,
      src: fallbackSrc,
      fromQuery: false
    });
  });

  it('resolves a GitHub Pages asset path into an absolute source URL', () => {
    expect(
      resolvePanoramaSource(
        '?source=/VR_PPT_assets/playground.png',
        fallbackSrc,
        baseUrl
      )
    ).toEqual({
      ok: true,
      src: 'https://aurevior-ai.github.io/VR_PPT_assets/playground.png',
      fromQuery: true
    });
  });

  it('accepts an encoded https image URL', () => {
    expect(
      resolvePanoramaSource(
        '?source=https%3A%2F%2Faurevior-ai.github.io%2FVR_PPT_assets%2Fschool_gate.png',
        fallbackSrc,
        baseUrl
      )
    ).toEqual({
      ok: true,
      src: 'https://aurevior-ai.github.io/VR_PPT_assets/school_gate.png',
      fromQuery: true
    });
  });

  it('rejects Windows file paths because shared pages cannot read local disks', () => {
    const result = resolvePanoramaSource(
      '?source=D:%5Cuse_as_desktop%5CVR_PPT_assets%5Cplayground.png',
      fallbackSrc,
      baseUrl
    );

    if (result.ok) {
      throw new Error('Expected Windows file path source to be rejected');
    }

    expect(result.message).toContain('不能读取本机路径');
  });

  it('rejects file URLs because browsers block them on GitHub Pages', () => {
    const result = resolvePanoramaSource(
      '?source=file:///D:/use_as_desktop/VR_PPT_assets/playground.png',
      fallbackSrc,
      baseUrl
    );

    if (result.ok) {
      throw new Error('Expected file URL source to be rejected');
    }

    expect(result.message).toContain('不能读取本机路径');
  });
});
