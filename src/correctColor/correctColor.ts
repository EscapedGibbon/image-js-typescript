import { RgbColor } from 'colord';
import MLR from 'ml-regression-multivariate-linear';

import { IJS, ImageColorModel } from '../IJS';
import checkProcessable from '../utils/checkProcessable';
import { getClamp } from '../utils/clamp';

import {
  formatInputForMlr,
  formatReferenceForMlr,
} from './__tests__/testUtil/formatData';

/**
 * Correct the colors in an image using the reference colors.
 *
 * @param image - Image to process.
 * @param measuredColors - Colors from the image, which will be compared to the reference.
 * @param referenceColors - Reference colors.
 * @returns Image with the colors corrected.
 */
export function correctColor(
  image: IJS,
  measuredColors: RgbColor[],
  referenceColors: RgbColor[],
): IJS {
  checkProcessable(image, 'correctColor', {
    colorModel: [ImageColorModel.RGB, ImageColorModel.RGBA],
  });

  const inputData = formatInputForMlr(measuredColors, image.maxValue);
  const referenceData = formatReferenceForMlr(referenceColors, image.maxValue);

  const mlrRed = new MLR(inputData, referenceData.r);
  const mlrGreen = new MLR(inputData, referenceData.g);
  const mlrBlue = new MLR(inputData, referenceData.b);

  const result = IJS.createFrom(image);

  for (let row = 0; row < image.height; row++) {
    for (let column = 0; column < image.width; column++) {
      const pixel = image.getPixel(column, row);
      const variables = getRegressionVariables(
        pixel[0],
        pixel[1],
        pixel[2],
        image.maxValue,
      );

      const clamp = getClamp(image);

      const newPixel = [0, 0, 0];

      const red = mlrRed.predict(variables)[0] * image.maxValue;
      const green = mlrGreen.predict(variables)[0] * image.maxValue;
      const blue = mlrBlue.predict(variables)[0] * image.maxValue;

      newPixel[0] = clamp(red);
      newPixel[1] = clamp(green);
      newPixel[2] = clamp(blue);
      if (image.alpha) {
        newPixel[3] = image.getValue(column, row, 3);
      }

      result.setPixel(column, row, newPixel);
    }
  }

  return result;
}

/**
 * Compute the third order variables for the regression from an RGB color.
 *
 * @param r - Red component.
 * @param g - Green component.
 * @param b - Blue component.
 * @param maxValue - Maximal acceptable value for the image to process.
 * @returns The variables for the multivariate linear regression.
 */
export function getRegressionVariables(
  r: number,
  g: number,
  b: number,
  maxValue: number,
): number[] {
  r /= maxValue;
  g /= maxValue;
  b /= maxValue;
  return [
    r,
    g,
    b,
    r ** 2,
    g ** 2,
    b ** 2,
    r ** 3,
    g ** 3,
    b ** 3,
    r * g,
    r * b,
    b * g,
  ];
}
