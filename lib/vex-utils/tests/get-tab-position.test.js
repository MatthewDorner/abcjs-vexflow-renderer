import VexUtils from '../index';

// TEST DATA
import AbcObjects from '../../test-data/abcjs-objects';
import AbcKeySignatures from '../../test-data/abc-key-signatures';

const tuning = { tuning: ['e/3', 'a/3', 'd/4', 'g/4', 'b/4', 'e/5'] };

// THESE ARE ACTUALLY INTEGRATION TESTS, NEED TO SEPARATE UNIT tests FROM INTEGRATION.

test('e3 is lowest note on guitar', () => {
  const keys = ['e/3'];
  const abcKeySignature = AbcKeySignatures.CMajor;
  const barContents = [AbcObjects.Notes.Eighths.F];

  expect(VexUtils.getTabPosition(keys, abcKeySignature, barContents, 0, tuning, false)).toStrictEqual([{ str: 6, fret: 0 }]);
});

test('sharped note causes itself and later notes to be sharped', () => {
  const keys = ['f/5'];
  const abcKeySignature = AbcKeySignatures.CMajor;
  const fSharp = AbcObjects.Notes.Eighths.FSharp;
  const f = AbcObjects.Notes.Eighths.F;
  const barContents = [f, fSharp, f];

  // str: 1, fret: 1 is F natural
  expect(VexUtils.getTabPosition(keys, abcKeySignature, barContents, 0, tuning, false)).toStrictEqual([{ str: 1, fret: 1 }]);
  expect(VexUtils.getTabPosition(keys, abcKeySignature, barContents, 1, tuning, false)).toStrictEqual([{ str: 1, fret: 2 }]);
  expect(VexUtils.getTabPosition(keys, abcKeySignature, barContents, 2, tuning, false)).toStrictEqual([{ str: 1, fret: 2 }]);
});

test('sharp in key signature causes note to be sharped', () => {
  const keys = ['f/5'];
  const abcKeySignature = AbcKeySignatures.GMajor; // G Major has a sharped F
  const f = AbcObjects.Notes.Eighths.F;
  const barContents = [f];

  // str: 1, fret: 2 is F sharp
  expect(VexUtils.getTabPosition(keys, abcKeySignature, barContents, 0, tuning, false)).toStrictEqual([{ str: 1, fret: 2 }]);
});

// bugfix: in abcjs key sig, accidental.note when the note is 'b',
// is  actually uppercase 'B', so had to add .toLowerCase() in the conditional statement
test('in B Flat Minor key, B notes get flatted', () => {
  const keys = ['b/5'];
  const abcKeySignature = AbcKeySignatures.BFlatMajor;
  const b = AbcObjects.Notes.Eighths.B;
  const barContents = [b];

  // str: 1, fret: 6 is B flat
  expect(VexUtils.getTabPosition(keys, abcKeySignature, barContents, 0, tuning, false)).toStrictEqual([{ str: 1, fret: 6 }]);
  // now with C major key sig, should be a B natural
  expect(VexUtils.getTabPosition(keys, AbcKeySignatures.CMajor, barContents, 0, tuning, false)).toStrictEqual([{ str: 1, fret: 7 }]);
});

test('sharped note, when sharp already exists in key sig, doesnt sharp the note twice', () => {
  const keys = ['f/5'];
  const abcKeySignature = AbcKeySignatures.GMajor; // G Major has a sharped F
  const fSharp = AbcObjects.Notes.Eighths.FSharp;
  const barContents = [fSharp];

  // str: 1, fret: 1 is F natural and str: 1, fret: 2 is F sharp. we're checking to make
  // sure it doesn't somehow end up str: 1, fret: 3
  expect(VexUtils.getTabPosition(keys, abcKeySignature, barContents, 0, tuning, false)).toStrictEqual([{ str: 1, fret: 2 }]);
});

test('natural accidental cancels out key sig sharp', () => {
  const keys = ['f/5'];
  const abcKeySignature = AbcKeySignatures.GMajor;
  const fNatural = AbcObjects.Notes.Eighths.FNatural;
  const barContents = [fNatural];

  // the natural accidental on the specific note should cancel out the sharp accidental in the key sig
  // str: 1, fret: 1 is F natural
  expect(VexUtils.getTabPosition(keys, abcKeySignature, barContents, 0, tuning, false)).toStrictEqual([{ str: 1, fret: 1 }]);
});

test('grace note - sharped grace note causes itself and later grace notes to be sharped', () => {
  const keys = ['f/5'];
  const abcKeySignature = AbcKeySignatures.CMajor;
  const cWithFSharpGraceNote = AbcObjects.Notes.Eighths.CWithFSharpGraceNote
  const cWithFGraceNote = AbcObjects.Notes.Eighths.CWithFGraceNote;
  const barContents = [cWithFGraceNote, cWithFSharpGraceNote, cWithFGraceNote];

  // str: 1, fret: 1 is F natural
  // passing is GraceNote true, meaning we're getting tab position for the grace notes here
  expect(VexUtils.getTabPosition(keys, abcKeySignature, barContents, 0, tuning, true)).toStrictEqual([{ str: 1, fret: 1 }]);
  expect(VexUtils.getTabPosition(keys, abcKeySignature, barContents, 1, tuning, true)).toStrictEqual([{ str: 1, fret: 2 }]);
  expect(VexUtils.getTabPosition(keys, abcKeySignature, barContents, 2, tuning, true)).toStrictEqual([{ str: 1, fret: 2 }]);
});

test('grace note - sharp in key signature causes grace note to be sharped', () => {
  const keys = ['f/5'];
  const abcKeySignature = AbcKeySignatures.GMajor; // G Major has a sharped F
  const cWithFGraceNote = AbcObjects.Notes.Eighths.CWithFGraceNote;
  const barContents = [cWithFGraceNote];

  // str: 1, fret: 2 is F sharp
  expect(VexUtils.getTabPosition(keys, abcKeySignature, barContents, 0, tuning, true)).toStrictEqual([{ str: 1, fret: 2 }]);
});

test('grace note - sharped grace note causes later regular notes to be sharped', () => {
  const keys = ['f/5'];
  const abcKeySignature = AbcKeySignatures.CMajor;
  const f = AbcObjects.Notes.Eighths.F;
  const cWithFSharpGraceNote = AbcObjects.Notes.Eighths.CWithFSharpGraceNote;
  const barContents = [cWithFSharpGraceNote, f];

  // passing isGraceNote as false because we're testing a regular F note at position 1 and
  // confirming the sharp from previously sharped F grace note applies to it
  expect(VexUtils.getTabPosition(keys, abcKeySignature, barContents, 1, tuning, false)).toStrictEqual([{ str: 1, fret: 2 }]);
});

test('grace note - sharped regular note causes later grace notes to be sharped', () => {
  const keys = ['f/5'];
  const abcKeySignature = AbcKeySignatures.CMajor;
  const fSharp = AbcObjects.Notes.Eighths.FSharp;
  const cWithFGraceNote = AbcObjects.Notes.Eighths.CWithFSharpGraceNote;
  const barContents = [fSharp, cWithFGraceNote];

  // passingisGraceNote as true because we're testing the F grace note attached to the C note
  // in position 1 and confirming it's sharped by the accidental from the F Sharp at position 0
  expect(VexUtils.getTabPosition(keys, abcKeySignature, barContents, 1, tuning, true)).toStrictEqual([{ str: 1, fret: 2 }]);
});


test('grace note - natural accidental on grace note cancels out key sig sharp', () => {
  const keys = ['f/5'];
  const abcKeySignature = AbcKeySignatures.GMajor;
  const cWithFNaturalGraceNote = AbcObjects.Notes.Eighths.CWithFNaturalGraceNote;
  const barContents = [cWithFNaturalGraceNote];

  // the natural accidental on the specific grace note should cancel out the sharp accidental in the key sig
  // should be str: 1, fret: 1 for F natural
  expect(VexUtils.getTabPosition(keys, abcKeySignature, barContents, 0, tuning, true)).toStrictEqual([{ str: 1, fret: 1 }]);
});


test('grace note - accidental on grace note does affect attached regular note', () => {
  const keys = ['f/5'];
  const abcKeySignature = AbcKeySignatures.CMajor;
  const fWithFSharpGraceNote = AbcObjects.Notes.Eighths.FWithFSharpGraceNote;
  const barContents = [fWithFSharpGraceNote];

  // The regular F has a F Sharp grace note attached (before) it, so the note should
  // become sharped, testing the regular note F so isGraceNote is false
  expect(VexUtils.getTabPosition(keys, abcKeySignature, barContents, 0, tuning, false)).toStrictEqual([{ str: 1, fret: 2 }]);
});

test('grace note - grace is not affected by accidental on attached regular note', () => {
  const keys = ['f/5'];
  const abcKeySignature = AbcKeySignatures.CMajor;
  const fSharpWithFGraceNote = AbcObjects.Notes.Eighths.FSharpWithFGraceNote;
  const barContents = [fSharpWithFGraceNote];

  // Now it's a F Sharp regular note with a F grace note attached having no accidental. The
  // regular note comes "after" the grace not, so the grace note pitch should be F Natural
  expect(VexUtils.getTabPosition(keys, abcKeySignature, barContents, 0, tuning, true)).toStrictEqual([{ str: 1, fret: 1 }]);
});

test('grace note - accidental on n-1 regular note will apply to regular note n over accidental on n-1 grace note', () => {
  const keys = ['f/5'];
  const abcKeySignature = AbcKeySignatures.CMajor;
  const fSharpWithFFlatGraceNote = AbcObjects.Notes.Eighths.FSharpWithFFlatGraceNote;
  const f = AbcObjects.Notes.Eighths.F;
  const barContents = [fSharpWithFFlatGraceNote, f];

  // The sharp accidental from the n-1 note should be applied, not the flat from the n-1 grace note
  expect(VexUtils.getTabPosition(keys, abcKeySignature, barContents, 1, tuning, false)).toStrictEqual([{ str: 1, fret: 2 }]);
});

test('grace note - accidental on n-1 regular note will apply to grace note n over accidental on n-1 grace note', () => {
  const keys = ['f/5'];
  const abcKeySignature = AbcKeySignatures.CMajor;
  const fSharpWithFFlatGraceNote = AbcObjects.Notes.Eighths.FSharpWithFFlatGraceNote;
  const f = AbcObjects.Notes.Eighths.F;
  const barContents = [fSharpWithFFlatGraceNote, f];

  // The sharp accidental from the n-1 note should be applied, not the flat from the n-1 grace note
  expect(VexUtils.getTabPosition(keys, abcKeySignature, barContents, 1, tuning, true)).toStrictEqual([{ str: 1, fret: 2 }]);
});
