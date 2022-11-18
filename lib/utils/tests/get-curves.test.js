import AbcObjects from '../../test-data/abcjs-objects';
import { getCurves } from '../index';
import StaveNotes from '../../test-data/stave-notes';
import { merge } from '../../js-utils/combine-merge';

test('no curve markers', () => {
  const curves = [];
  const obj = AbcObjects.Notes.Eighths.F;
  const noteToAdd = new StaveNotes.FakeStaveNote(8, 0, ['f/5'], -1);

  expect(getCurves(curves, obj, noteToAdd)).toStrictEqual([]);
});

test('pitch has startSlur', () => {
  const curves = [];
  const obj = merge(AbcObjects.Notes.Eighths.F, {
    pitches: [{ startSlur: [{ label: 0 }] }]
  });
  const noteToAdd = new StaveNotes.FakeStaveNote(8, 0, ['f/5'], -1);

  expect(getCurves(curves, obj, noteToAdd)).toStrictEqual([{ startNote: noteToAdd }]);
});

test('pitch has startTie', () => {
  const curves = [];
  const obj = merge(AbcObjects.Notes.Eighths.F, {
    pitches: [{ startTie: {} }]
  });
  const noteToAdd = new StaveNotes.FakeStaveNote(8, 0, ['f/5'], -1);

  expect(getCurves(curves, obj, noteToAdd)).toStrictEqual([{ startNote: noteToAdd }]);
});

test('pitch has endSlur completing existing curve', () => {
  const obj = merge(AbcObjects.Notes.Eighths.F, {
    pitches: [{ endSlur: [0] }]
  });
  const startNote = new StaveNotes.FakeStaveNote(8, 0, ['f/5'], -1);
  const noteToAdd = new StaveNotes.FakeStaveNote(8, 0, ['f/5'], -1);
  const curves = [{ startNote }];

  expect(getCurves(curves, obj, noteToAdd)).toStrictEqual([{ startNote, endNote: noteToAdd }]);
});

test('pitch has endTie completing existing curve', () => {
  const obj = merge(AbcObjects.Notes.Eighths.F, {
    pitches: [{ endTie: true }]
  });
  const startNote = new StaveNotes.FakeStaveNote(8, 0, ['f/5'], -1);
  const noteToAdd = new StaveNotes.FakeStaveNote(8, 0, ['f/5'], -1);
  const curves = [{ startNote }];

  expect(getCurves(curves, obj, noteToAdd)).toStrictEqual([{ startNote, endNote: noteToAdd }]);
});

test('obj has startSlur', () => {
  const obj = merge(AbcObjects.Notes.Eighths.F, {
    startSlur: [{ label: 0 }]
  });
  const noteToAdd = new StaveNotes.FakeStaveNote(8, 0, ['f/5'], -1);
  const curves = [];

  expect(getCurves(curves, obj, noteToAdd)).toStrictEqual([{ startNote: noteToAdd }]);
});

test('obj has endSlur completing existing curve', () => {
  const obj = merge(AbcObjects.Notes.Eighths.F, {
    endSlur: [0]
  });
  const startNote = new StaveNotes.FakeStaveNote(8, 0, ['f/5'], -1);
  const noteToAdd = new StaveNotes.FakeStaveNote(8, 0, ['f/5'], -1);
  const curves = [{ startNote }];

  expect(getCurves(curves, obj, noteToAdd)).toStrictEqual([{ startNote, endNote: noteToAdd }]);
});
