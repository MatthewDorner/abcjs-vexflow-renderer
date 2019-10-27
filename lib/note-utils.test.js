import NoteUtils from './note-utils';

test('getDiatonicFromLetter', () => {
  expect(NoteUtils.getDiatonicFromLetter('c')).toBe(0);
  expect(NoteUtils.getDiatonicFromLetter('d')).toBe(1);
  expect(NoteUtils.getDiatonicFromLetter('e')).toBe(2);
  expect(NoteUtils.getDiatonicFromLetter('f')).toBe(3);
  expect(NoteUtils.getDiatonicFromLetter('g')).toBe(4);
  expect(NoteUtils.getDiatonicFromLetter('a')).toBe(5);
  expect(NoteUtils.getDiatonicFromLetter('b')).toBe(6);
});

test('getChromaticFromLetter', () => {
  expect(NoteUtils.getChromaticFromLetter('c')).toBe(0);
  expect(NoteUtils.getChromaticFromLetter('d')).toBe(2);
  expect(NoteUtils.getChromaticFromLetter('e')).toBe(4);
  expect(NoteUtils.getChromaticFromLetter('f')).toBe(5);
  expect(NoteUtils.getChromaticFromLetter('g')).toBe(7);
  expect(NoteUtils.getChromaticFromLetter('a')).toBe(9);
  expect(NoteUtils.getChromaticFromLetter('b')).toBe(11);
});
