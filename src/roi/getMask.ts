import { Mask } from '../Mask';

import { Roi } from './Roi';

export enum GetMaskKinds {
  EXACT = 'EXACT',
  HULL = 'HULL',
  MBR = 'MBR',
  FILLED = 'FILLED',
}
export interface GetMaskOptions {
  kind: GetMaskKinds;
}

/**
 * Generate a mask the size of the bounding rectangle of the ROI, where the pixels inside the ROI are set to true and the rest to false.
 *
 * @param roi - The ROI to generate a mask for.
 * @param options - Get mask options.
 * @returns The ROI mask.
 */
export function getMask(roi: Roi, options: GetMaskOptions): Mask {
  const { kind = GetMaskKinds.EXACT } = options;
  switch (kind) {
    default:
      return exactMask(roi);
  }
}

function exactMask(roi: Roi): Mask {
  let mask = new Mask(roi.width, roi.height);

  for (let row = 0; row < roi.height; row++) {
    for (let column = 0; column < roi.width; column++) {
      if (roi.getMapValue(roi.row + row, roi.column + column) === roi.id) {
        mask.setBit(row, column, 1);
      } else {
        mask.setBit(row, column, 0);
      }
    }
  }
  return mask;
}
