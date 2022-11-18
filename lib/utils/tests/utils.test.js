import { getDiatonicFromLetter, getChromaticFromLetter, convertKeySignature, getVexDuration } from '../index';

test('getDiatonicFromLetter', () => {
  expect(getDiatonicFromLetter('c')).toBe(0);
  expect(getDiatonicFromLetter('d')).toBe(1);
  expect(getDiatonicFromLetter('e')).toBe(2);
  expect(getDiatonicFromLetter('f')).toBe(3);
  expect(getDiatonicFromLetter('g')).toBe(4);
  expect(getDiatonicFromLetter('a')).toBe(5);
  expect(getDiatonicFromLetter('b')).toBe(6);
});

test('getChromaticFromLetter', () => {
  expect(getChromaticFromLetter('c')).toBe(0);
  expect(getChromaticFromLetter('d')).toBe(2);
  expect(getChromaticFromLetter('e')).toBe(4);
  expect(getChromaticFromLetter('f')).toBe(5);
  expect(getChromaticFromLetter('g')).toBe(7);
  expect(getChromaticFromLetter('a')).toBe(9);
  expect(getChromaticFromLetter('b')).toBe(11);
});

test('convertKeySignature', () => {
  const abcKeySignature = { accidentals: [] };
  expect(convertKeySignature(abcKeySignature)).toBe('C');
  abcKeySignature.accidentals.push({ acc: 'sharp' });
  expect(convertKeySignature(abcKeySignature)).toBe('G');
  abcKeySignature.accidentals.push({ acc: 'sharp' });
  expect(convertKeySignature(abcKeySignature)).toBe('D');
  abcKeySignature.accidentals.push({ acc: 'sharp' });
  expect(convertKeySignature(abcKeySignature)).toBe('A');
  abcKeySignature.accidentals.push({ acc: 'sharp' });
  expect(convertKeySignature(abcKeySignature)).toBe('E');
  abcKeySignature.accidentals.push({ acc: 'sharp' });
  expect(convertKeySignature(abcKeySignature)).toBe('B');
  abcKeySignature.accidentals.push({ acc: 'sharp' });
  expect(convertKeySignature(abcKeySignature)).toBe('F#');
  abcKeySignature.accidentals.push({ acc: 'sharp' });
  expect(convertKeySignature(abcKeySignature)).toBe('C#');

  abcKeySignature.accidentals = [];
  abcKeySignature.accidentals.push({ acc: 'flat' });
  expect(convertKeySignature(abcKeySignature)).toBe('F');
  abcKeySignature.accidentals.push({ acc: 'flat' });
  expect(convertKeySignature(abcKeySignature)).toBe('Bb');
  abcKeySignature.accidentals.push({ acc: 'flat' });
  expect(convertKeySignature(abcKeySignature)).toBe('Eb');
  abcKeySignature.accidentals.push({ acc: 'flat' });
  expect(convertKeySignature(abcKeySignature)).toBe('Ab');
  abcKeySignature.accidentals.push({ acc: 'flat' });
  expect(convertKeySignature(abcKeySignature)).toBe('Db');
  abcKeySignature.accidentals.push({ acc: 'flat' });
  expect(convertKeySignature(abcKeySignature)).toBe('Gb');
  abcKeySignature.accidentals.push({ acc: 'flat' });
  expect(convertKeySignature(abcKeySignature)).toBe('Cb');
});

test('getVexDuration', () => {
  function dotted(duration) {
    return duration * 1.5;
  }
  function doubleDotted(duration) {
    return duration * 1.75;
  }
  function tripleDotted(duration) {
    return duration * 1.875;
  }

  // double whole note to 64th note
  const abcDurations = [2, 1, 0.5, 0.25, 0.125, 0.0625, 0.03125, 0.015625];

  // vexflow takes '1/2' as the duration for a double whole note, and takes all durations as strings
  const vexDurations = ['1/2', '1', '2', '4', '8', '16', '32', '64'];

  abcDurations.forEach((abcDuration, i) => {
    expect(getVexDuration(abcDuration)).toStrictEqual({
      duration: vexDurations[i],
      isDotted: false,
      isDoubleDotted: false,
      isTripleDotted: false
    });
    expect(getVexDuration(dotted(abcDuration))).toStrictEqual({
      duration: vexDurations[i],
      isDotted: true,
      isDoubleDotted: false,
      isTripleDotted: false
    });
    expect(getVexDuration(doubleDotted(abcDuration))).toStrictEqual({
      duration: vexDurations[i],
      isDotted: false,
      isDoubleDotted: true,
      isTripleDotted: false
    });
    expect(getVexDuration(tripleDotted(abcDuration))).toStrictEqual({
      duration: vexDurations[i],
      isDotted: false,
      isDoubleDotted: false,
      isTripleDotted: true
    });
  });
});
