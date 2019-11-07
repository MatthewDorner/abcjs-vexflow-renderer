import VexUtils from './index';

// TEST DATA
import AbcObjects from '../../test-data/abcjs-objects';
import AbcKeySignatures from '../../test-data/abc-key-signatures';

// ------------------------------------ getTabPosition --------------------------------------------------------
// THESE ARE ACTUALLY INTEGRATION TESTS, NEED TO SEPARATE UNIT tests FROM INTEGRATION.
// OR, just mock these dependencies


test('e3 is lowest note on guitar', () => {
  const keys = ['e/3'];
  const abcKeySignature = AbcKeySignatures.CMajor;
  const barContents = [AbcObjects.Notes.Eighths.F];

  expect(VexUtils.getTabPosition(keys, abcKeySignature, barContents, 0)).toStrictEqual([{ str: 6, fret: 0 }]);
});

test('sharped note causes itself and later notes to be sharped', () => {
  const keys = ['f/5'];
  const abcKeySignature = AbcKeySignatures.CMajor;
  const fSharp = AbcObjects.Notes.Eighths.FSharp;
  const f = AbcObjects.Notes.Eighths.F;
  const barContents = [f, fSharp, f];

  // str: 1, fret: 1 is F natural
  expect(VexUtils.getTabPosition(keys, abcKeySignature, barContents, 0)).toStrictEqual([{ str: 1, fret: 1 }]);
  expect(VexUtils.getTabPosition(keys, abcKeySignature, barContents, 1)).toStrictEqual([{ str: 1, fret: 2 }]);
  expect(VexUtils.getTabPosition(keys, abcKeySignature, barContents, 2)).toStrictEqual([{ str: 1, fret: 2 }]);
});

test('sharp in key signature causes note to be sharped', () => {
  const keys = ['f/5'];
  const abcKeySignature = AbcKeySignatures.GMajor; // G Major has a sharped F
  const f = AbcObjects.Notes.Eighths.F;
  const barContents = [f];

  // str: 1, fret: 2 is F sharp
  expect(VexUtils.getTabPosition(keys, abcKeySignature, barContents, 0)).toStrictEqual([{ str: 1, fret: 2 }]);
});

// bugfix: in abcjs key sig, accidental.note when the note is 'b',
// is  actually uppercase 'B', so had to add .toLowerCase() in the conditional statement
test('in B Flat Minor key, B notes get flatted', () => {
  const keys = ['b/5'];
  const abcKeySignature = AbcKeySignatures.BFlatMajor;
  const bNatural = AbcObjects.Notes.Eighths.BNatural;
  const barContents = [bNatural];

  // str: 1, fret: 6 is B flat
  expect(VexUtils.getTabPosition(keys, abcKeySignature, barContents, 0)).toStrictEqual([{ str: 1, fret: 6 }]);
  // now with C major key sig, should be a B natural
  expect(VexUtils.getTabPosition(keys, AbcKeySignatures.CMajor, barContents, 0)).toStrictEqual([{ str: 1, fret: 7 }]);
});

test('sharped note, when sharp already exists in key sig, doesnt sharp the note twice', () => {
  const keys = ['f/5'];
  const abcKeySignature = AbcKeySignatures.GMajor; // G Major has a sharped F
  const fSharp = AbcObjects.Notes.Eighths.FSharp;
  const barContents = [fSharp];

  // str: 1, fret: 1 is F natural and str: 1, fret: 2 is F sharp. we're checking to make
  // sure it doesn't somehow end up str: 1, fret: 3
  expect(VexUtils.getTabPosition(keys, abcKeySignature, barContents, 0)).toStrictEqual([{ str: 1, fret: 2 }]);
});

test('natural accidental cancels out key sig flat', () => {
  const keys = ['f/5'];
  const abcKeySignature = AbcKeySignatures.GMajor;
  const fNatural = AbcObjects.Notes.Eighths.FNatural;
  const barContents = [fNatural];

  // the natural accidental on the specific note should cancel out the sharp accidental in the key sig
  // str: 1, fret: 1 is F natural
  expect(VexUtils.getTabPosition(keys, abcKeySignature, barContents, 0)).toStrictEqual([{ str: 1, fret: 1 }]);
});
