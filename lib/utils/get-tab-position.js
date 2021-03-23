import { getKeys } from './get-keys';
import { VEX_ACCIDENTAL_FROM_ABCJS, SEMITONES_FROM_ACCIDENTAL, TUNING_TYPES } from '../constants';
import { getDiatonicFromLetter, getChromaticFromLetter } from './utils'; // like this!SS

/**
 * Converts an array of VexFlow keys into array of guitar note positions.
 * TODO:  handle tab for multiple stacked notes instead of just keys[0]... this isn't really that hard,
 * just step through keys[] using the same code, only have to ensure the tab positions aren't on the same string.
 *
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
export function getTabPosition(keys, abcKeySignature, barContents, index, tuning, isGraceNote) {
  if (isGraceNote === undefined) {
    throw new Error('getTabPosition: isGraceNote argument must be supplied');
  }

  const diatonic = getDiatonicFromLetter(keys[0]);
  const absoluteChromatic = getAbsoluteChromatic(keys[0]);

  // this will hold the chromatic pitch after taking into account previous accidentals in the bar
  let adjustedAbsoluteChromatic = absoluteChromatic;

  // apply accidentals in key signature to the note
  abcKeySignature.accidentals.forEach((accidental) => {
    if (diatonic === getDiatonicFromLetter(accidental.note.toLowerCase())) {
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
      previousObj.gracenotes.forEach((graceNote, k) => {
        const accidental = VEX_ACCIDENTAL_FROM_ABCJS[graceNote.accidental];
        if (accidental && diatonic === getDiatonicFromLetter(previousKeys[k])) {
          adjustedAbsoluteChromatic = absoluteChromatic + SEMITONES_FROM_ACCIDENTAL[accidental];
        }
      });
    }

    const previousAppliesToCurrent = (index >= j && !isGraceNote) || (index > j);
    if (previousAppliesToCurrent && previousObj.el_type === 'note' && !previousObj.rest) {
      const previousKeys = getKeys(previousObj.pitches);
      previousObj.pitches.forEach((pitch, k) => {
        const accidental = VEX_ACCIDENTAL_FROM_ABCJS[pitch.accidental];
        if (accidental && diatonic === getDiatonicFromLetter(previousKeys[k])) {
          adjustedAbsoluteChromatic = absoluteChromatic + SEMITONES_FROM_ACCIDENTAL[accidental];
        }
      });
    }
  });

  if (tuning.type === TUNING_TYPES.WHISTLE) {
    return getTinWhistlePosition(adjustedAbsoluteChromatic, tuning.pitchOffset);
  } if (tuning.type === TUNING_TYPES.HARMONICA) {
    return getHarmonicaPosition(adjustedAbsoluteChromatic, tuning.pitchOffset);
  }

  const stringChromaticPitches = tuning.strings.map(string => getAbsoluteChromatic(string));
  let left;
  let top;

  if (adjustedAbsoluteChromatic < stringChromaticPitches[0]) {
    return [{ str: 1, fret: '?' }];
  }

  for (let i = 0; i < stringChromaticPitches.length; i += 1) {
    if (!(stringChromaticPitches[i + 1] && adjustedAbsoluteChromatic >= stringChromaticPitches[i + 1])) {
      top = stringChromaticPitches.length - i;
      left = adjustedAbsoluteChromatic - stringChromaticPitches[i];
      break;
    }
  }

  if (tuning.type === TUNING_TYPES.STRINGS_FIDDLE_FINGERINGS) {
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
  const chromaticNote = getChromaticFromLetter(key);
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
 * any notes beyond first position finger 4 will be displayed as '?'
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

/**
 * Converts a chromatic pitch value (should be same as MIDI note number, c3 == 48) to a diatonic harmonica position.
 * Supports harmonica in c, a, and g though would be trivial to support every pitch of harmonica.
 * @param {number} adjustedAbsoluteChromatic the pitch such as 48 for c3
 * @param {string} pitchOffset The pitch offset from 'c' harmonica positions
 *
 * @returns {Array} the tab positions for VexFlow. VexFlow thinks this is guitar tab, so we still specify string and
 * fret, but we can enter any string for fret, so we just write the positions in string form on the first line of tablature
 */
function getHarmonicaPosition(adjustedAbsoluteChromatic, pitchOffset) {

  // 'd' = draw bend, 'b' = blow bend, 'ob' = overblow, 'od' = overdraw
  const harmonicaPositions = [
    '^1', // c
    'v1d',
    'v1', // d
    '^1ob',
    '^2', // e
    'v2dd', // f
    'v2d',
    'v2', // g
    'v3ddd',
    'v3dd', // a
    'v3d',
    'v3', // b
    '^4', // c
    'v4d',
    'v4', // d
    '^4ob',
    '^5', // e
    'v5', // f
    '^5ob',
    '^6', // g
    'v6d',
    'v6', // a
    '^6ob',
    'v7', // b
    '^7', // c
    'v7od',
    'v8', // d
    '^8b',
    '^8', // e
    'v9', // f
    '^9b',
    '^9', // g
    'v9od',
    'v10', // a
    '^10bb',
    '^10bb', // b
    '^10', // c
    'v10od'
  ];

  const startPitch = 48 + pitchOffset;

  if (adjustedAbsoluteChromatic - startPitch >= 0 && adjustedAbsoluteChromatic - startPitch < harmonicaPositions.length) {
    return [{ str: 1, fret: harmonicaPositions[adjustedAbsoluteChromatic - startPitch] }];
  }
  return [{ str: 1, fret: '?' }];
}

/**
 * Converts a chromatic pitch value (should be same as MIDI note number, c3 == 48) to a tin whistle position.
 * Supports whistle in d, c, and b flat though would be trivial to support every pitch of whistle.
 * @param {number} adjustedAbsoluteChromatic the pitch such as 48 for c3
 * @param {string} key The pitch offset from 'd' whistle
 *
 * @returns {Array} the tab positions for VexFlow. VexFlow thinks this is guitar tab, so we still specify string and
 * fret, but we can enter any string for fret, so we just write the positions in string form on the first line of tablature
 */
function getTinWhistlePosition(adjustedAbsoluteChromatic, pitchOffset) {
  const whistlePositions = [
    '6', // D
    '5½',
    '5', // E
    '4½', // F
    '4',
    '3', // G
    '2½',
    '2', // A
    '1½',
    '1', // B
    '½', // C
    '0',
    '6+', // D
    '5½+',
    '5+', // E
    '4½+', // F
    '4+',
    '3+', // G
    '2½+',
    '2+', // A
    '1½+',
    '1+', // B
    '½+', // C
    '0+'
  ];

  const startPitch = 50 + pitchOffset;


  if (adjustedAbsoluteChromatic - startPitch >= 0 && adjustedAbsoluteChromatic - startPitch < whistlePositions.length) {
    return [{ str: 1, fret: whistlePositions[adjustedAbsoluteChromatic - startPitch] }];
  }
  return [{ str: 1, fret: '?' }];
}
