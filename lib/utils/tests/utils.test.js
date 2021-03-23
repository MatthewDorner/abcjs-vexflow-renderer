import { getDiatonicFromLetter, getChromaticFromLetter } from '../index';

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
