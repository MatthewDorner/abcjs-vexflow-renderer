export default {
  // to convert notes between a-g, 0-7 and 0-11

  getDiatonicFromLetter(letter) {
    // this will get a number with a being 0
    let diatonic = letter.charCodeAt(0) - 97;

    // change from a being 0 to c being 0
    if (diatonic < 2) {
      diatonic += 5;
    } else {
      diatonic -= 2;
    }
    return diatonic;
  },

  getChromaticFromLetter(letter) {
    const diatonic = this.getDiatonicFromLetter(letter);
    return this.getChromaticFromDiatonic(diatonic);
  },

  // starting with c, maps diatonic (0-7) to chromatic (0-11)
  getChromaticFromDiatonic(diatonic) {
    return [0, 2, 4, 5, 7, 9, 11][diatonic];
  },

  getVexAccidental(accidental) {
    const accidentals = {
      sharp: '#',
      flat: 'b',
      dblsharp: '##',
      dblflat: 'bb',
      natural: 'n'
    };
    return accidentals[accidental];
  },

  getSemitonesForAccidental(accidental) {
    const semitones = {
      '#': 1,
      b: -1,
      '##': 2,
      bb: -2,
      n: 0
    };
    return semitones[accidental];
  }
};
