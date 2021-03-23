export const TUNING_TYPES = {
  STRINGS_FRETTED: 'strings_fretted',
  STRINGS_FIDDLE_FINGERINGS: 'strings_fiddle_fingerings',
  WHISTLE: 'whistle',
  HARMONICA: 'harmonica'
};

export const TUNINGS = {
  GUITAR_STANDARD: {
    displayName: 'Guitar (EADGBE)',
    strings: ['e/3', 'a/3', 'd/4', 'g/4', 'b/4', 'e/5'],
    type: TUNING_TYPES.STRINGS_FRETTED
  },
  GUITAR_OPEN_D: {
    displayName: 'Guitar (DADF#AD)',
    strings: ['d/3', 'a/3', 'd/4', 'f/4#', 'a/4', 'd/5'],
    type: TUNING_TYPES.STRINGS_FRETTED
  },
  BANJO: {
    displayName: 'Banjo (GDGBD)',
    strings: ['d/4', 'g/4', 'b/4', 'd/5'],
    type: TUNING_TYPES.STRINGS_FRETTED
  },
  TENOR_BANJO: {
    displayName: 'Tenor Banjo (CGDA)',
    strings: ['c/4', 'g/4', 'd/5', 'a/5'],
    type: TUNING_TYPES.STRINGS_FRETTED
  },
  FIDDLE_STANDARD: {
    displayName: 'Fiddle/Mandolin (GDAE)',
    strings: ['g/3', 'd/4', 'a/4', 'e/5'],
    type: TUNING_TYPES.STRINGS_FRETTED
  },
  FIDDLE_STANDARD_FINGERINGS: {
    displayName: 'Fiddle Fingerings (GDAE)',
    strings: ['g/3', 'd/4', 'a/4', 'e/5'],
    type: TUNING_TYPES.STRINGS_FIDDLE_FINGERINGS
  },
  FIDDLE_CROSS: {
    displayName: 'Cross Fiddle (AEAE)',
    strings: ['a/3', 'e/4', 'a/4', 'e/5'],
    type: TUNING_TYPES.STRINGS_FRETTED
  },
  FIDDLE_CROSS_FINGERINGS: {
    displayName: 'Fiddle Fingerings (AEAE)',
    strings: ['a/3', 'e/4', 'a/4', 'e/5'],
    type: TUNING_TYPES.STRINGS_FIDDLE_FINGERINGS
  },
  TIN_WHISTLE_D: {
    displayName: 'Tin Whistle (D)',
    type: TUNING_TYPES.WHISTLE,
    pitchOffset: 0 // offset relative to D whistle
  },
  TIN_WHISTLE_C: {
    displayName: 'Tin Whistle (C)',
    type: TUNING_TYPES.WHISTLE,
    pitchOffset: -2
  },
  TIN_WHISTLE_B_FLAT: {
    displayName: 'Tin Whistle (Bb)',
    type: TUNING_TYPES.WHISTLE,
    pitchOffset: -4
  },
  HARMONICA_C: {
    displayName: 'Harmonica (C)',
    type: TUNING_TYPES.HARMONICA,
    pitchOffset: 0 // offset relative to C harmonica
  },
  HARMONICA_A: {
    displayName: 'Harmonica (A)',
    type: TUNING_TYPES.HARMONICA,
    pitchOffset: -3
  },
  HARMONICA_G: {
    displayName: 'Harmonica (G)',
    type: TUNING_TYPES.HARMONICA,
    pitchOffset: -5
  }
};
