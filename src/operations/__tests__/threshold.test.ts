import { ImageColorModel } from '../../utils/constants/colorModels';
import { computeThreshold, threshold, ThresholdAlgorithm } from '../threshold';

test('threshold with a fixed value of 100', () => {
  const testImage = testUtils.load('opencv/test.png');
  const grey = testImage.convertColor(ImageColorModel.GREY);
  const th = threshold(grey, { threshold: 100 });

  const expected = testUtils.createMask([
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 0],
    [0, 0, 0, 1, 1, 1, 1, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [0, 0, 0, 1, 1, 1, 1, 0],
    [0, 0, 0, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ]);

  expect(th).toMatchMask(expected);
});

test('computeThreshold with OTSU', () => {
  const testImage = testUtils.load('opencv/test.png');

  const grey = testImage.convertColor(ImageColorModel.GREY);
  const thresholdValue = computeThreshold(grey, ThresholdAlgorithm.OTSU);
  expect(thresholdValue).toBe(127);
});

test('computeThreshold with OTSU (2)', () => {
  const img = testUtils.load('various/grayscale_by_zimmyrose.png');
  const thresholdValue = computeThreshold(img, ThresholdAlgorithm.OTSU);
  expect(thresholdValue).toBe(135);
});

test('computeThreshold default should be Otsu', () => {
  const img = testUtils.load('various/grayscale_by_zimmyrose.png');
  const thresholdValue = computeThreshold(img);
  expect(thresholdValue).toBe(135);
});

test('automatic threshold with OTSU', () => {
  const testImage = testUtils.load('opencv/test.png');

  const grey = testImage.convertColor(ImageColorModel.GREY);
  const th = threshold(grey, { algorithm: ThresholdAlgorithm.OTSU });
  const defaultThreshold = threshold(grey);

  const expected = testUtils.createMask([
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 0],
    [0, 0, 0, 1, 1, 1, 1, 0],
    [0, 1, 1, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 0],
    [0, 0, 0, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ]);
  expect(th).toMatchMask(expected);
  expect(defaultThreshold).toMatchMask(expected);
});
test('threshold in percents', () => {
  const grey = testUtils.createGreyImage([
    [1, 2, 3],
    [10, 20, 30],
    [50, 60, 70],
  ]);

  const th = threshold(grey, { threshold: '10%' });

  const expected = testUtils.createMask([
    [0, 0, 0],
    [0, 0, 1],
    [1, 1, 1],
  ]);
  expect(th).toMatchMask(expected);
});

test('error too many channels', () => {
  const testImage = testUtils.load('opencv/test.png');

  expect(() =>
    threshold(testImage, { algorithm: ThresholdAlgorithm.OTSU }),
  ).toThrow(/threshold can only be computed on images with one channel/);
});
test('error threshold in percents out of range', () => {
  const testImage = testUtils.load('opencv/test.png');

  expect(() => threshold(testImage, { threshold: '150%' })).toThrow(
    /threshold: threshold in percents is out of range 0 to 100/,
  );
});
test('error threshold out of range', () => {
  const testImage = testUtils.load('opencv/test.png');

  expect(() => threshold(testImage, { threshold: 450 })).toThrow(
    /invalid value: 450. It must be a positive value smaller than 256/,
  );
});
test('error threshold string format wrong', () => {
  const testImage = testUtils.load('opencv/test.png');

  expect(() => threshold(testImage, { threshold: '150' })).toThrow(
    /threshold: unrecognised threshold format/,
  );
  expect(() => threshold(testImage, { threshold: 'abc%' })).toThrow(
    /threshold: unrecognised threshold format/,
  );
});
