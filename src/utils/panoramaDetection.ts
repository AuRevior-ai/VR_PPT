export type ImageDimensions = {
  width: number;
  height: number;
};

export function isEquirectangularPanorama(
  dimensions: ImageDimensions,
  tolerance = 0.08
) {
  if (
    !Number.isFinite(dimensions.width) ||
    !Number.isFinite(dimensions.height) ||
    dimensions.width <= 0 ||
    dimensions.height <= 0
  ) {
    return false;
  }

  const ratio = dimensions.width / dimensions.height;

  return Math.abs(ratio - 2) <= tolerance;
}

export function loadImageDimensions(src: string) {
  return new Promise<ImageDimensions>((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      resolve({
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height
      });
    };

    image.onerror = () => {
      reject(new Error(`Unable to load image dimensions: ${src}`));
    };

    image.decoding = 'async';
    image.src = src;
  });
}
