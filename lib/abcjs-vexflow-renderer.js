import ABCJS from 'abcjs';
import Vex from 'vexflow';
import { Stave } from 'vexflow/src/stave';
import { TabStave } from 'vexflow/src/tabstave';
import { Formatter } from 'vexflow/src/formatter';
// import { Voice } from 'vexflow/src/voice';

import generateVexObjects from './generate-vex-objects';
import removeEmptyBars from './remove-empty-bars';
import setBarPositions from './set-bar-positions';
import fillEmptySpace from './fill-empty-space';

import VexUtils from './vex-utils';
import TuneArrayParser from './tune-array-parser';

/**
 * The main class, and the only thing exported out of the library. Represents the parser for a single ABC
 * tune, which is supplied to the constructor, which will run all processing and store the intermediate
 * structure in tuneData property. Draw by calling drawToContext method with your prepared VexFlow context.
 */
export default class AbcjsVexFlowRenderer {
  /**
   * Takes the ABC notation text, calls abcjs parseOnly method on it, and then processes it further to prepare
   * to be drawn using VexFlow.
   * @param   {string} abcString The ABC tune string
   * @param   {Object} renderOptions Options, should be documented more
   */
  constructor(abcString, renderOptions) {
    this.renderOptions = renderOptions;

    // GET THE PARSED OBJECT AND PROPERTIES
    const parsedObject = ABCJS.parseOnly(abcString);
    const tuneObjArray = parsedObject[0].lines
      .map(line => line.staff[0].voices[0])
      .reduce((acc, val) => acc.concat(val), []);

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

    // PROCESS

    // tuneArrayParser should just be a function like all the others.
    // not sure if these should all assign to this.tuneData either.
    console.log(`test a ${new Date().getTime()}`);
    const structuredTune = TuneArrayParser.parseTuneStructure(tuneObjArray);
    console.log(`test b ${new Date().getTime()}`);

    // this is thee slowest... but I'm not even using Object.assign there so must be my
    // imagination it's getting slow, must be slow due to calling VexFlow so much?
    // in fact you wouldn't be mutating in that method anyway since this is where that
    // .tuneData structure gets created.
    this.tuneData = generateVexObjects(structuredTune, this.tuneAttrs);
    console.log(`test c ${new Date().getTime()}`);
    this.tuneData = removeEmptyBars(this.tuneData);
    console.log(`test d ${new Date().getTime()}`);
    this.tuneData = setBarPositions(this.tuneData, this.renderOptions);
    console.log(`test e ${new Date().getTime()}`);
    this.tuneData = fillEmptySpace(this.tuneData, this.renderOptions);
    console.log(`test f ${new Date().getTime()}`);
  }

  /**
   * Uses VexFlow API to draw the data in .tuneData to the supplied VexFlow context.
   * @param   {Object} context The VexFlow context
   */
  drawToContext(context) {
    if (!this.tuneData) {
      return;
    }

    let stave; let tabStave;

    this.tuneData.forEach((part) => {
      part.bars.forEach((bar) => {
        if (bar.clefSigMeterWidth > 0) {
          const clefsStave = new Stave(bar.position.x, bar.position.y, bar.clefSigMeterWidth, { right_bar: false });
          const clefsTabStave = new TabStave(bar.position.x, bar.position.y + 50, bar.clefSigMeterWidth, { right_bar: false });

          clefsStave.setContext(context);
          clefsTabStave.setContext(context);

          if (bar.clef !== '') { clefsStave.setClef(bar.clef); }
          if (bar.vexKeySignature !== '') { clefsStave.setKeySignature(bar.vexKeySignature); }
          if (bar.meter !== '') { clefsStave.setTimeSignature(bar.meter); }

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
