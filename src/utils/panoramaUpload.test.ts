import { describe, expect, it } from 'vitest';
import { validatePanoramaUploadDimensions } from './panoramaUpload';

describe('validatePanoramaUploadDimensions', () => {
  it('accepts an uploaded 2:1 panorama image', () => {
    expect(
      validatePanoramaUploadDimensions({ width: 4096, height: 2048 })
    ).toEqual({
      ok: true
    });
  });

  it('rejects a regular classroom illustration', () => {
    expect(
      validatePanoramaUploadDimensions({ width: 1920, height: 1080 })
    ).toEqual({
      ok: false,
      message: '请上传接近 2:1 比例的全景图'
    });
  });

  it('rejects unreadable image dimensions', () => {
    expect(validatePanoramaUploadDimensions({ width: 0, height: 0 })).toEqual({
      ok: false,
      message: '无法读取图片尺寸'
    });
  });
});
