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
 * @param   {Array} tuning object with: array of tuning from lowest string to highest in VexFlow format
 * such as ['e/3', 'a/3', 'd/4', 'g/4', 'b/4', 'e/5'], and optionally a showFingerings flag which instructs
 * the function to output violin fingerings like finger "1" instead of tab position 2, low finger "v2"
 * instead of tab position 3, etc.
 * @param   {bool} isGraceNote did the keys represent the regular note or grace notes attached
 * to note at this barContents index?
 *
 * @returns {Array} the tab positions such as [{str: 6, fret: 0}]
 */
export default function getTabPosition(keys, abcKeySignature, barContents, index, tuning, isGraceNote) {
  if (isGraceNote === undefined) {
    throw new Error('getTabPosition: isGraceNote argument must be supplied');
  }

  const diatonic = NoteUtils.getDiatonicFromLetter(keys[0]);
  const absoluteChromatic = getAbsoluteChromatic(keys[0]);
  let adjustedAbsoluteChromatic = absoluteChromatic;

  // apply accidentals in key signature to the note
  abcKeySignature.accidentals.forEach((accidental) => {
    if (diatonic === NoteUtils.getDiatonicFromLetter(accidental.note.toLowerCase())) {
      switch (accidental.acc) {
        case 'sharp':
          adjustedAbsoluteChromatic = absoluteChromatic + 1;
          break;
        case 'flat':
          adjustedAbsoluteChromatic = absoluteChromatic - 1;
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

      accidental on a grace note at index n:
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
        if (accidental && diatonic === NoteUtils.getDiatonicFromLetter(previousKeys[k])) {
          adjustedAbsoluteChromatic = absoluteChromatic + NoteUtils.getSemitonesForAccidental(accidental);
        }
      });
    }

    const previousAppliesToCurrent = (index >= j && !isGraceNote) || (index > j);
    if (previousAppliesToCurrent && previousObj.el_type === 'note' && !previousObj.rest) {
      const previousKeys = getKeys(previousObj.pitches);
      previousObj.pitches.forEach((pitch, k) => {
        const accidental = NoteUtils.getVexAccidental(pitch);
        if (accidental && diatonic === NoteUtils.getDiatonicFromLetter(previousKeys[k])) {
          adjustedAbsoluteChromatic = absoluteChromatic + NoteUtils.getSemitonesForAccidental(accidental);
        }
      });
    }
  });

  const stringNumbers = tuning.tuning.map(string => getAbsoluteChromatic(string));
  let left;
  let top;

  if (adjustedAbsoluteChromatic < stringNumbers[0]) {
    throw new Error('Note is out of range of instrument tuning provided');
  }

  for (let i = 0; i < stringNumbers.length; i += 1) {
    if (!(stringNumbers[i + 1] && adjustedAbsoluteChromatic >= stringNumbers[i + 1])) {
      top = stringNumbers.length - i;
      left = adjustedAbsoluteChromatic - stringNumbers[i];
      break;
    }
  }

  if (tuning.showFingerings) {
    left = convertToFingering(left);
  }

  return [{ str: top, fret: left }];
}

/**
 * Converts a VexFlow key into a chromatic note number starting from 0 at (C0 or C1 I think)
 * @param   {string} key the note in VexFlow format such as 'e/3';
 *
 * @returns {Array} the note number such as 28 ??? or is that E2??
 */
function getAbsoluteChromatic(key) {
  const chromaticNote = NoteUtils.getChromaticFromLetter(key);
  const octave = key.charAt(2);
  let noteNumber = octave * 12 + chromaticNote;
  if (key.charAt(3) === '#') {
    noteNumber += 1;
  } else if (key.charAt(3) === 'b') {
    noteNumber -= 1;
  }
  return noteNumber;
}

/**
 * Converts a fret position (for a given string) to a violin fingering. Works for first position,
 * any notes beyond first position finger 4 will be displayed as '?' but that shouldn't be a big
 * deal.
 * @param {number} fret the fret such as 2
 *
 * @returns {string} the violin fingering such as '1'. VexFlow accepts a string or a number
 * parameter, so it's not a problem that I'm taking a number and returning string
 */
function convertToFingering(fret) {
  switch (fret) {
    case 0:
      return '0';
    case 1:
      return 'v1';
    case 2:
      return '1';
    case 3:
      return 'v2';
    case 4:
      return '2';
    case 5:
      return '3';
    case 6:
      return 'v4';
    case 7:
      return '4';
    default:
      return '?';
  }
}
