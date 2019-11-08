import Vex from 'vexflow';
import { Stave } from 'vexflow/src/stave';
import { TabStave } from 'vexflow/src/tabstave';
import { Formatter } from 'vexflow/src/formatter';

/**
 * Uses VexFlow API to draw the data in Tune object to the supplied VexFlow context.
 * @param   {Object} context The VexFlow context
 */
export default function drawToContext(context, tune) {
  if (tune.parts.length === 0) {
    return;
  }

  let stave; let tabStave;

  tune.parts.forEach((part) => {
    part.bars.forEach((bar) => {
      if (bar.position.clefSigMeterWidth > 0) {
        const clefsStave = new Stave(bar.position.x, bar.position.y, bar.position.clefSigMeterWidth, { right_bar: false });
        const clefsTabStave = new TabStave(bar.position.x, bar.position.y + 50, bar.position.clefSigMeterWidth, { right_bar: false });

        clefsStave.setContext(context);
        clefsTabStave.setContext(context);

        if (bar.clef !== '') { clefsStave.setClef(bar.clef); }
        if (bar.vexKeySignature !== '') { clefsStave.setKeySignature(bar.vexKeySignature); }
        if (bar.meter !== '') { clefsStave.setTimeSignature(bar.meter); }

        clefsStave.draw();
        clefsTabStave.draw();

        const newX = bar.position.x + bar.position.clefSigMeterWidth;
        const newWidth = bar.position.width - bar.position.clefSigMeterWidth;

        stave = new Stave(newX, bar.position.y, newWidth, { left_bar: false });
        stave.setContext(context);
        tabStave = new TabStave(newX, bar.position.y + 50, newWidth, { left_bar: false });
        tabStave.setContext(context);
      } else {
        stave = new Stave(bar.position.x, bar.position.y, bar.position.width);
        stave.setContext(context);
        tabStave = new TabStave(bar.position.x, bar.position.y + 50, bar.position.width);
        tabStave.setContext(context);
      }

      if (bar.volta.type !== 0) { // 0 is the initialized value. could init to 1 which is the same as type NONE
        stave.setVoltaType(bar.volta.type, bar.volta.number.toString(), tune.renderOptions.voltaHeight);
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
