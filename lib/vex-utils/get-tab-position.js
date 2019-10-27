import NoteUtils from './note-utils';

/**
 * Converts an array of VexFlow keys into array of guitar note positions.
 * Note:  this doesn't handle previous notes having multiple accidentals
 * (see the arrays just taking [0] instead of looking through the entire
 * array. this should be implemented.)
 * @param   {Array} keys the notes in VexFlow format such as ['e/3'];
 * @param   {Object} abcKeySignature key signature in abcjs format
 * @param   {Array} barContents the previous abcjs note objects in this bar
 * @param   {number} i the position of the current note in barContents
 *
 * @returns {Array} the tab positions such as [{str: 6, fret: 0}]
 */
export default function getTabPosition(keys, abcKeySignature, barContents, i) {
  const diatonicNote = NoteUtils.getDiatonicFromLetter(keys[0]);
  const chromaticNote = NoteUtils.getChromaticFromLetter(keys[0]);
  let chromaticWithAccidental = chromaticNote;

  abcKeySignature.accidentals.forEach((accidental) => {
    if (diatonicNote === NoteUtils.getDiatonicFromLetter(accidental.note.toLowerCase())) {
      switch (accidental.acc) {
        case 'sharp':
          chromaticWithAccidental = chromaticNote + 1;
          break;
        case 'flat':
          chromaticWithAccidental = chromaticNote - 1;
          break;
        default:
          break;
      }
    }
  });

  barContents.forEach((previousObj, j) => {
    if (previousObj.el_type === 'note' && !previousObj.rest) {
      const previousKeys = getKeys(previousObj.pitches);
      if (i >= j && getAccidentals(previousObj.pitches)[0]) {
        if (diatonicNote === NoteUtils.getDiatonicFromLetter(previousKeys[0])) {
          chromaticWithAccidental = chromaticNote + NoteUtils.getSemitonesForAccidental(getAccidentals(previousObj.pitches)[0]);
        }
      }
    }
  });

  const octave = keys[0].charAt(2);
  const noteNumber = octave * 12 + chromaticWithAccidental;
  const lowestNoteNumber = 28; // number for e2, lowest note on guitar
  let fretsFromZero = noteNumber - lowestNoteNumber;
  fretsFromZero -= 12; // "guitar plays octave lower than it reads", so actually e3 on paper is the lowest and plays as e2

  // correct for the major third interval between B and G strings
  if (fretsFromZero >= 19) {
    fretsFromZero += 1;
  }

  let left = fretsFromZero % 5;
  let top = 6 - (Math.floor((fretsFromZero) / 5)); // math.floor?

  if (top < 1) {
    left += (1 - top) * 5;
    top = 1;
  }
  return [{ str: top, fret: left }];
}

/**
 * Converts an array of pitches (from abcjs parsed object) into an array of
 * accidentals occurring in those pitches
 * @param   {Array} abcPitches such as [ { pitch: 10, verticalPos: 10, accidental: 'sharp' } ]
 *
 * @returns {Array} such as ['#']
 */
function getAccidentals(abcPitches) {
  const accidentals = [];

  abcPitches.forEach((pitch) => {
    const accidental = NoteUtils.getVexAccidental(pitch.accidental);
    accidentals.push(accidental);
  });

  return accidentals;
}

/**
 * Converts an array of pitches (from abcjs parsed object) into an array of
 * keys that can be used by VexFlow. For example, middle in the treble clef
 * is abc pitch number 6.
 * @param   {Array} abcPitches such as [ { pitch: 6, verticalPos: 6 } ]
 *
 * @returns {Array} such as [ 'b/4' ]
 */
function getKeys(abcPitches) {
  const keys = [];
  abcPitches.forEach((pitch) => {
    const notes = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
    const octave = (Math.floor(pitch.pitch / 7)); // this not right?? no, I think it is right.
    const vexOctave = octave + 4;
    const note = pitch.pitch - (octave * 7);
    keys.push(`${notes[note]}/${vexOctave.toString()}`);
  });

  return keys;
}
