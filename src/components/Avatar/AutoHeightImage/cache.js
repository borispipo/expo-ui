import { Image } from 'react-native';
import { resolveAssetSource } from '$ecomponents/Image/utils';

/**
 * store with
 *  key: image
 *  value: {
 *      width: 100,
 *      height: 100,
 *  }
 */
const cache = new Map();

const getImageSizeFromCache = (image) => {
  if (typeof image === 'number') {
    return cache.get(image);
  } else {
    return cache.get(image.uri);
  }
};

const loadImageSize = (image) => {
  return new Promise((resolve, reject) => {
    //number indicates import X or require(X) was used (i.e. local file)
    if (typeof image === 'number') {
      const { width, height } = defaultObj(resolveAssetSource(image));
      resolve({ width, height });
    } else {
      Image.getSize(
        image.uri,
        (width, height) => {
          // success
          resolve({ width, height });
        },
        reject
      );
    }
  });
};

export const getImageSizeFitWidthFromCache = (image, toWidth, maxHeight) => {
  const size = getImageSizeFromCache(image);
  if (size) {
    const { width, height } = size;
    if (!width || !height) return { width: 0, height: 0 };
    const scaledHeight = (toWidth * height) / width;
    return {
      width: toWidth,
      height: scaledHeight > maxHeight ? maxHeight : scaledHeight
    };
  }
  return {};
};

const getImageSizeMaybeFromCache = async (image) => {
  let size = getImageSizeFromCache(image);
  if (!size) {
    size = await loadImageSize(image);
    if (typeof image === 'number') {
      cache.set(image, size);
    } else {
      cache.set(image.uri, size);
    }
  }
  return size;
};

export const getImageSizeFitWidth = async (image, toWidth, maxHeight) => {
  const { width, height } = await getImageSizeMaybeFromCache(image);
  if (!width || !height) return { width: 0, height: 0 };
  const scaledHeight = (toWidth * height) / width;
  return {
    width: toWidth,
    height: scaledHeight > maxHeight ? maxHeight : scaledHeight
  };
};