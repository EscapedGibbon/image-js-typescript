import { ImageColorModel } from '../../Image';
import { bruteForceOneMatch } from '../bruteForceMatch';
import { drawMatches } from '../drawMatches';
import { getBriefDescriptors } from '../getBriefDescriptors';
import { getOrientedFastKeypoints } from '../getOrientedFastKeypoints';

test('alphabet image as source and destination, nbKeypoint = 10', () => {
  const source = testUtils.load('various/alphabet.jpg');
  const grey = source.convertColor(ImageColorModel.GREY);
  const sourceKeypoints = getOrientedFastKeypoints(grey, { maxNbFeatures: 10 });
  const sourceDescriptors = getBriefDescriptors(grey, sourceKeypoints);

  const destination = testUtils.load('various/alphabet.jpg');
  const grey2 = destination.convertColor(ImageColorModel.GREY);
  const destinationKeypoints = getOrientedFastKeypoints(grey2, {
    maxNbFeatures: 10,
  });
  const destinationDescriptors = getBriefDescriptors(
    grey2,
    destinationKeypoints,
  );

  const matches = bruteForceOneMatch(sourceDescriptors, destinationDescriptors);

  const result = drawMatches(
    source,
    destination,
    sourceKeypoints,
    destinationKeypoints,
    matches,
  );

  expect(result).toMatchImageSnapshot();
});

test('destination rotated +2°', () => {
  const source = testUtils
    .load('featureMatching/alphabet.jpg')
    .convertColor(ImageColorModel.GREY);
  const sourceKeypoints = getOrientedFastKeypoints(source);
  const sourceDescriptors = getBriefDescriptors(source, sourceKeypoints);

  const destination = testUtils
    .load('featureMatching/alphabetRotated2.jpg')
    .convertColor(ImageColorModel.GREY);
  const destinationKeypoints = getOrientedFastKeypoints(destination);
  const destinationDescriptors = getBriefDescriptors(
    destination,
    destinationKeypoints,
  );
  expect(sourceKeypoints.length).toBe(119);
  expect(destinationKeypoints.length).toBe(135);

  const matches = bruteForceOneMatch(
    sourceDescriptors,
    destinationDescriptors,
    { nbBestMatches: 20 },
  );

  const result = drawMatches(
    source,
    destination,
    sourceKeypoints,
    destinationKeypoints,
    matches,
    { showScore: true },
  );

  expect(result).toMatchImageSnapshot();
});

test('destination rotated +10°', () => {
  const source = testUtils.load('featureMatching/alphabet.jpg');
  const grey = source.convertColor(ImageColorModel.GREY);
  const sourceKeypoints = getOrientedFastKeypoints(grey);
  const sourceDescriptors = getBriefDescriptors(grey, sourceKeypoints);

  const destination = testUtils.load('featureMatching/alphabetRotated10.jpg');
  const grey2 = destination.convertColor(ImageColorModel.GREY);
  const destinationKeypoints = getOrientedFastKeypoints(grey2);
  const destinationDescriptors = getBriefDescriptors(
    grey2,
    destinationKeypoints,
  );

  const matches = bruteForceOneMatch(
    sourceDescriptors,
    destinationDescriptors,
    { nbBestMatches: 10 },
  );

  const result = drawMatches(
    source,
    destination,
    sourceKeypoints,
    destinationKeypoints,
    matches,
    { showKeypoints: true, showScore: true },
  );

  expect(result).toMatchImageSnapshot();
});
