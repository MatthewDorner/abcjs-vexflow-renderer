import Vex from 'vexflow';
import { StaveNote } from 'vexflow/src/stavenote';
import { TabNote } from 'vexflow/src/tabnote';
import { GraceNote } from 'vexflow/src/gracenote';
import { GraceTabNote } from 'vexflow/src/gracetabnote';
import { GraceNoteGroup } from 'vexflow/src/gracenotegroup';
import { Beam } from 'vexflow/src/beam';
import { Voice } from 'vexflow/src/voice';
import { Tuplet } from 'vexflow/src/tuplet';

// parts of the Tune data structure that will be created
import Bar from '../models/bar';
import Part from '../models/part';
import Tune from '../models/tune';

import VexUtils from '../vex-utils';
import NoteUtils from '../note-utils';

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
  let inVolta = false;

  partRegions.forEach((partRegion, partIndex) => {
    const currentPart = new Part(partRegion.title);
    tune.parts.push(currentPart);

    partRegion.barRegions.forEach((barRegion, barIndex) => {
      const currentBar = new Bar();
      currentPart.bars.push(currentBar);
      let inTriplet = null;

      if (barIndex === 0) { currentBar.isFirst = true; }
      if (partIndex === 0 && barIndex === 0) {
        currentBar.clef = tuneAttrs.clef;
        currentBar.meter = tuneAttrs.meter;
        if (!currentBar.abcKeySignature) {
          currentBar.abcKeySignature = tuneAttrs.abcKeySignature;
        }
      }
      if (['bar_right_repeat', 'bar_dbl_repeat'].includes(barRegion.endBarLine.type)) {
        currentBar.repeats.push(Vex.Flow.Barline.type.REPEAT_END);
      }
      if (['bar_left_repeat', 'bar_dbl_repeat'].includes(barRegion.startBarLine.type)) {
        currentBar.repeats.push(Vex.Flow.Barline.type.REPEAT_BEGIN);
      }

      if (barRegion.startBarLine.startEnding && barRegion.endBarLine.endEnding) {
        inVolta = false;
        currentBar.volta = {
          number: barRegion.startBarLine.startEnding,
          type: Vex.Flow.Volta.type.BEGIN_END
        };
      } else if (barRegion.startBarLine.startEnding) {
        inVolta = true;
        currentBar.volta = {
          number: barRegion.startBarLine.startEnding,
          type: Vex.Flow.Volta.type.BEGIN
        };
      } else if (barRegion.endBarLine.endEnding) {
        inVolta = false;
        currentBar.volta = {
          number: 0,
          type: Vex.Flow.Volta.type.END
        };
      } else if (inVolta) {
        currentBar.volta = {
          number: 0,
          type: Vex.Flow.Volta.type.MID
        };
      }

      barRegion.contents.forEach((obj, objIndex) => {
        if (obj.el_type === 'key') {
          currentBar.cancelKeySig = currentAbcKeySignature;
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
          const accidentals = obj.pitches.map(pitch => NoteUtils.getVexAccidental(pitch));

          noteToAdd = new StaveNote({
            clef: tuneAttrs.clef, keys, duration, auto_stem: true
          });
          VexUtils.addDecorations(noteToAdd, obj.decoration);
          accidentals.forEach((accidental, i) => {
            if (accidental) { noteToAdd.addAccidental(i, new Vex.Flow.Accidental(accidental)); }
          });

          // this is mostly duplicated with below. maybe can be put in a separate function
          if (obj.gracenotes) {
            const graceNotesArray = [];
            obj.gracenotes.forEach((graceNote) => {
              const graceKey = VexUtils.getKeys([graceNote])[0];
              const graceAccidental = NoteUtils.getVexAccidental(graceNote);
              const vexDuration = VexUtils.getVexDuration(graceNote.duration);
              const graceNoteToAdd = new GraceNote({ keys: [graceKey], duration: vexDuration.duration });
              if (graceAccidental) { graceNoteToAdd.addAccidental(0, new Vex.Flow.Accidental(graceAccidental)); }
              if (vexDuration.isDotted) { graceNoteToAdd.addDotToAll(); }
              graceNotesArray.push(graceNoteToAdd);
            });

            const graceNoteGroup = new GraceNoteGroup(graceNotesArray, true);
            noteToAdd.addModifier(0, graceNoteGroup.beamNotes());
          }

          // CREATE AND ADD MODIFIERS TO TAB NOTE
          const tabNoteToAdd = new TabNote({
            positions: VexUtils.getTabPosition(keys, currentAbcKeySignature, barRegion.contents, objIndex, renderOptions.tuning, false),
            duration
          });
          if (isDotted) { tabNoteToAdd.addDot(); }
          if (inTriplet) { inTriplet.tabNotes.push(tabNoteToAdd); }

          if (obj.gracenotes) {
            const tabGraceNotesArray = [];
            obj.gracenotes.forEach((graceNote) => {
              const graceKey = VexUtils.getKeys([graceNote])[0];
              const vexDuration = VexUtils.getVexDuration(graceNote.duration);
              const graceNoteToAdd = new GraceTabNote({
                positions: VexUtils.getTabPosition([graceKey], currentAbcKeySignature, barRegion.contents, objIndex, true),
                duration: vexDuration.duration
              });
              if (vexDuration.isDotted) { graceNoteToAdd.addDotToAll(); }
              tabGraceNotesArray.push(graceNoteToAdd);
            });
            const tabGraceNoteGroup = new GraceNoteGroup(tabGraceNotesArray, false);
            tabNoteToAdd.addModifier(tabGraceNoteGroup);
          }

          currentBar.tabNotes.push(tabNoteToAdd);
        } else { // IS a rest
          noteToAdd = new StaveNote({
            clef: tuneAttrs.clef, keys: ['b/4'], duration: `${duration}r`
          });

          // draw the rest in the tabStave too, so the rest of the tab notes align correctly
          const tabNoteToAdd = new StaveNote({
            clef: tuneAttrs.clef, keys: ['b/4'], duration: `${duration}r`
          });
          if (isDotted) { tabNoteToAdd.addDotToAll(); }
          currentBar.tabNotes.push(tabNoteToAdd);
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
        // check for inTriplet because triplets can technically cross over barlines in abcjs
        // but I don't think it's necessary to support this. in the case I found, it
        // didn't appear to be intentional
        if (obj.endTriplet && inTriplet) {
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
