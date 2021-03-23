import { Beam } from 'vexflow/src/beam';

import StaveNotes from '../../test-data/stave-notes';
import { generateBeamsCompound } from '../index';

// there's an array of calls, each call is an array of arguments, and (in this case) argument 1 is an array of FakeStaveNotes

// calls[0] is a call
// calls[0][0] is an argument
// calls[0][0][0] is a FakeStaveNote

// yeah dots is simple a number.
// dot = 1 and a half, double dot = 1 and 3/4, triple dot = 1 and 7/8

// need to test patterns involving: dotted notes, 16th notes, rests
// each test case should present an entire bar's worth of notes, for simplicity
// also test tuplets

jest.mock('vexflow/src/beam');
Beam.mockReturnValue(null);

test('6 8th notes should result in 2 beams of 3 notes each', () => {
  const notes = StaveNotes.FakeStaveNoteArrayFactory(6, '8', 0, ['f/5'], 'alternate_stems');

  generateBeamsCompound(notes);

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

  generateBeamsCompound(notes);

  expect(Beam.mock.calls.length).toBe(1);
  expect(Beam.mock.calls[0][0].length).toBe(3);
  expect(Beam.mock.calls[0][0][0].duration).toBe('8');
  expect(Beam.mock.calls[0][0][1].duration).toBe('8');
  expect(Beam.mock.calls[0][0][2].duration).toBe('8');
});
