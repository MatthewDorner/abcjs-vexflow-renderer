import NoteUtils from '../note-utils';
import getKeys from './get-keys';

/**
 * Converts an array of VexFlow keys into array of guitar note positions.
 * Note:  this doesn't handle previous notes having multiple accidentals
 * (see the arrays just taking [0] instead of looking through the entire
 * array. this should be implemented.)
 * @param   {Array} keys the notes in VexFlow format such as ['e/3'];
 * @param   {Object} abcKeySignature key signature in abcjs format
 * @param   {Array} barContents the previous abcjs note objects in this bar
 * @param   {number} index the position of the current note in barContents
 * @param   {bool} isGraceNote did the keys represent the regular note or grace notes attached
 * to note at this barContents index?
 *
 * @returns {Array} the tab positions such as [{str: 6, fret: 0}]
 */
export default function getTabPosition(keys, abcKeySignature, barContents, index, isGraceNote) {
  if (isGraceNote === undefined) {
    throw new Error('getTabPosition: isGraceNote argument must be supplied');
  }

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

  /*  apply accidentals from previous notes in the bar to the current note if appropriate (will
      overwrite, not add to the changes made above with key signature). when accidental occurs
      at the SAME barContents index as the note whose position is being calculated, it needs
      to be like this:

      accidental on a regular note at index n:
        - position being calculated for a regular note at n: apply accidental
        - position being calculated for a grace note at n: do not apply

      accidental on a grace note at index:
        - position being calculated for a regular note at n: apply
        - position being calculated for a grace note at n: apply

      or in other words, the precedence should be:
        - this is a regular note n:
            - apply acc from regular n
            - apply acc from grace n
            - apply acc from regular n-1
            - apply acc from grace n-1
        - this is a grace note n:
            - apply acc from grace note n
            - apply acc from regular n-1
            - apply acc from grace n-1

      This is why the previousAppliesToCurrent checks for isGraceNote on the second if block
      This is also why the if block that checks for accidentals on grace notes must come
      before the if block that checks for accidentals on regular notes, so regular n-1
      can have the opportunity to overwrite grace n-1, or in the case of note n and it's not
      a grace note, so regular n can overwrite grace n

      Just modified the code to actually step through the arrays of pitches and grace notes
      and consider the accidentals of each note in array, instead of just [0]. Haven't considered
      what tests are necessary for this. Understand it's not doing the same thing in each case.
      With pitches[] it's an array of pitches arranged vertically at one single index in
      barContents. with gracenotes[] it's an array of gracenotes arranged horizontally
      preceding the regular notes at that index
      */
  barContents.forEach((previousObj, j) => {
    if (previousObj.gracenotes && index >= j) {
      const previousKeys = getKeys(previousObj.gracenotes);
      previousObj.gracenotes.forEach((gracenote, k) => {
        const accidental = NoteUtils.getVexAccidental(gracenote);
        if (accidental && diatonicNote === NoteUtils.getDiatonicFromLetter(previousKeys[k])) {
          adjustedChromaticNote = chromaticNote + NoteUtils.getSemitonesForAccidental(accidental);
        }
      });
    }

    const previousAppliesToCurrent = (index >= j && !isGraceNote) || (index > j);
    if (previousAppliesToCurrent && previousObj.el_type === 'note' && !previousObj.rest) {
      const previousKeys = getKeys(previousObj.pitches);
      previousObj.pitches.forEach((pitch, k) => {
        const accidental = NoteUtils.getVexAccidental(pitch);
        if (accidental && diatonicNote === NoteUtils.getDiatonicFromLetter(previousKeys[k])) {
          adjustedChromaticNote = chromaticNote + NoteUtils.getSemitonesForAccidental(accidental);
        }
      });
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
