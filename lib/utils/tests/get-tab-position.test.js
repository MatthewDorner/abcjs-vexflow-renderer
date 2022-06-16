import { getTabPosition } from '../index';
import { TUNINGS } from '../../constants/tunings';

import AbcObjects from '../../test-data/abcjs-objects';
import AbcKeySignatures from '../../test-data/abc-key-signatures';

// TODO: separate unit tests from integration

test('e3 is lowest note on guitar', () => {
  const keys = ['e/3'];
  const abcKeySignature = AbcKeySignatures.CMajor;
  const barContents = [AbcObjects.Notes.Eighths.F];

  expect(getTabPosition(keys, abcKeySignature, barContents, 0, TUNINGS.GUITAR_STANDARD, false)).toStrictEqual([{ str: 6, fret: 0 }]);
});

test('sharped note causes itself and later notes to be sharped', () => {
  const keys = ['f/5'];
  const abcKeySignature = AbcKeySignatures.CMajor;
  const fSharp = AbcObjects.Notes.Eighths.FSharp;
  const f = AbcObjects.Notes.Eighths.F;
  const barContents = [f, fSharp, f];

  // str: 1, fret: 1 is F natural
  expect(getTabPosition(keys, abcKeySignature, barContents, 0, TUNINGS.GUITAR_STANDARD, false)).toStrictEqual([{ str: 1, fret: 1 }]);
  expect(getTabPosition(keys, abcKeySignature, barContents, 1, TUNINGS.GUITAR_STANDARD, false)).toStrictEqual([{ str: 1, fret: 2 }]);
  expect(getTabPosition(keys, abcKeySignature, barContents, 2, TUNINGS.GUITAR_STANDARD, false)).toStrictEqual([{ str: 1, fret: 2 }]);
});

test('sharp in key signature causes note to be sharped', () => {
  const keys = ['f/5'];
  const abcKeySignature = AbcKeySignatures.GMajor; // G Major has a sharped F
  const f = AbcObjects.Notes.Eighths.F;
  const barContents = [f];

  // str: 1, fret: 2 is F sharp
  expect(getTabPosition(keys, abcKeySignature, barContents, 0, TUNINGS.GUITAR_STANDARD, false)).toStrictEqual([{ str: 1, fret: 2 }]);
});

// bugfix: in abcjs key sig, accidental.note when the note is 'b',
// is  actually uppercase 'B', so had to add .toLowerCase() in the conditional statement
test('in B Flat Minor key, B notes get flatted', () => {
  const keys = ['b/5'];
  const abcKeySignature = AbcKeySignatures.BFlatMajor;
  const b = AbcObjects.Notes.Eighths.B;
  const barContents = [b];

  // str: 1, fret: 6 is B flat
  expect(getTabPosition(keys, abcKeySignature, barContents, 0, TUNINGS.GUITAR_STANDARD, false)).toStrictEqual([{ str: 1, fret: 6 }]);
  // now with C major key sig, should be a B natural
  expect(getTabPosition(keys, AbcKeySignatures.CMajor, barContents, 0, TUNINGS.GUITAR_STANDARD, false)).toStrictEqual([{ str: 1, fret: 7 }]);
});

test('sharped note, when sharp already exists in key sig, doesnt sharp the note twice', () => {
  const keys = ['f/5'];
  const abcKeySignature = AbcKeySignatures.GMajor; // G Major has a sharped F
  const fSharp = AbcObjects.Notes.Eighths.FSharp;
  const barContents = [fSharp];

  // str: 1, fret: 1 is F natural and str: 1, fret: 2 is F sharp. we're checking to make
  // sure it doesn't somehow end up str: 1, fret: 3
  expect(getTabPosition(keys, abcKeySignature, barContents, 0, TUNINGS.GUITAR_STANDARD, false)).toStrictEqual([{ str: 1, fret: 2 }]);
});

test('natural accidental cancels out key sig sharp', () => {
  const keys = ['f/5'];
  const abcKeySignature = AbcKeySignatures.GMajor;
  const fNatural = AbcObjects.Notes.Eighths.FNatural;
  const barContents = [fNatural];

  // the natural accidental on the specific note should cancel out the sharp accidental in the key sig
  // str: 1, fret: 1 is F natural
  expect(getTabPosition(keys, abcKeySignature, barContents, 0, TUNINGS.GUITAR_STANDARD, false)).toStrictEqual([{ str: 1, fret: 1 }]);
});

test('grace note - sharped grace note causes itself and later grace notes to be sharped', () => {
  const keys = ['f/5'];
  const abcKeySignature = AbcKeySignatures.CMajor;
  const cWithFSharpGraceNote = AbcObjects.Notes.Eighths.CWithFSharpGraceNote;
  const cWithFGraceNote = AbcObjects.Notes.Eighths.CWithFGraceNote;
  const barContents = [cWithFGraceNote, cWithFSharpGraceNote, cWithFGraceNote];

  // str: 1, fret: 1 is F natural
  // passing is GraceNote true, meaning we're getting tab position for the grace notes here
  expect(getTabPosition(keys, abcKeySignature, barContents, 0, TUNINGS.GUITAR_STANDARD, true)).toStrictEqual([{ str: 1, fret: 1 }]);
  expect(getTabPosition(keys, abcKeySignature, barContents, 1, TUNINGS.GUITAR_STANDARD, true)).toStrictEqual([{ str: 1, fret: 2 }]);
  expect(getTabPosition(keys, abcKeySignature, barContents, 2, TUNINGS.GUITAR_STANDARD, true)).toStrictEqual([{ str: 1, fret: 2 }]);
});

test('grace note - sharp in key signature causes grace note to be sharped', () => {
  const keys = ['f/5'];
  const abcKeySignature = AbcKeySignatures.GMajor; // G Major has a sharped F
  const cWithFGraceNote = AbcObjects.Notes.Eighths.CWithFGraceNote;
  const barContents = [cWithFGraceNote];

  // str: 1, fret: 2 is F sharp
  expect(getTabPosition(keys, abcKeySignature, barContents, 0, TUNINGS.GUITAR_STANDARD, true)).toStrictEqual([{ str: 1, fret: 2 }]);
});

test('grace note - sharped grace note causes later regular notes to be sharped', () => {
  const keys = ['f/5'];
  const abcKeySignature = AbcKeySignatures.CMajor;
  const f = AbcObjects.Notes.Eighths.F;
  const cWithFSharpGraceNote = AbcObjects.Notes.Eighths.CWithFSharpGraceNote;
  const barContents = [cWithFSharpGraceNote, f];

  // passing isGraceNote as false because we're testing a regular F note at position 1 and
  // confirming the sharp from previously sharped F grace note applies to it
  expect(getTabPosition(keys, abcKeySignature, barContents, 1, TUNINGS.GUITAR_STANDARD, false)).toStrictEqual([{ str: 1, fret: 2 }]);
});

test('grace note - sharped regular note causes later grace notes to be sharped', () => {
  const keys = ['f/5'];
  const abcKeySignature = AbcKeySignatures.CMajor;
  const fSharp = AbcObjects.Notes.Eighths.FSharp;
  const cWithFGraceNote = AbcObjects.Notes.Eighths.CWithFSharpGraceNote;
  const barContents = [fSharp, cWithFGraceNote];

  // passingisGraceNote as true because we're testing the F grace note attached to the C note
  // in position 1 and confirming it's sharped by the accidental from the F Sharp at position 0
  expect(getTabPosition(keys, abcKeySignature, barContents, 1, TUNINGS.GUITAR_STANDARD, true)).toStrictEqual([{ str: 1, fret: 2 }]);
});


test('grace note - natural accidental on grace note cancels out key sig sharp', () => {
  const keys = ['f/5'];
  const abcKeySignature = AbcKeySignatures.GMajor;
  const cWithFNaturalGraceNote = AbcObjects.Notes.Eighths.CWithFNaturalGraceNote;
  const barContents = [cWithFNaturalGraceNote];

  // the natural accidental on the specific grace note should cancel out the sharp accidental in the key sig
  // should be str: 1, fret: 1 for F natural
  expect(getTabPosition(keys, abcKeySignature, barContents, 0, TUNINGS.GUITAR_STANDARD, true)).toStrictEqual([{ str: 1, fret: 1 }]);
});


test('grace note - accidental on grace note does affect attached regular note', () => {
  const keys = ['f/5'];
  const abcKeySignature = AbcKeySignatures.CMajor;
  const fWithFSharpGraceNote = AbcObjects.Notes.Eighths.FWithFSharpGraceNote;
  const barContents = [fWithFSharpGraceNote];

  // The regular F has a F Sharp grace note attached (before) it, so the note should
  // become sharped, testing the regular note F so isGraceNote is false
  expect(getTabPosition(keys, abcKeySignature, barContents, 0, TUNINGS.GUITAR_STANDARD, false)).toStrictEqual([{ str: 1, fret: 2 }]);
});

test('grace note - grace is not affected by accidental on attached regular note', () => {
  const keys = ['f/5'];
  const abcKeySignature = AbcKeySignatures.CMajor;
  const fSharpWithFGraceNote = AbcObjects.Notes.Eighths.FSharpWithFGraceNote;
  const barContents = [fSharpWithFGraceNote];

  // Now it's a F Sharp regular note with a F grace note attached having no accidental. The
  // regular note comes "after" the grace not, so the grace note pitch should be F Natural
  expect(getTabPosition(keys, abcKeySignature, barContents, 0, TUNINGS.GUITAR_STANDARD, true)).toStrictEqual([{ str: 1, fret: 1 }]);
});

test('grace note - accidental on n-1 regular note will apply to regular note n over accidental on n-1 grace note', () => {
  const keys = ['f/5'];
  const abcKeySignature = AbcKeySignatures.CMajor;
  const fSharpWithFFlatGraceNote = AbcObjects.Notes.Eighths.FSharpWithFFlatGraceNote;
  const f = AbcObjects.Notes.Eighths.F;
  const barContents = [fSharpWithFFlatGraceNote, f];

  // The sharp accidental from the n-1 note should be applied, not the flat from the n-1 grace note
  expect(getTabPosition(keys, abcKeySignature, barContents, 1, TUNINGS.GUITAR_STANDARD, false)).toStrictEqual([{ str: 1, fret: 2 }]);
});

test('grace note - accidental on n-1 regular note will apply to grace note n over accidental on n-1 grace note', () => {
  const keys = ['f/5'];
  const abcKeySignature = AbcKeySignatures.CMajor;
  const fSharpWithFFlatGraceNote = AbcObjects.Notes.Eighths.FSharpWithFFlatGraceNote;
  const f = AbcObjects.Notes.Eighths.F;
  const barContents = [fSharpWithFFlatGraceNote, f];

  // The sharp accidental from the n-1 note should be applied, not the flat from the n-1 grace note
  expect(getTabPosition(keys, abcKeySignature, barContents, 1, TUNINGS.GUITAR_STANDARD, true)).toStrictEqual([{ str: 1, fret: 2 }]);
});

// TEST FOR TIN WHISTLE
test('tin whistle - C Major scale for C whistle', () => {
  // each will be put into its own single-element keys[] array
  const noteKeys = ['c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'd/5', 'e/5', 'f/5', 'g/5', 'a/5', 'b/5'];
  const abcKeySignature = AbcKeySignatures.CMajor;

  const barContents = []; // this wouldn't be empty but if it's OK I'll leave it?

  const expectedPositions = [
    '6',
    '5',
    '4',
    '3',
    '2',
    '1',
    '0',
    '6+',
    '5+',
    '4+',
    '3+',
    '2+',
    '1+',
    '0+'
  ];

  expectedPositions.forEach((position, i) => {
    expect(getTabPosition([noteKeys[i]], abcKeySignature, barContents, 1, TUNINGS.TIN_WHISTLE_C, false)).toStrictEqual([{ str: 1, fret: position }]);
  });
});
