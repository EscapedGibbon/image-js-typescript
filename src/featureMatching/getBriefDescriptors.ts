import { Image, ImageColorModel, ImageCoordinates } from '../Image';
import { GaussianBlurOptions } from '../filters';
import { crop } from '../operations';
import { writeSync } from '../save';
import checkProcessable from '../utils/checkProcessable';
import { InterpolationType } from '../utils/interpolatePixel';

import { OrientedFastKeypoint } from './getOrientedFastKeypoints';
import { compareIntensity } from './utils/compareIntensity';
import { extractSquareImage } from './utils/extractSquareImage';
import {
  getGaussianPoints,
  GetGaussianPointsOptions,
} from './utils/getGaussianPoints';

export interface GetBriefDescriptorsOptions {
  /**
   * Options to smooth the image patch before comparing pairs of points.
   */
  smoothingOptions?: GaussianBlurOptions;
  /**
   * Options to modify the gaussian distribution used to generate the points to compare.
   */
  pointsDistributionOptions?: Omit<GetGaussianPointsOptions, 'nbPoints'>;
  /**
   * Size of the patch around the keypoint used to compute the descriptor.
   *
   * @default 31
   */
  patchSize?: number;
  /**
   * Number of bits of the final descriptor.
   *
   * @default 512
   */
  descriptorLength?: 128 | 256 | 512;
}

export type BriefDescriptor = Uint8Array;

/**
 * Generate the rBRIEF descriptors for the desired keypoints of an image.
 * The rBRIEF descriptors are presented in these articles:
 * - ORB article: DOI: 10.1109/ICCV.2011.6126544
 * - rBRIEF article: DOI: 10.1007/978-3-642-15561-1_56
 *
 * @param image - Source image of the keypoints.
 * @param keypoints - Keypoints for which the descriptors are wanted.
 * @param options - Get rotated BRIEF descriptors options
 * @returns The descriptors for the given keypoints.
 */
export function getBriefDescriptors(
  image: Image,
  keypoints: OrientedFastKeypoint[],
  options: GetBriefDescriptorsOptions = {},
): BriefDescriptor[] {
  const {
    patchSize = 31,
    descriptorLength = 256,
    smoothingOptions = { sigma: Math.sqrt(2), size: 9 },
    pointsDistributionOptions,
  } = options;

  checkProcessable(image, 'getBriefDescriptors', {
    alpha: false,
    colorModel: ImageColorModel.GREY,
  });

  if (!(patchSize % 2)) {
    throw new Error('getBriefDescriptors: patchSize should be an odd integer');
  }

  const gaussianPoints = getGaussianPoints(patchSize, patchSize, {
    ...pointsDistributionOptions,
    nbPoints: descriptorLength * 2,
  });

  const smoothed = image.gaussianBlur(smoothingOptions);

  writeSync('src/featureMatching/__tests__/smoothed.png', smoothed);

  const descriptors: Uint8Array[] = [];

  for (let keypoint of keypoints) {
    // crop smallest square surrounding the tilted patch of the keypoint
    // todo: verify the crop width -> should it be odd??
    const cropWidth = Math.ceil(
      patchSize *
        (Math.abs(Math.cos(keypoint.angle)) +
          Math.abs(Math.sin(keypoint.angle))),
    );

    const cropped = extractSquareImage(smoothed, keypoint.origin, cropWidth);

    writeSync('src/featureMatching/__tests__/cropped.png', cropped);

    const rotateCenter = cropped.getCoordinates(ImageCoordinates.CENTER);
    const rotated = cropped.rotate(keypoint.angle, {
      center: rotateCenter,
      interpolationType: InterpolationType.NEAREST,
    });
    writeSync('src/featureMatching/__tests__/rotated.png', rotated);

    const cropCenter = rotated.getCoordinates(ImageCoordinates.CENTER);
    const cropOrigin = { column: cropCenter[0], row: cropCenter[1] };
    console.log({ cropOrigin });
    const patch = extractSquareImage(rotated, cropOrigin, patchSize);
    writeSync('src/featureMatching/__tests__/patch.png', patch);

    const descriptor = new Uint8Array(descriptorLength);
    for (let i = 0; i < descriptorLength; i++) {
      const p1 = gaussianPoints[i];
      const p2 = gaussianPoints[i + descriptorLength];
      descriptor[i] = Number(compareIntensity(patch, p1, p2));
    }
    descriptors.push(descriptor);
  }

  return descriptors;
}
