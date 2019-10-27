import Vex from 'vexflow';

export default {

  /**
   * Converts an abcjs key signature into VexFlow key signature
   * @param   {Object} abcKeySignature key signature in abcjs format
   *
   * @returns {Array} the tab positions such as [{str: 6, fret: 0}]
   */
  convertKeySignature(abcKeySignature) {
    const { keySpecs } = Vex.Flow.keySignature;
    if (abcKeySignature.accidentals.length === 0) {
      return 'C';
    }

    let numberOfAccidentals = 0;
    let accidentalType = '';
    abcKeySignature.accidentals.forEach((accidental) => {
      if (accidental.acc !== 'natural') {
        numberOfAccidentals += 1;
        accidentalType = accidental.acc;
      }
    });

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

    return false;
  },

  /*
    since the built in functions in abc parsed object doesn't seem to work
  */
  getMeter(abcString) {
    const lines = abcString.split('\n');
    const meterLine = lines.filter(line => line.charAt(0) === 'M');
    if (meterLine[0]) {
      // apparently it may also be such as "M: ", with a space. although I could
      // handle this at some other point, whenever I clean whitespace
      return meterLine[0].slice(2, meterLine[0].length).trim();
    }
    return ''; // fix and make consistent null checks, etc...
  },

  // getVolta(obj, length, barVoltaStarted, inVolta) {
  getVolta(obj) {
    // this won't work for figuring out MID voltas but they probably won't occur anyway...
    // don't really want to keep track of stuff between iterations
    if (obj.startBarLine.startEnding && obj.endBarLine.endEnding) {
      return {
        number: obj.startBarLine.startEnding,
        type: Vex.Flow.Volta.type.BEGIN_END
      };
    } if (obj.startBarLine.startEnding) {
      return {
        number: obj.startBarLine.startEnding,
        type: Vex.Flow.Volta.type.BEGIN
      };
    } if (obj.endBarLine.endEnding) {
      return { // not going to be able to know the number
        number: 0,
        type: Vex.Flow.Volta.type.END
      };
    }
    return {
      number: 0,
      type: 0
    };
  },

  getVexDuration(abcDuration) {
    let noteDuration = abcDuration;
    let isDotted = false;

    for (let j = 0; j < 5; j += 1) {
      const pow = 2 ** j;
      if (abcDuration === 1 / pow + (1 / pow) * 0.5) {
        noteDuration = 1 / pow;
        isDotted = true;
      }
    }
    const duration = (1 / noteDuration).toString();
    return { duration, isDotted };
  },
};
