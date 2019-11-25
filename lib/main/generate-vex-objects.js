import Vex from 'vexflow';
import { StaveNote } from 'vexflow/src/stavenote';
import { TabNote } from 'vexflow/src/tabnote';
import { Beam } from 'vexflow/src/beam';
import { Voice } from 'vexflow/src/voice';
import { Tuplet } from 'vexflow/src/tuplet';

import Bar from '../models/bar';
import Part from '../models/part';
import Tune from '../models/tune';
import VexUtils from '../vex-utils';

/**
 * Takes the array of PartRegions (each of which contains an array of BarRegions), and
 * generates the Tune object, which is similarly structured but with VexFlow StaveNote
 * and TabNote objects, instead of the abcjs output objects representing notes, rests, etc.
 * Tune also contains the tuneAttrs and renderOptions, so the Tune will contain all data
 * about the tune as it passes through the rest of processing stages. Uses the Tune, Part and Bar
 * classes defined in this library.
 * @param   {Array} partRegions The output of parseTuneStructure
 * @param   {Object} tuneAttrs Pieces of info about the tune as a whole
 * @param   {Object} renderOptions Options, should be documented more
 *
 * @returns {Object} The Tune object, containing arrays of Part and Bar objects
 */
export default function generateVexObjects(partRegions, tuneAttrs, renderOptions) {
  const tune = new Tune(tuneAttrs, renderOptions);

  let currentAbcKeySignature = tuneAttrs.abcKeySignature;

  partRegions.forEach((partRegion, partIndex) => {
    const currentPart = new Part(partRegion.title);
    tune.parts.push(currentPart);

    partRegion.barRegions.forEach((barRegion, barIndex) => {
      const currentBar = new Bar();
      if (barIndex === 0) { currentBar.isFirst = true; }
      let inTriplet = null;
      currentPart.bars.push(currentBar);

      barRegion.contents.forEach((obj, objIndex) => {
        if (obj.el_type === 'key') {
          currentAbcKeySignature = obj;
          currentBar.abcKeySignature = currentAbcKeySignature;
          return;
        }

        if (obj.el_type !== 'note') {
          return; // what else could it be?
        }

        if (obj.startTriplet) {
          inTriplet = {
            num_notes: obj.startTriplet,
            notes_occupied: Math.round(obj.startTriplet * obj.tripletMultiplier),
            notes: [],
            tabNotes: []
          };
        }

        const { duration, isDotted } = VexUtils.getVexDuration(obj.duration);
        let noteToAdd;

        // CREATE AND ADD MODIFIERS TO STAVE NOTE / REST
        if (!obj.rest) {
          const keys = VexUtils.getKeys(obj.pitches);
          const accidentals = VexUtils.getAccidentals(obj.pitches);

          noteToAdd = new StaveNote({
            clef: tuneAttrs.clef, keys, duration, auto_stem: true
          });

          accidentals.forEach((accidental, i) => {
            if (accidental) { noteToAdd.addAccidental(i, new Vex.Flow.Accidental(accidental)); }
          });

          // CREATE AND ADD MODIFIERS TO TAB NOTE
          const tabNoteToAdd = new TabNote({
            positions: VexUtils.getTabPosition(keys, tuneAttrs.abcKeySignature, barRegion.contents, objIndex),
            duration
          });
          if (isDotted) { tabNoteToAdd.addDot(); }
          if (inTriplet) { inTriplet.tabNotes.push(tabNoteToAdd); }
          currentBar.tabNotes.push(tabNoteToAdd);
        } else { // IS a rest
          noteToAdd = new StaveNote({
            clef: tuneAttrs.clef, keys: ['b/4'], duration: `${duration}r`
          });
        }

        // these parts happen whether it's a rest or not
        if (isDotted) { noteToAdd.addDotToAll(); }
        if (obj.chord) {
          let chordName = obj.chord[0].name;
          if (chordName.includes('♭')) {
            chordName = chordName.replace('♭', 'b');
          } // sharps don't cause a problem

          noteToAdd.addModifier(0, new Vex.Flow.Annotation(chordName)
            .setVerticalJustification(Vex.Flow.Annotation.VerticalJustify.TOP));
        }

        if (inTriplet) { inTriplet.notes.push(noteToAdd); }
        currentBar.notes.push(noteToAdd);

        if (obj.endTriplet) {
          currentBar.tuplets.push(new Tuplet(inTriplet.notes, {
            num_notes: inTriplet.num_notes,
            notes_occupied: inTriplet.notes_occupied,
          }));
          // I think still need to create tuplets for the tabNotes so they align correctly,
          // but don't want to draw them because it's already drawn in the regular stave
          currentBar.tabTuplets.push(new Tuplet(inTriplet.tabNotes, {
            num_notes: inTriplet.num_notes,
            notes_occupied: inTriplet.notes_occupied,
          }));
          inTriplet = null;
        }
      }); // end of barRegion.contents.forEach

      // set the voice so setBarPositions can use it to have VexFlow Formatter figure out the space needed
      const meterArray = tune.tuneAttrs.meter.split('/');
      const voice = new Voice({ num_beats: meterArray[0], beat_value: meterArray[1] });
      voice.setStrict(false);
      voice.addTickables(currentBar.notes);
      currentBar.voice = voice;

      if (partIndex === 0 && barIndex === 0) {
        currentBar.clef = tuneAttrs.clef;
        currentBar.meter = tuneAttrs.meter;
        if (!currentBar.abcKeySignature) {
          // must avoid running this code if it's already got a key signature set due to the 'key' object
          // being found in array... this check could be avoided if this code was placed above?? is there
          // a reason all the bar stuff is down here?
          currentBar.abcKeySignature = tuneAttrs.abcKeySignature;
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
    });
  });
  return tune;
}
