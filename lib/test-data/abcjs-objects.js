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
    B: {
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
    },
    CWithFGraceNote: {
      pitches: [
        {
          pitch: 7,
          verticalPos: 7
        }
      ],
      gracenotes: [
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
    CWithFSharpGraceNote: {
      pitches: [
        {
          pitch: 7,
          verticalPos: 7,
        }
      ],
      gracenotes: [
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
    CWithFNaturalGraceNote: {
      pitches: [
        {
          pitch: 7,
          verticalPos: 7,
        }
      ],
      gracenotes: [
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
    FWithFSharpGraceNote: {
      pitches: [
        {
          pitch: 10,
          verticalPos: 10,
        }
      ],
      gracenotes: [
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
    FSharpWithFGraceNote: {
      pitches: [
        {
          pitch: 10,
          verticalPos: 10,
          accidental: 'sharp'
        }
      ],
      gracenotes: [
        {
          pitch: 10,
          verticalPos: 10,
        }
      ],
      duration: 0.125,
      el_type: 'note',
      startChar: 313,
      endChar: 318,
      // endBeam: true
    },
    FSharpWithFFlatGraceNote: {
      pitches: [
        {
          pitch: 10,
          verticalPos: 10,
          accidental: 'sharp'
        }
      ],
      gracenotes: [
        {
          pitch: 10,
          verticalPos: 10,
          accidental: 'flat'
        }
      ],
      duration: 0.125,
      el_type: 'note',
      startChar: 313,
      endChar: 318,
      // endBeam: true
    },
  },
};
const AbcjsObjects = { Notes };
export default AbcjsObjects;
