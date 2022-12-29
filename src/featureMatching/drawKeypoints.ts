import { Image, ImageColorModel } from '../Image';

import { FastKeypoint } from './getFastKeypoints';

export interface DrawKeypointsOptions {
  /**
   * Circles diameter in pixels.
   */
  circleDiameter?: 10;
  /**
   * Annotations color.
   *
   * @default [255,0,0]
   */
  color?: number[];
}

/**
 *
 * @param image
 * @param keypoints
 * @param options
 */
export function drawKeypoints(
  image: Image,
  keypoints: FastKeypoint[],
  options: DrawKeypointsOptions = {},
): Image {
  const { circleDiameter = 10, color = [255, 0, 0] } = options;

  if (image.colorModel !== ImageColorModel.RGB) {
    image = image.convertColor(ImageColorModel.RGB);
  }
  for (let keypoint of keypoints) {
    image.drawCircle(keypoint.origin, circleDiameter / 2, {
      color,
      out: image,
    });
  }

  return image;
}
