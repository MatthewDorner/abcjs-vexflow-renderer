import NoteUtils from './note-utils';

/**
 * Converts an array of pitches (from abcjs parsed object) into an array of
 * accidentals occurring in those pitches
 * @param   {Array} abcPitches such as [ { pitch: 10, verticalPos: 10, accidental: 'sharp' } ]
 *
 * @returns {Array} such as ['#']
 */
export default function getAccidentals(abcPitches) {
  const accidentals = [];

  abcPitches.forEach((pitch) => {
    const accidental = NoteUtils.getVexAccidental(pitch.accidental);
    accidentals.push(accidental);
  });

  return accidentals;
}
