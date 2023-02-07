import { ImageColorModel } from '../../../../Image';
import { writeSync } from '../../../../save';
import { drawKeypoints } from '../../../visualize/drawKeypoints';
import { filterBestKeypoints } from '../../filterBestKeypoints';
import {
  getOrientedFastKeypoints,
  OrientedFastKeypoint,
} from '../../getOrientedFastKeypoints';

test('array of 3 keypoints', () => {
  const keypoints: OrientedFastKeypoint[] = [
    { origin: { row: 0, column: 0 }, angle: 0, score: 3 },
    { origin: { row: 1, column: 0 }, angle: 0, score: 5 },
    { origin: { row: 0, column: 2 }, angle: 0, score: 6 },
  ];
  const result = filterBestKeypoints(keypoints);
  expect(result).toStrictEqual([
    { origin: { row: 0, column: 2 }, angle: 0, score: 6 },
  ]);
});

test.only('star', () => {
  let image = testUtils.load('featureMatching/star.png');
  const grey = image.convertColor(ImageColorModel.GREY);
  const keypoints = getOrientedFastKeypoints(grey, {
    // scoreAlgorithm: 'HARRIS', // a lot better results with this option
  });
  const filteredKeypoints = filterBestKeypoints(keypoints, 5);

  console.log({
    keypoints: keypoints.length,
    filteredKeypoints: filteredKeypoints.length,
  });

  image = drawKeypoints(image, keypoints, {
    showScore: true,
    fill: false,
    out: image,
  });

  image = drawKeypoints(image, filteredKeypoints, {
    fill: false,
    color: [0, 0, 255],
    markerSize: 2,
    out: image,
  });

  expect(image).toMatchImageSnapshot();
  expect(filteredKeypoints).toHaveLength(51);
});
