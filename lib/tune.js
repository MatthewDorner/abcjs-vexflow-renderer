import { Beam } from 'vexflow/src/beam';
import Vex from 'vexflow';
import { Stave } from 'vexflow/src/stave';
import { TabStave } from 'vexflow/src/tabstave';
// import { Voice } from 'vexflow/src/voice';
import { Formatter } from 'vexflow/src/formatter';
import { StaveNote } from 'vexflow/src/stavenote';
import { TabNote } from 'vexflow/src/tabnote';
import ABCJS from 'abcjs';
import Bar from './bar';
import Part from './part';
import VexUtils from './vex-utils';
import TuneArrayParser from './tune-array-parser';

export default class Tune {
  constructor(abcString, renderOptions) {
    this.renderOptions = renderOptions;

    // GET THE PARSED OBJECT AND PROPERTIES
    const parsedObject = ABCJS.parseOnly(abcString);
    // console.log('got parsedObject:');
    // console.log(parsedObject);

    const tuneObjArray = parsedObject[0].lines
      .map(line => line.staff[0].voices[0])
      .reduce((acc, val) => acc.concat(val), []);
    // console.log('got tuneObjArray:');
    // console.log(tuneObjArray);

    if (!parsedObject[0].lines[0]) {
      return; // context will be empty and can be rendered to blank
    }

    // GET THE TUNE ATTRIBUTES
    this.tuneAttrs = {
      meter: VexUtils.getMeter(abcString),
      clef: parsedObject[0].lines[0].staff[0].clef.type,
      abcKeySignature: parsedObject[0].lines[0].staff[0].key,
      vexKeySignature: VexUtils.convertKeySignature(parsedObject[0].lines[0].staff[0].key)
    };

    // PROCESS AND RENDER
    const structuredTune = TuneArrayParser.parseTuneStructure(tuneObjArray);
    // console.log('got structuredTune: ' + new Date());
    // console.log(structuredTune);
    this.tuneData = this.generateVexObjects(structuredTune);
    // console.log('got tuneData: ' + new Date());
    // console.log(this.tuneData);
    this.removeEmptyBars();
    // console.log('removed emptyBars: ' + new Date());
    // console.log(this.tuneData);
    this.setBarPositions();
    // console.log('set positionings: ' + new Date());
    // console.log(this.tuneData);
  }

  generateVexObjects(partRegions) {
    // array of VexPart objects to return
    const parts = [];

    // state to keep track of through entire tune, reluctantly
    let currentVexKeySignature = this.tuneAttrs.vexKeySignature;
    let currentAbcKeySignature = this.tuneAttrs.abcKeySignature;

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
              clef: this.tuneAttrs.clef, keys: ['b/4'], duration: `${duration}r`
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
            clef: this.tuneAttrs.clef, keys, duration, auto_stem: true
          });
          if (isDotted) {
            noteToAdd.addDotToAll();
            currentBar.dottedNotesCount += 1;
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
            positions: VexUtils.getTabPosition(keys, this.tuneAttrs.abcKeySignature, barRegion.contents, objIndex),
            duration
          });
          if (isDotted) { tabNoteToAdd.addDot(); }

          currentBar.notes.push(noteToAdd);
          currentBar.tabNotes.push(tabNoteToAdd);
        }); // end of bar.contents.forEach

        if (partIndex === 0 && barIndex === 0) {
          const {
            meter, clef, abcKeySignature, vexKeySignature
          } = this.tuneAttrs;
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

        const { meter } = this.tuneAttrs;
        if (meter === '3/8' || meter === '6/8' || meter === '9/8' || meter === '12/8') {
          currentBar.beams = VexUtils.generateBeamsCompound(currentBar.notes);
        } else {
          currentBar.beams = Beam.generateBeams(currentBar.notes);
        }
      }); // end of part.bars.forEach
    }); // end of parts.forEach
    return parts;
  }

  removeEmptyBars() {
    this.tuneData = this.tuneData.map((part, partIndex) => {
      const bars = part.bars.filter((bar, i) => {
        if (bar.notes.length === 0) {
          if (bar.vexKeySignature !== '') {
            if (i + 1 < part.bars.length) { // fiddle hill jig fails
              // shouldn't mutate part here...
              part.bars[i + 1].vexKeySignature = bar.vexKeySignature;
              part.bars[i + 1].abcKeySignature = bar.abcKeySignature;
            } else if (partIndex < (this.tuneData.length - 1) && this.tuneData[partIndex + 1].bars.length > 0) {
              // shouldn't mutate this.tuneData here... overhaul entire way of handling key signatures
              this.tuneData[partIndex + 1].bars[0].vexKeySignature = bar.vexKeySignature;
              this.tuneData[partIndex + 1].bars[0].abcKeySignature = bar.abcKeySignature;
            } else {
              // key signature gets lost?
            }
          }

          if (bar.repeats.includes(Vex.Flow.Barline.type.REPEAT_END)) {
            if (i > 0) {
              bars[i - 1].repeats.push(Vex.Flow.Barline.type.REPEAT_END);
            } else {
              // console.log('LOST A REPEAT_END');
            }
          }
          if (bar.repeats.includes(Vex.Flow.Barline.type.REPEAT_BEGIN)) {
            if (i > 0) {
              bars[i + 1].repeats.push(Vex.Flow.Barline.type.REPEAT_BEGIN);
            } else {
              // console.log('LOST A REPEAT_BEGIN');
            }
          }

          return false;
        }
        return true;
      });
      return {
        title: part.title,
        bars
      };
    });
  }

  setBarPositions() {
    const {
      renderWidth, xOffset, widthFactor, lineHeight, clefWidth, meterWidth, repeatWidthModifier, minWidthMultiplier, dottedNotesModifier, keySigAccidentalWidth
    } = this.renderOptions;

    let yCursor = (0 - (lineHeight * 1.25));

    this.tuneData = this.tuneData.map((part) => {
      const bars = part.bars.map((bar, i) => {
        const positionedBar = bar;
        let minWidth = bar.notes.length * widthFactor;

        if (bar.repeats.includes(Vex.Flow.Barline.type.REPEAT_END)) {
          minWidth += repeatWidthModifier;
        }

        minWidth += (dottedNotesModifier * bar.dottedNotesCount);

        if (minWidth > renderWidth) { minWidth = renderWidth; }

        if (minWidth < widthFactor * minWidthMultiplier) {
          minWidth = widthFactor * minWidthMultiplier;
        }
        if (bar.clef) { bar.clefSigMeterWidth += clefWidth; }
        if (bar.meter) { bar.clefSigMeterWidth += meterWidth; }

        if (bar.vexKeySignature !== '') { // checking 4 vex because I check for it in other cases...
          bar.clefSigMeterWidth += bar.abcKeySignature.accidentals.length * keySigAccidentalWidth;
        }

        // clefSigMeterWidth is left on the bar object becuase it's used in drawToContext
        minWidth += bar.clefSigMeterWidth;

        if (i === 0) { // first bar
          positionedBar.position.x = xOffset;
          positionedBar.position.y = (yCursor += (lineHeight * 1.25));
          // positionedBar.position.width = minWidth + clefsAndSigsWidth;
          positionedBar.position.width = minWidth; // already applied the clef, meter and sigs above
        } else if (part.bars[i - 1].position.x + part.bars[i - 1].position.width >= renderWidth) { // first bar on a new line
          positionedBar.position.x = xOffset;
          positionedBar.position.y = (yCursor += lineHeight);
          positionedBar.position.width = minWidth;
        } else { // bar on an incomplete line
          positionedBar.position.x = part.bars[i - 1].position.x + part.bars[i - 1].position.width;
          positionedBar.position.y = yCursor;
          positionedBar.position.width = minWidth;

          // check if next bar won't fit or there is no next bar. actually this doesn't work
          // if there's only one bar on the final line
          if (!part.bars[i + 1] || bar.position.x + minWidth + (part.bars[i + 1].notes.length * widthFactor) > renderWidth) {
            let extraSpace = (renderWidth - bar.position.x) - minWidth;
            let barsOnThisLine = 1;

            for (let j = i - 1; part.bars[j] && part.bars[j].position.y === bar.position.y; j -= 1) {
              barsOnThisLine += 1;
            }

            // if there will be extra space at the end because the next bar won't fit,
            // divide the extra space equally between all the bars on this line
            let spaceAdded = 0;
            for (let k = barsOnThisLine - 1; k >= 0; k -= 1) {
              const spaceToAdd = Math.floor(extraSpace / (k + 1));
              part.bars[i - k].position.x += spaceAdded;
              part.bars[i - k].position.width += spaceToAdd;
              extraSpace -= spaceToAdd;
              spaceAdded += spaceToAdd;
            }
          } else {
            positionedBar.position.width = minWidth;
          }
        }
        return positionedBar;
      });
      return {
        title: part.title,
        bars
      };
    });
  }

  // take positionedBars and draw it to the supplied VexFlow context
  drawToContext(context) {
    if (!this.tuneData) {
      return;
    }

    let stave;
    let tabStave;

    this.tuneData.forEach((part) => {
      part.bars.forEach((bar) => {
        if (bar.clefSigMeterWidth > 0) {
          const clefsStave = new Stave(bar.position.x, bar.position.y, bar.clefSigMeterWidth, { right_bar: false });
          const clefsTabStave = new TabStave(bar.position.x, bar.position.y + 50, bar.clefSigMeterWidth, { right_bar: false });

          clefsStave.setContext(context);
          clefsTabStave.setContext(context);

          if (bar.clef != '') { clefsStave.setClef(bar.clef); }
          if (bar.vexKeySignature != '') { clefsStave.setKeySignature(bar.vexKeySignature); }
          if (bar.meter != '') { clefsStave.setTimeSignature(bar.meter); }

          clefsStave.draw();
          clefsTabStave.draw();

          bar.position.x += bar.clefSigMeterWidth;
          bar.position.width -= bar.clefSigMeterWidth;

          stave = new Stave(bar.position.x, bar.position.y, bar.position.width, { left_bar: false });
          stave.setContext(context);
          tabStave = new TabStave(bar.position.x, bar.position.y + 50, bar.position.width, { left_bar: false });
          tabStave.setContext(context);
        } else {
          stave = new Stave(bar.position.x, bar.position.y, bar.position.width);
          stave.setContext(context);
          tabStave = new TabStave(bar.position.x, bar.position.y + 50, bar.position.width);
          tabStave.setContext(context);
        }

        if (bar.volta.type !== 0) { // 0 is the initialized value. could init to 1 which is the same as type NONE
          stave.setVoltaType(bar.volta.type, bar.volta.number.toString(), 15);
        }

        if (bar.repeats.includes(Vex.Flow.Barline.type.REPEAT_BEGIN)) {
          stave.setBegBarType(Vex.Flow.Barline.type.REPEAT_BEGIN);
          tabStave.setBegBarType(Vex.Flow.Barline.type.REPEAT_BEGIN);
        }
        if (bar.repeats.includes(Vex.Flow.Barline.type.REPEAT_END)) {
          stave.setEndBarType(Vex.Flow.Barline.type.REPEAT_END);
          tabStave.setEndBarType(Vex.Flow.Barline.type.REPEAT_END);
        }

        // WHAT DOES VOICE EVEN DO? it seems like I wasn't doing anything wiht it before.
        // const voice = new Voice({ num_beats: this.tuneAttrs.meter.charAt(0), beat_value: this.tuneAttrs.meter.charAt(2) });
        // voice.setStrict(false);
        // voice.addTickables(bar.notes);

        // DRAW
        tabStave.draw(); // drawing this first fixes the artiface w/ beams overlapping tab stave lines
        Formatter.FormatAndDraw(context, tabStave, bar.tabNotes);
        stave.draw();
        Formatter.FormatAndDraw(context, stave, bar.notes);
        bar.beams.forEach((b) => { b.setContext(context).draw(); });
      });
    });
  }
}
