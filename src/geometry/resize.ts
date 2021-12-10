import { IJS } from '../IJS';
import { getClamp } from '../utils/clamp';
import { getBorderInterpolation, BorderType } from '../utils/interpolateBorder';
import {
  getInterpolationFunction,
  InterpolationType,
} from '../utils/interpolatePixel';

export interface ResizeOptions {
  width?: number;
  height?: number;
  xFactor?: number;
  yFactor?: number;
  preserveAspectRatio?: boolean;
  interpolationType?: InterpolationType;
  borderType?: BorderType;
  borderValue?: number;
}

/**
 * Returns a resized copy of an image.
 *
 * @param image - Original image.
 * @param options - Resize options.
 * @returns The new image.
 */
export function resize(image: IJS, options: ResizeOptions): IJS {
  const {
    interpolationType = InterpolationType.BILINEAR,
    borderType = BorderType.CONSTANT,
    borderValue = 0,
  } = options;
  const { width, height } = checkOptions(image, options);
  const newImage = IJS.createFrom(image, { width, height });
  const interpolate = getInterpolationFunction(interpolationType);
  const interpolateBorder = getBorderInterpolation(borderType, borderValue);
  const clamp = getClamp(newImage);
  const intervalX = (image.width - 1) / (width - 1);
  const intervalY = (image.height - 1) / (height - 1);
  for (let row = 0; row < newImage.height; row++) {
    for (let column = 0; column < newImage.width; column++) {
      const nx = column * intervalX;
      const ny = row * intervalY;
      for (let channel = 0; channel < newImage.channels; channel++) {
        const newValue = interpolate(
          image,
          nx,
          ny,
          channel,
          interpolateBorder,
          clamp,
        );
        newImage.setValue(row, column, channel, newValue);
      }
    }
  }
  return newImage;
}

/**
 * @param image
 * @param options
 */
function checkOptions(
  image: IJS,
  options: ResizeOptions,
): { width: number; height: number; xFactor: number; yFactor: number } {
  const {
    width,
    height,
    xFactor,
    yFactor,
    preserveAspectRatio = true,
  } = options;

  if (
    width === undefined &&
    height === undefined &&
    xFactor === undefined &&
    yFactor === undefined
  ) {
    throw new Error(
      'At least one of the width, height, xFactor or yFactor options must be passed',
    );
  }

  let newWidth: number;
  let newHeight: number;

  const maybeWidth = getSize(width, xFactor, image.width, preserveAspectRatio);
  const maybeHeight = getSize(
    height,
    yFactor,
    image.height,
    preserveAspectRatio,
  );

  if (maybeWidth === undefined) {
    if (maybeHeight !== undefined) {
      newWidth = Math.round(maybeHeight * (image.width / image.height));
    } else {
      throw new Error('UNREACHABLE');
    }
  } else {
    newWidth = maybeWidth;
  }

  if (maybeHeight === undefined) {
    if (maybeWidth !== undefined) {
      newHeight = Math.round(maybeWidth * (image.height / image.width));
    } else {
      throw new Error('UNREACHABLE');
    }
  } else {
    newHeight = maybeHeight;
  }

  return {
    width: newWidth,
    height: newHeight,
    xFactor: xFactor ? xFactor : newWidth / image.width,
    yFactor: yFactor ? yFactor : newHeight / image.height,
  };
}

/**
 * @param sizeOpt
 * @param factor
 * @param sizeImg
 * @param preserveAspectRatio
 */
function getSize(
  sizeOpt: number | undefined,
  factor: number | undefined,
  sizeImg: number,
  preserveAspectRatio: boolean,
): number | undefined {
  if (sizeOpt === undefined) {
    if (factor !== undefined) {
      return Math.round(sizeImg * factor);
    } else if (!preserveAspectRatio) {
      return sizeImg;
    }
  } else if (factor !== undefined) {
    throw new Error('factor must not be passed with size');
  } else {
    return sizeOpt;
  }
  return undefined;
}