import { ImageColorModel } from '../../../Image';
import { getOrientedFastKeypoints } from '../../keypoints/getOrientedFastKeypoints';
import { drawKeypoints } from '../drawKeypoints';

const image = testUtils.load('various/alphabet.jpg');
const grey = image.convertColor(ImageColorModel.GREY);
const keypoints = getOrientedFastKeypoints(grey, { maxNbFeatures: 20 });
test('alphabet image with score coloring', () => {
  const result = drawKeypoints(image, keypoints, {
    showScore: true,
    fill: true,
  });

  expect(result).toMatchImageSnapshot();

  const maxNbKeypoints = drawKeypoints(image, keypoints, {
    showScore: true,
    fill: true,
    maxNbKeypoints: 50,
  });
  expect(maxNbKeypoints).toMatchImage(result);
});

test('only draw 5 best matches', () => {
  const result = drawKeypoints(image, keypoints, {
    maxNbKeypoints: 5,
  });

  expect(result).toMatchImageSnapshot();
});

test('draw orientation', () => {
  const result = drawKeypoints(image, keypoints, {
    showOrientation: true,
    color: [0, 255, 0],
  });

  expect(result).toMatchImageSnapshot();
});
