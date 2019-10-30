// middle B in treble clef (b/5) is abc pitch number 6

const Notes = {
  Eighths: {
    F: {
      pitches: [
        {
          pitch: 10,
          verticalPos: 10
        }
      ],
      duration: 0.125,
      el_type: 'note',
      startChar: 313,
      endChar: 318,
      // endBeam: true // will need to test beaming sometime 
    },
    FSharp: {
      pitches: [
        {
          pitch: 10,
          verticalPos: 10,
          accidental: 'sharp'
        }
      ],
      duration: 0.125,
      el_type: 'note',
      startChar: 313,
      endChar: 318,
      // endBeam: true
    },
    FNatural: {
      pitches: [
        {
          pitch: 10,
          verticalPos: 10,
          accidental: 'natural'
        }
      ],
      duration: 0.125,
      el_type: 'note',
      startChar: 313,
      endChar: 318,
      // endBeam: true
    },
    BNatural: {
      pitches: [
        {
          pitch: 6,
          verticalPos: 6
          // accidental: 'sharp'
        }
      ],
      duration: 0.125,
      el_type: 'note',
      startChar: 313,
      endChar: 318,
      // endBeam: true
    }
  },
};

export default { Notes };
