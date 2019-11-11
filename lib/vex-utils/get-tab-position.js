import NoteUtils from '../note-utils';
import getKeys from './get-keys';
import getAccidentals from './get-accidentals';

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
  let adjustedChromaticNote = chromaticNote;

  // apply accidentals in key signature to the note
  abcKeySignature.accidentals.forEach((accidental) => {
    if (diatonicNote === NoteUtils.getDiatonicFromLetter(accidental.note.toLowerCase())) {
      switch (accidental.acc) {
        case 'sharp':
          adjustedChromaticNote = chromaticNote + 1;
          break;
        case 'flat':
          adjustedChromaticNote = chromaticNote - 1;
          break;
        default:
          break;
      }
    }
  });

  // apply accidentals from previous notes in the bar to the current note if appropriate (will
  // overwrite, not add to the changes made above with key signature)
  barContents.forEach((previousObj, j) => {
    if (previousObj.el_type === 'note' && !previousObj.rest) {
      const previousKeys = getKeys(previousObj.pitches);
      if (i >= j && getAccidentals(previousObj.pitches)[0]) {
        if (diatonicNote === NoteUtils.getDiatonicFromLetter(previousKeys[0])) {
          adjustedChromaticNote = chromaticNote + NoteUtils.getSemitonesForAccidental(getAccidentals(previousObj.pitches)[0]);
        }
      }
    }
  });

  const octave = keys[0].charAt(2);
  const noteNumber = octave * 12 + adjustedChromaticNote;
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
