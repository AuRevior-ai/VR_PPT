import {
  ImageDimensions,
  isEquirectangularPanorama
} from './panoramaDetection';

export type PanoramaUploadValidation =
  | { ok: true }
  | { ok: false; message: string };

export function validatePanoramaUploadDimensions(
  dimensions: ImageDimensions
): PanoramaUploadValidation {
  if (
    !Number.isFinite(dimensions.width) ||
    !Number.isFinite(dimensions.height) ||
    dimensions.width <= 0 ||
    dimensions.height <= 0
  ) {
    return {
      ok: false,
      message: '无法读取图片尺寸'
    };
  }

  if (!isEquirectangularPanorama(dimensions)) {
    return {
      ok: false,
      message: '请上传接近 2:1 比例的全景图'
    };
  }

  return { ok: true };
}
