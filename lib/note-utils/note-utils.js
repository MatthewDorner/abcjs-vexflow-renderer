
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
  const diatonic = this.getDiatonicFromLetter(letter);
  return this.getChromaticFromDiatonic(diatonic);
}

// starting with c, maps diatonic (0-7) to chromatic (0-11)
export function getChromaticFromDiatonic(diatonic) {
  return [0, 2, 4, 5, 7, 9, 11][diatonic];
}

export function getVexAccidental(pitch) {
  return {
    sharp: '#',
    flat: 'b',
    dblsharp: '##',
    dblflat: 'bb',
    natural: 'n'
  }[pitch.accidental];
}

export function getSemitonesForAccidental(accidental) {
  return {
    '#': 1,
    b: -1,
    '##': 2,
    bb: -2,
    n: 0
  }[accidental];
}
