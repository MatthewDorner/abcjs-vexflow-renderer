import { Beam } from 'vexflow/src/beam';
import Vex from 'vexflow';
import NoteUtils from './note-utils';

export default {

  /* calculate beams for compound time signatures */
  generateBeamsCompound(notes) {
    let timeLeft = 0.375;
    let notesToBeam = [];
    const beams = [];

    notes.forEach((note, i) => {
      let duration; let
        isRest;

      if (note.duration.includes('r')) {
        duration = 1 / (note.duration.slice(0, note.duration.indexOf('r')));
        isRest = true;
      } else {
        duration = 1 / note.duration;
        isRest = false;
      }

      if (duration >= 0.250 || timeLeft <= 0) { // purge existing beams
        if (notesToBeam.length > 1) {
          const direction = notesToBeam[0].getStemDirection();
          notesToBeam.forEach((noteToBeam) => {
            noteToBeam.setStemDirection(direction);
          });
          beams.push(new Beam(notesToBeam));
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

    // deal w/ notes left over at end of iteration
    if (notesToBeam.length > 1) {
      const direction = notesToBeam[0].getStemDirection();
      notesToBeam.forEach((note) => {
        note.setStemDirection(direction);
      });

      beams.push(new Beam(notesToBeam));
    }

    return beams;
  },

  /*
        convert the keys in vex format such as 'd/4' into guitar tab positions of string, fret
        needs to be updated to act on the entire array not just keys[0]

        TODO: need to take into account that if there's an accidental earlier in the bar, it applies to all notes in that position
        in the bar (if a C is marked #, later Cs in the bar, although they won't
        have an accidental, will also be sharped,
        unless they have a natural accidental) ALSO, IF AN ACCIDENTAL IS
        APPLIED THAT is already in the key signature,
        such as if C# was already in key signature but a C had a #
        accidental, it wouldn't do anything

        NOTE: it looks like abcjs includes the accidental every time, even if that note has already been
        marked as the same accidental in the same bar. actually it's probably? doing whatever the abc
        music indicates. which means, we should check what the rules are when writing abc, are you
        supposed to write an accidental each time you need one, or are you allowed to assume the
        accidental will continue unless you use a natural. a good question is, does ABC include
        a way of signing natural? yeah.. there are accidentals

    */
  getTabPosition(keys, abcKeySignature, barContents, i) {
    // //console.log('getting tabPosition for note: ' + i);
    const diatonicNote = NoteUtils.getDiatonicFromLetter(keys[0]);
    const chromaticNote = NoteUtils.getChromaticFromLetter(keys[0]);

    let chromaticWithKeySigApplied = chromaticNote;

    abcKeySignature.accidentals.forEach((accidental) => {
      if (diatonicNote === NoteUtils.getDiatonicFromLetter(accidental.note)) {
        switch (accidental.acc) {
          case 'sharp':
            chromaticWithKeySigApplied = chromaticNote + 1;
            // sharpedInKeySig = true; I don't need these?
            break;
          case 'flat':
            chromaticWithKeySigApplied = chromaticNote - 1;
            // flattedInKeySig = true;
            break;
          default:
            break;
        }
      }
    });

    let finalChromatic = chromaticWithKeySigApplied;

    // will this work if there's one accidental eralier in the bar and then a different
    // accidental later that overrides the first accidental for the same noot?

    // the following code will need to be tested thoroughly, or simplified
    barContents.forEach((previousObj, j) => {
      // //console.log('checking bar contents for accidentals: ' + j);
      // //console.log('can this note apply to current one? ' + (i >= j));
      if (previousObj.el_type === 'note' && !previousObj.rest) {
        const previousKeys = this.getKeys(previousObj.pitches);
        if (i >= j && this.getAccidentals(previousObj.pitches)[0]) {
          if (diatonicNote === NoteUtils.getDiatonicFromLetter(previousKeys[0])) {
            if (j !== i) {
              // console.log('NOTICE!!!!!!! THIS ACCIDENTAL WAS APPLIED FROM 1 NOTE TO ANOTHER');
            }
            // console.log('applied accidental from: ' + j + ' to note: ' + i);
            // console.log('accidental semitones change was: ' + NoteUtils.getSemitonesForAccidental(this.getAccidentals(previousObj.pitches)[0]));
            // console.log('accidental was: ' + this.getAccidentals(previousObj.pitches)[0]);
            finalChromatic = chromaticNote + NoteUtils.getSemitonesForAccidental(this.getAccidentals(previousObj.pitches)[0]);
          }
        }
      }
    });

    const octave = keys[0].charAt(2);
    const noteNumber = octave * 12 + finalChromatic;
    const lowestNoteNumber = 28; // number for e2, lowest note on guitar
    let fretsFromZero = noteNumber - lowestNoteNumber;
    // "guitar plays octave lower than it reads" so actually e3 will be the lowest supported
    fretsFromZero -= 12;

    // correct for the major third interval between B and G strings
    if (fretsFromZero >= 19) {
      fretsFromZero += 1;
    }

    let left = fretsFromZero % 5;
    let top = 6 - (Math.floor((fretsFromZero) / 5)); // math.floor?

    /*
        i eventually want to handle it so that if there are a bunch of notes up higher
        and mixed with lower notes, it'll put them all together in a higher position for
        easier playing. then again most of these songs won't have that and those notes
        will be pretty high above the treble clef..

        however there are a couple notes where it would make sense to do this on the b string
        so could just do it for those few cases
    */

    if (top < 1) {
      left += (1 - top) * 5;
      top = 1;
    }
    return [{ str: top, fret: left }];
  },

  // used to convert the key sig returned from abcjs parser into what VexFlow takes.
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

    for (const key in keySpecs) {
      if (keySpecs[key].num === numberOfAccidentals) {
        if (accidentalType === 'sharp' && keySpecs[key].acc === '#' || accidentalType === 'flat' && keySpecs[key].acc === 'b') {
          return key;
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
    // middle B in treble clef is abc pitch number 6
    const keys = [];
    abcPitches.forEach((pitch) => {
      const notes = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
      const octave = (Math.floor(pitch.pitch / 7)); // this not right
      const vexOctave = octave + 4;
      const note = pitch.pitch - (octave * 7);
      keys.push(`${notes[note]}/${vexOctave.toString()}`);
    });

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
