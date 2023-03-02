import {
  Montage,
  drawKeypoints,
  drawMatches,
  getOrientedFastKeypoints,
  getBriefDescriptors,
  bruteForceOneMatch,
  DrawKeypointsOptions,
  GetFastKeypointsOptions,
  getCrosscheckMatches,
  MontageDisposition,
  getBestKeypointsInRadius,
} from '../../src/featureMatching';
import { ImageColorModel, readSync, writeSync } from '../../src';
import { getBrief } from './getBrief';
import { GetColorsOptions } from '../../src/featureMatching/utils/getColors';
import { getMinMax } from '../../src/utils/getMinMax';

const getBriefOptions = {
  windowSize: 31,
  bestKptRadius: 5,
};

let source = readSync('../../test/img/featureMatching/crop1.png').convertColor(
  ImageColorModel.GREY,
);
const sourceExtremums = getMinMax(source);
source.level({
  inputMin: sourceExtremums.min[0],
  inputMax: sourceExtremums.max[0],
  out: source,
});
console.log({ sourceExtremums });

let destination = readSync(
  '../../test/img/featureMatching/crop3.png',
).convertColor(ImageColorModel.GREY);
const destinationExtremums = getMinMax(destination);
destination.level({
  inputMin: destinationExtremums.min[0],
  inputMax: destinationExtremums.max[0],
  out: destination,
});

console.log({
  source: { width: source.width, height: source.height },
  destination: { width: destination.width, height: destination.height },
});

const sourceBrief = getBrief(source, getBriefOptions);
const destinationBrief = getBrief(destination, getBriefOptions);

console.log({
  keypoints: {
    sourceLength: sourceBrief.keypoints.length,
    destinationLength: destinationBrief.keypoints.length,
  },
  descriptors: {
    sourceLength: sourceBrief.descriptors.length,
    destinationLength: destinationBrief.descriptors.length,
  },
});

const matches = bruteForceOneMatch(
  sourceBrief.descriptors,
  destinationBrief.descriptors,
);
console.log('nb matches: ' + matches.length);

const crossMatches = getCrosscheckMatches(
  sourceBrief.descriptors,
  destinationBrief.descriptors,
);
console.log('nb crosscheck matches: ' + crossMatches.length);

const montage = new Montage(source, destination, {
  scale: 2,
  disposition: MontageDisposition.VERTICAL,
});

const showDistanceOptions: GetColorsOptions = { minValueFactor: 0.2 };

montage.drawMatches(
  matches,
  sourceBrief.keypoints,
  destinationBrief.keypoints,
  {
    showDistance: true,
    color: [255, 0, 0],
    showDistanceOptions,
  },
);

montage.drawMatches(
  crossMatches,
  sourceBrief.keypoints,
  destinationBrief.keypoints,
  {
    showDistance: true,
    color: [0, 0, 255],
    showDistanceOptions,
  },
);

const kptOptions: DrawKeypointsOptions = {
  markerSize: 3,
  color: [0, 255, 0],
  showScore: true,
  fill: true,
};

montage.drawKeypoints(sourceBrief.keypoints, kptOptions);
montage.drawKeypoints(destinationBrief.keypoints, {
  ...kptOptions,
  origin: montage.destinationOrigin,
});

writeSync('./result.png', montage.image);

console.log('IMAGE WRITTEN TO DISK');