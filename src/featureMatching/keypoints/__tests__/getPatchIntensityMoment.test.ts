import { getPatchIntensityMoment } from '../getPatchIntensityMoment';

test('5x5 image, 01, radius = 1', () => {
  const image = testUtils.createGreyImage([
    [0, 0, 1, 0, 42],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ]);
  const result = getPatchIntensityMoment(image, 0, 1, { radius: 1 });
  expect(result).toStrictEqual([-1]);
});

test('5x5 image, 01, radius = 2', () => {
  const image = testUtils.createGreyImage([
    [0, 0, 1, 0, 42],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ]);
  const result = getPatchIntensityMoment(image, 0, 1, { radius: 2 });
  expect(result).toStrictEqual([-3]);
});

test('too close to border error', () => {
  const image = testUtils.createGreyImage([
    [0, 0, 1, 0, 42],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ]);
  expect(() => {
    getPatchIntensityMoment(image, 0, 1);
  }).toThrow('desired patch is too close to image border');
});
