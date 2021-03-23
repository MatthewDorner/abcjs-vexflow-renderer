import Vex from 'vexflow';

/**
 * Converts an abcjs key signature into VexFlow key signature
 * @param   {Object} abcKeySignature key signature in abcjs format
 *
 * @returns {Array} the tab positions such as [{str: 6, fret: 0}]
 */
export function convertKeySignature(abcKeySignature) {
  const { keySpecs } = Vex.Flow.keySignature;

  let numberOfAccidentals = 0;
  let accidentalType = '';
  abcKeySignature.accidentals.forEach((accidental) => {
    if (accidental.acc !== 'natural') {
      numberOfAccidentals += 1;
      accidentalType = accidental.acc;
    }
  });

  if (numberOfAccidentals === 0) {
    return 'C';
  }

  // need to have 'return' break the loop, otherwise it will carry through, for example 'C' will go on
  // to match 'Am' and then we'd end up with Am, that's why did Object.keys(), and then a for
  // loop.. however this assumes we always want the "Major" key and not the mode, but I think that
  // is actually correct
  const keys = Object.keys(keySpecs); // two unrelated meanings of 'key' here.
  for (let i = 0; i < keys.length; i += 1) {
    if (keySpecs[keys[i]].num === numberOfAccidentals) {
      if ((accidentalType === 'sharp' && keySpecs[keys[i]].acc === '#') || (accidentalType === 'flat' && keySpecs[keys[i]].acc === 'b')) {
        return keys[i];
      }
    }
  }

  // will cause error to be thrown when this is provided to VexFlow but that's ok
  // because something is wrong with the supplied key signature if that happens
  return null;
}

/**
 * Converts an abcjs duration into VexFlow duration
 * NOTE: this doesn't support double dotted notes. that's a problem
 * @param   {number} abcDuration duration in abcjs format .375
 *
 * @returns {Object} object hash: string of the VexFlow duration and
 * bool whether or not it's dotted { duration: '8', isDotted: false }
 */
export function getVexDuration(abcDuration) {
  let noteDuration = abcDuration;
  let isDotted = false;

  for (let j = 0; j < 6; j += 1) {
    const pow = 2 ** j;
    if (abcDuration === 1 / pow + (1 / pow) * 0.5) {
      noteDuration = 1 / pow;
      isDotted = true;
    }
  }

  // // abcjs provides this 0.0416666 but maybe it should actually be
  // // 0.046875, seen in Bal Gavotte in Sylvain Piron collection
  // // abcjs renders this as a dotted 32nd note but not sure if that's correct
  // if (abcDuration === 0.041666666666666664) {
  //   noteDuration = 32;
  //   isDotted = true;
  //   return {
  //     duration: '32',
  //     isDotted: true
  //   };
  // }

  // // similar bug? long long trail in Nottingham Dataset. again correcting
  // // so it's the same as abcjs output, will investigate. other dotted half
  // // notes don't have this problem, just this case
  // if (abcDuration === 0.625) {
  //   return {
  //     duration: '2',
  //     isDotted: true
  //   };
  // }

  /*
    some invalid durations are being produced from abcjs, apparently due to formatting errors,
    invalid characters in the abc text, weird duration fractions (7/2, 5/2 etc) but not sure
    exactly

    some will produce an error when fed to VexFlow, some (3.2) won't but will render the wrong duration
    note, so any that don't produce a clean integer 2, 4, 8, 16 etc after the calculations above
    should throw error
  */

  const durationNumber = 1 / noteDuration;
  if (!Number.isInteger(durationNumber)) {
    throw new Error(`getVexDuration: invalid duration. duration was: ${durationNumber}`);
  }

  const duration = durationNumber.toString();
  return { duration, isDotted };
}


// to convert notes between a-g, 0-7 and 0-11
export function getDiatonicFromLetter(letter) {
  // this will get a number with a being 0
  let diatonic = letter.charCodeAt(0) - 97;

  // change from a being 0 to c being 0
  if (diatonic < 2) {
    diatonic += 5;
  } else {
    diatonic -= 2;
  }
  return diatonic;
}

export function getChromaticFromLetter(letter) {
  const diatonic = getDiatonicFromLetter(letter);
  return getChromaticFromDiatonic(diatonic);
}

// starting with c, maps diatonic (0-7) to chromatic (0-11)
export function getChromaticFromDiatonic(diatonic) {
  return [0, 2, 4, 5, 7, 9, 11][diatonic];
}
