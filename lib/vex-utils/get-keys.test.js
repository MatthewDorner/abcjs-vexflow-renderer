import VexUtils from './index';

test('multiple keys in input, all get converted', () => {
  expect(VexUtils.getKeys([
    { pitch: -5, verticalPos: -5 },
    { pitch: -3, verticalPos: -3 },
    { pitch: -1, verticalPos: -1 }])).toStrictEqual(['e/3', 'g/3', 'b/3']);
});

test('empty input array results in empty output array', () => {
  expect(VexUtils.getKeys([])).toStrictEqual([]);
});

test('conversion for keys likely to be used', () => {
  expect(VexUtils.getKeys([{ pitch: -5, verticalPos: -5 }])).toStrictEqual(['e/3']);
  expect(VexUtils.getKeys([{ pitch: -4, verticalPos: -4 }])).toStrictEqual(['f/3']);
  expect(VexUtils.getKeys([{ pitch: -3, verticalPos: -3 }])).toStrictEqual(['g/3']);
  expect(VexUtils.getKeys([{ pitch: -2, verticalPos: -2 }])).toStrictEqual(['a/3']);
  expect(VexUtils.getKeys([{ pitch: -1, verticalPos: -1 }])).toStrictEqual(['b/3']);
  expect(VexUtils.getKeys([{ pitch: 0, verticalPos: 0 }])).toStrictEqual(['c/4']);
  expect(VexUtils.getKeys([{ pitch: 1, verticalPos: 1 }])).toStrictEqual(['d/4']);
  expect(VexUtils.getKeys([{ pitch: 2, verticalPos: 2 }])).toStrictEqual(['e/4']);
  expect(VexUtils.getKeys([{ pitch: 3, verticalPos: 3 }])).toStrictEqual(['f/4']);
  expect(VexUtils.getKeys([{ pitch: 4, verticalPos: 4 }])).toStrictEqual(['g/4']);
  expect(VexUtils.getKeys([{ pitch: 5, verticalPos: 5 }])).toStrictEqual(['a/4']);
  expect(VexUtils.getKeys([{ pitch: 6, verticalPos: 6 }])).toStrictEqual(['b/4']);
  expect(VexUtils.getKeys([{ pitch: 7, verticalPos: 7 }])).toStrictEqual(['c/5']);
  expect(VexUtils.getKeys([{ pitch: 8, verticalPos: 8 }])).toStrictEqual(['d/5']);
  expect(VexUtils.getKeys([{ pitch: 9, verticalPos: 9 }])).toStrictEqual(['e/5']);
  expect(VexUtils.getKeys([{ pitch: 10, verticalPos: 10 }])).toStrictEqual(['f/5']);
  expect(VexUtils.getKeys([{ pitch: 11, verticalPos: 11 }])).toStrictEqual(['g/5']);
  expect(VexUtils.getKeys([{ pitch: 12, verticalPos: 12 }])).toStrictEqual(['a/5']);
  expect(VexUtils.getKeys([{ pitch: 13, verticalPos: 13 }])).toStrictEqual(['b/5']);
});
