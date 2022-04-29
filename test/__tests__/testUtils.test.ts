import { ColorDepth, IJS } from '../../src';

describe('load', () => {
  it('should load the image synchronously', () => {
    const image = testUtils.load('opencv/test.png');
    expect(image).toBeInstanceOf(IJS);
  });

  it('should throw and have TS error for bad path', () => {
    // @ts-expect-error
    expect(() => testUtils.load('bad/path')).toThrow(/ENOENT/);
  });
});

describe('createGreyImage', () => {
  it('should create an image from matrix', () => {
    const image = testUtils.createGreyImage([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [10, 11, 12],
    ]);
    expect(image.width).toBe(3);
    expect(image.height).toBe(4);
    expect(image.getPixel(1, 0)).toStrictEqual([4]);
  });

  it('should create an image from string', () => {
    const image = testUtils.createGreyImage(`
       1  2  3
       4  5  6
       7  8  9
      10 11 12
    `);
    expect(image.width).toBe(3);
    expect(image.height).toBe(4);
    expect(image.getPixel(1, 0)).toStrictEqual([4]);
  });

  it('should create a 16-bit image', () => {
    const image = testUtils.createGreyImage([[1, 32768]], {
      depth: ColorDepth.UINT16,
    });
    expect(image.depth).toBe(ColorDepth.UINT16);
    expect(image.getValueByIndex(1, 0)).toBe(32768);
  });

  it('should throw if row length is not consistent (array)', () => {
    expect(() =>
      testUtils.createGreyImage([
        [1, 2, 3],
        [4, 5],
        [7, 8, 9],
        [10, 11, 12],
      ]),
    ).toThrow(/does not match width/);
  });

  it('should throw if row length is not consistent (string)', () => {
    expect(() =>
      testUtils.createGreyImage(`
       1  2  3
       4  5 
       7  8  9
      10 11 12
    `),
    ).toThrow(/does not match width/);
  });
});

describe('createRgbImage', () => {
  it('should create an image from matrix', () => {
    const image = testUtils.createRgbImage([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [10, 11, 12],
    ]);
    expect(image.width).toBe(1);
    expect(image.height).toBe(4);
    expect(image.getPixel(1, 0)).toStrictEqual([4, 5, 6]);
  });

  it('should create an image from string', () => {
    const image = testUtils.createRgbImage(`
       1  2  3
       4  5  6
       7  8  9
      10 11 12
    `);
    expect(image.width).toBe(1);
    expect(image.height).toBe(4);
    expect(image.getPixel(1, 0)).toStrictEqual([4, 5, 6]);
  });

  it('should create a 16-bit image', () => {
    const image = testUtils.createRgbImage([[1, 2, 32768]], {
      depth: ColorDepth.UINT16,
    });
    expect(image.depth).toBe(ColorDepth.UINT16);
    expect(image.getPixel(0, 0)).toStrictEqual([1, 2, 32768]);
  });

  it('should throw if row length is not a multiple of 3', () => {
    expect(() =>
      testUtils.createRgbImage([
        [1, 2, 3, 0],
        [4, 5, 6, 0],
        [7, 8, 9, 0],
      ]),
    ).toThrow(/is not a multiple of channels/);
  });
});

describe('createRgbaImage', () => {
  it('should create an image from matrix', () => {
    const image = testUtils.createRgbaImage([
      [1, 2, 3, 255],
      [4, 5, 6, 128],
      [7, 8, 9, 0],
      [10, 11, 12, 255],
    ]);
    expect(image.width).toBe(1);
    expect(image.height).toBe(4);
    expect(image.getPixel(1, 0)).toStrictEqual([4, 5, 6, 128]);
  });

  it('should create an image from string', () => {
    const image = testUtils.createRgbaImage(`
       1  2  3 / 255 | 4  5  6 / 128
       7  8  9 / 0   | 10 11 12 / 255
    `);
    expect(image.width).toBe(2);
    expect(image.height).toBe(2);
    expect(image.getPixel(0, 1)).toStrictEqual([4, 5, 6, 128]);
  });

  it('should create a 16-bit image', () => {
    const image = testUtils.createRgbaImage([[1, 2, 3, 32768]], {
      depth: ColorDepth.UINT16,
    });
    expect(image.depth).toBe(ColorDepth.UINT16);
    expect(image.getPixel(0, 0)).toStrictEqual([1, 2, 3, 32768]);
  });

  it('should throw if row length is not a multiple of 4', () => {
    expect(() =>
      testUtils.createRgbaImage(`
       1  2  3 | 4  5  6
       7  8  9 | 10 11 12
    `),
    ).toThrow(/is not a multiple of channels/);
  });
});

describe('createMask', () => {
  it('should create a mask from matrix', () => {
    const mask = testUtils.createMask([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
      [0, 0, 1],
    ]);
    expect(mask.width).toBe(3);
    expect(mask.height).toBe(4);
    expect(mask.getBit(1, 0)).toBe(0);
  });

  it('should create a mask from string', () => {
    const mask = testUtils.createMask(`
       0  0  0
       1  0  0
    `);
    expect(mask.width).toBe(3);
    expect(mask.height).toBe(2);
    expect(mask.getBit(1, 0)).toBe(1);
  });

  it('should throw if row length is not consistent (array)', () => {
    expect(() =>
      testUtils.createMask([
        [1, 0, 0],
        [0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ]),
    ).toThrow(/does not match width/);
  });

  it('should throw if row length is not consistent (string)', () => {
    expect(() =>
      testUtils.createMask(`
       1  0  0
       0  0 
       0  0  0
      0 0 0
    `),
    ).toThrow(/does not match width/);
  });
});