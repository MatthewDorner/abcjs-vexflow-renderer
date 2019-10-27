import Vex from 'vexflow';
import { StaveNote } from 'vexflow/src/stavenote';
import { TabNote } from 'vexflow/src/tabnote';
import { Beam } from 'vexflow/src/beam';

import Bar from './models/bar';
import Part from './models/part';
import VexUtils from './vex-utils';

/**
 * Takes the array of PartRegions (each of which contains an array of BarRegions), and generates what will become the
 * AbcjsVexFlowRenderer's .tuneData property, which is a similarly structured object but with VexFlow StaveNote and
 * TabNote objects, instead of the abcjs objects representing notes, rests, etc. Uses the Part and Bar classes defined
 * in this library.
 * @param   {string} abcString The ABC tune string
 * @param   {Object} renderOptions Options, should be documented more
 *
 * @returns {Array} Array of Part objects
 */
export default function generateVexObjects(partRegions, tuneAttrs) {
  // array of VexPart objects to return
  const parts = [];

  // state to keep track of through entire tune, reluctantly
  let currentVexKeySignature = tuneAttrs.vexKeySignature;
  let currentAbcKeySignature = tuneAttrs.abcKeySignature;

  partRegions.forEach((partRegion, partIndex) => {
    const currentPart = new Part(partRegion.title);
    parts.push(currentPart);

    partRegion.barRegions.forEach((barRegion, barIndex) => {
      const currentBar = new Bar();
      currentPart.bars.push(currentBar);

      barRegion.contents.forEach((obj, objIndex) => {
        if (obj.el_type === 'key') {
          currentAbcKeySignature = obj;
          currentVexKeySignature = VexUtils.convertKeySignature(obj);
          currentBar.vexKeySignature = currentVexKeySignature;
          currentBar.abcKeySignature = currentAbcKeySignature;
          return;
        }

        if (obj.rest) {
          const { duration, isDotted } = VexUtils.getVexDuration(obj.duration);
          const noteToAdd = new StaveNote({
            clef: tuneAttrs.clef, keys: ['b/4'], duration: `${duration}r`
          });
          if (isDotted) {
            noteToAdd.addDotToAll();
            currentBar.dottedNotesCount += 1;
          }
          if (obj.chord) {
            let chordName = obj.chord[0].name;
            if (chordName.includes('♭')) {
              chordName = chordName.replace('♭', 'b');
            } // sharps don't cause a problem but the flat symbol can't be displayed

            noteToAdd.addModifier(0, new Vex.Flow.Annotation(chordName)
              .setVerticalJustification(Vex.Flow.Annotation.VerticalJustify.TOP));
          }

          currentBar.notes.push(noteToAdd);
          return;
        }

        if (obj.el_type !== 'note') {
          return; // what else could it be?
        }

        // PROCESS PROPERTIES INTO VEXFLOW-FRIENDLY FORMS
        const keys = VexUtils.getKeys(obj.pitches);
        const accidentals = VexUtils.getAccidentals(obj.pitches);
        const { duration, isDotted } = VexUtils.getVexDuration(obj.duration);

        // CREATE AND ADD MODIFIERS TO STAVE NOTE
        const noteToAdd = new StaveNote({
          clef: tuneAttrs.clef, keys, duration, auto_stem: true
        });

        if (isDotted) {
          noteToAdd.addDotToAll();
          currentBar.dottedNotesCount += 1; // keep track of this due to spacing and positioning
        }
        accidentals.forEach((accidental, i) => {
          if (accidental) { noteToAdd.addAccidental(i, new Vex.Flow.Accidental(accidental)); }
        });

        if (obj.chord) {
          let chordName = obj.chord[0].name;
          if (chordName.includes('♭')) {
            chordName = chordName.replace('♭', 'b');
          } // sharps don't cause a problem

          noteToAdd.addModifier(0, new Vex.Flow.Annotation(chordName)
            .setVerticalJustification(Vex.Flow.Annotation.VerticalJustify.TOP));
        }

        // CREATE AND ADD MODIFIERS TO TAB NOTE
        const tabNoteToAdd = new TabNote({
          positions: VexUtils.getTabPosition(keys, tuneAttrs.abcKeySignature, barRegion.contents, objIndex),
          duration
        });
        if (isDotted) { tabNoteToAdd.addDot(); }

        currentBar.notes.push(noteToAdd);
        currentBar.tabNotes.push(tabNoteToAdd);
      }); // end of bar.contents.forEach

      if (partIndex === 0 && barIndex === 0) {
        const {
          meter, clef, abcKeySignature, vexKeySignature
        } = tuneAttrs;
        currentBar.clef = clef;
        currentBar.meter = meter;
        if (currentBar.vexKeySignature === '') {
          // must avoid running this code if it's already got a key signature set due to the 'key' object
          // being found in array... this check could be avoided if this code was placed above?? is there
          // a reason all the bar stuff is down here?
          currentBar.abcKeySignature = abcKeySignature;
          currentBar.vexKeySignature = vexKeySignature;
        }
      }

      currentBar.volta = VexUtils.getVolta(barRegion);
      if (['bar_right_repeat', 'bar_dbl_repeat'].includes(barRegion.endBarLine.type)) {
        currentBar.repeats.push(Vex.Flow.Barline.type.REPEAT_END);
      }
      if (['bar_left_repeat', 'bar_dbl_repeat'].includes(barRegion.startBarLine.type)) {
        currentBar.repeats.push(Vex.Flow.Barline.type.REPEAT_BEGIN);
      }

      const { meter } = tuneAttrs;
      if (meter === '3/8' || meter === '6/8' || meter === '9/8' || meter === '12/8') {
        currentBar.beams = VexUtils.generateBeamsCompound(currentBar.notes);
      } else {
        currentBar.beams = Beam.generateBeams(currentBar.notes);
      }
    }); // end of part.bars.forEach
  }); // end of parts.forEach
  return parts;
}
