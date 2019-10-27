import { Beam } from 'vexflow/src/beam';
import Vex from 'vexflow';
import NoteUtils from './note-utils';

export default {

  /**
     * Takes an array of the StaveNotes in a measure, and returns an array
     * of Beams. This is only for compound time signatures (3/8, 6/8,
     * 9/8, 12/8) as VexFlow's built-in beaming code hasn't worked for this.
     * This method doesn't need to know exactly what the time signature is,
     * just that it's compound something/8.
     * @param   {Array} notes the StaveNotes in this bar
     *
     * @returns {Array} the Beams for this bar
  */
  generateBeamsCompound(notes) {
    let timeLeft = 0.375;
    let notesToBeam = [];
    const beams = [];

    notes.forEach((note) => {
      let duration; let isRest;

      if (note.duration.includes('r')) {
        duration = 1 / (note.duration.slice(0, note.duration.indexOf('r')));
        isRest = true;
      } else {
        duration = 1 / note.duration;
        isRest = false;
      }

      switch (note.dots) {
        case 0:
          break;
        case 1:
          duration *= 1.5;
          break;
        case 2:
          duration *= 1.75;
          break;
        case 3:
          duration *= 1.875;
          break;
        default:
          break;
      }

      if (duration >= 0.250 || timeLeft <= 0) { // purge existing beams
        if (notesToBeam.length > 1) {
          beams.push(this.setStemDirectionandGenerateBeam(notesToBeam));
        }
        if (timeLeft <= 0) {
          timeLeft += 0.375;
        }
        notesToBeam = [];
      }

      if (duration < 0.250 && timeLeft >= duration && !isRest) {
        notesToBeam.push(note);
      }
      timeLeft -= duration;
    });

    // deal w/ notes left over at end of iterations
    if (notesToBeam.length > 1) {
      beams.push(this.setStemDirectionandGenerateBeam(notesToBeam));
    }

    // console.log('returning beams: ');
    // console.log(beams);

    return beams;
  },

  /**
   * Takes an array of the StaveNotes to be beamed, sets
   * the stem_direction of each note to be the same as the
   * first note, and returns a Beam of those notes.
   * @param   {Array} notes the StaveNotes to beam, should have
   * length greater than 1, otherwise there's no point.
   *
   * @returns {Array} the Beam of the notes.
  */
  setStemDirectionandGenerateBeam(notesToBeam) {
    const direction = notesToBeam[0].getStemDirection();
    notesToBeam.forEach((noteToBeam) => {
      noteToBeam.setStemDirection(direction);
    });
    return new Beam(notesToBeam);
  },

  /**
     * Converts an array of VexFlow keys into array of guitar note positions.
     * Note:  this doesn't handle previous notes having multiple accidentals
     * (see the arrays just taking [0] instead of looking through the entire
     * array. this should be implemented.)
     * @param   {Array} keys the notes in VexFlow format such as ['e/3'];
     * @param   {Object} abcKeySignature key signature in abcjs format
     * @param   {Array} barContents the previous abcjs note objects in this bar
     * @param   {number} i the position of the current note in barContents
     *
     * @returns {Array} the tab positions such as [{str: 6, fret: 0}]
  */
  getTabPosition(keys, abcKeySignature, barContents, i) {
    const diatonicNote = NoteUtils.getDiatonicFromLetter(keys[0]);
    const chromaticNote = NoteUtils.getChromaticFromLetter(keys[0]);

    let chromaticWithAccidental = chromaticNote;

    // will an abcjs key signature even ever contain a flat?
    abcKeySignature.accidentals.forEach((accidental) => {
      if (diatonicNote === NoteUtils.getDiatonicFromLetter(accidental.note.toLowerCase())) {
        switch (accidental.acc) {
          case 'sharp':
            chromaticWithAccidental = chromaticNote + 1;
            break;
          case 'flat':
            chromaticWithAccidental = chromaticNote - 1;
            break;
          default: // natural? key sig can theoretically contain those, can't it? but it wouldn't do anything.
            break;
        }
      }
    });

    // for each previous note in the bar
    barContents.forEach((previousObj, j) => {
      if (previousObj.el_type === 'note' && !previousObj.rest) {
        const previousKeys = this.getKeys(previousObj.pitches);

        // if the current note i (being evaluated by this method) occurs at the same time or later
        // to the current note j in this loop through barContents, AND if there is an accidental in
        // the current note j
        if (i >= j && this.getAccidentals(previousObj.pitches)[0]) {
          // console.log('abcjs obj with accidentals: ');
          // console.log(previousObj);

          // console.log('previousKeys was: ');
          // console.log(previousKeys);

          // if the current note i is the same letter as the previousObj note j
          if (diatonicNote === NoteUtils.getDiatonicFromLetter(previousKeys[0])) {
            // then the accidental from previous note j must be applied to i
            chromaticWithAccidental = chromaticNote + NoteUtils.getSemitonesForAccidental(this.getAccidentals(previousObj.pitches)[0]);
          }
        }
      }
    });

    const octave = keys[0].charAt(2);
    const noteNumber = octave * 12 + chromaticWithAccidental;
    const lowestNoteNumber = 28; // number for e2, lowest note on guitar
    let fretsFromZero = noteNumber - lowestNoteNumber;
    // "guitar plays octave lower than it reads" so actually e3 (as input to this
    // function in keys[]) will be the lowest supported
    fretsFromZero -= 12;

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
  },

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

  getKeys(abcPitches) {
    // console.log('abcPitches was:');
    // console.log(abcPitches);
    // middle B in treble clef is abc pitch number 6
    const keys = [];
    abcPitches.forEach((pitch) => {
      const notes = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
      const octave = (Math.floor(pitch.pitch / 7)); // this not right
      const vexOctave = octave + 4;
      const note = pitch.pitch - (octave * 7);
      keys.push(`${notes[note]}/${vexOctave.toString()}`);
    });

    // console.log("keys was: ");
    // console.log(keys);

    return keys;
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

  getAccidentals(abcPitches) {
    /*
            ACCIDENTALS

                so it seems like they're both working the same
                way and I don't even need to calculate
                accidentals. though I DO NEED TO calculate them when it comes to guitar tab, mainly
                sending the accidentals into the getTabPosition so it can take them into account

            ABCJS:
                pitch is {accidental: "sharp", pitch: 5, verticalPos: 5}

            VEXFLOW:
                new VF.StaveNote({clef: "treble", keys: ["c/5", "eb/5", "g#/5"], duration: "q" }).
                addAccidental(1, new VF.Accidental("b")).
                addAccidental(2, new VF.Accidental("#")).addDotToAll()
                ^ NOTE THAT THEY'RE INCLUDING THE ACCIDENTALS IN THE
                keys[], does it make any difference
                if I do that?
        */

    const accidentals = [];

    abcPitches.forEach((pitch) => {
      const accidental = NoteUtils.getVexAccidental(pitch.accidental);
      accidentals.push(accidental);
    });

    return accidentals;
  }
};
