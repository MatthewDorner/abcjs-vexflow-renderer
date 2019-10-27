import { Beam } from 'vexflow/src/beam';
import VexUtils from './vex-utils';

// TEST DATA
import AbcObjects from '../test_data/abcjs-objects';
import AbcKeySignatures from '../test_data/abc-key-signatures';
import StaveNotes from '../test_data/stave-notes';

// ------------------------------------ getTabPosition --------------------------------------------------------

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

// ------------------------------------ generateBeamsCompount ---------------------------------------------------

// there's an array of calls, each call is an array of arguments, and (in this case) argument 1 is an array of FakeStaveNotes

// calls[0] is a call
// calls[0][0] is an argument
// calls[0][0][0] is a FakeStaveNote

// yeah dots is simple a number.
// dot = 1 and a half, double dot = 1 and 3/4, triple dot = 1 and 7/8

// need to test patterns involving: dotted notes, 16th notes, rests
// each test case should present an entire bar's worth of notes, for simplicity

jest.mock('vexflow/src/beam');
Beam.mockReturnValue(null);

test('6 8th notes should result in 2 beams of 3 notes each', () => {
  const notes = StaveNotes.FakeStaveNoteArrayFactory(6, '8', 0, ['f/5'], 'alternate_stems');

  VexUtils.generateBeamsCompound(notes);

  expect(Beam.mock.calls.length).toBe(2);
  expect(Beam.mock.calls[0][0].length).toBe(3); // 3 notes in the first beam
  expect(Beam.mock.calls[1][0].length).toBe(3); // 3 notes in the second beam
});

jest.mock('vexflow/src/beam');
Beam.mockReturnValue(null);

// change this to a dotted quarter
test('3 eighth notes and a quarter note should result in the eighth notes being beamed', () => {
  const quarterNote = StaveNotes.FakeStaveNoteArrayFactory(1, '4', 0, ['f/5'], 'alternate_stems');
  const eighthNotes = StaveNotes.FakeStaveNoteArrayFactory(3, '8', 0, ['f/5'], 'alternate_stems');
  const notes = eighthNotes.concat(quarterNote);

  VexUtils.generateBeamsCompound(notes);

  expect(Beam.mock.calls.length).toBe(1);
  expect(Beam.mock.calls[0][0].length).toBe(3);
  expect(Beam.mock.calls[0][0][0].duration).toBe('8');
  expect(Beam.mock.calls[0][0][1].duration).toBe('8');
  expect(Beam.mock.calls[0][0][2].duration).toBe('8');
});
