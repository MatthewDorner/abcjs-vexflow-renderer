import Vex from 'vexflow';
import { Stave } from 'vexflow/src/stave';
import { TabStave } from 'vexflow/src/tabstave';
import { Formatter } from 'vexflow/src/formatter';
import { Curve } from 'vexflow/src/curve';
import { convertKeySignature } from '../utils';

/**
 * Uses VexFlow API to draw the data in Tune object to the supplied VexFlow context.
 * @param   {Object} context The VexFlow context
 * @param   {Object} tune The Tune object returned from getTune function
 */
export default function drawToContext(context, tune) {
  if (tune.parts.length === 0) {
    return;
  }

  let stave; let tabStave;
  const { tuning, tabsVisibility, staveVisibility } = tune.renderOptions;
  const tabNumberOfLines = tuning.strings ? tuning.strings.length : 1;

  tune.parts.forEach((part) => {
    part.bars.forEach((bar) => {
      let tabsPositionY;
      if (tune.renderOptions.staveVisibility) {
        tabsPositionY = bar.position.y + 60;
      } else {
        tabsPositionY = bar.position.y;
      }

      if (bar.position.clefSigMeterWidth > 0) {
        const clefsStave = new Stave(bar.position.x, bar.position.y, bar.position.clefSigMeterWidth, { right_bar: false });
        const clefsTabStave = new TabStave(bar.position.x, tabsPositionY, bar.position.clefSigMeterWidth, { right_bar: false });

        clefsTabStave.setNumLines(tabNumberOfLines);
        clefsStave.setContext(context);
        clefsTabStave.setContext(context);

        if (bar.clef) { clefsStave.setClef(bar.clef); }
        if (bar.abcKeySignature) {
          if (bar.cancelKeySig) {
            clefsStave.setKeySignature(convertKeySignature(bar.abcKeySignature), convertKeySignature(bar.cancelKeySig));
          } else {
            clefsStave.setKeySignature(convertKeySignature(bar.abcKeySignature));
          }
        }
        if (bar.meter) { clefsStave.setTimeSignature(bar.meter); }

        if (staveVisibility) {
          clefsStave.draw();
        }
        if (tabsVisibility) {
          clefsTabStave.draw();
        }

        const notesX = bar.position.x + bar.position.clefSigMeterWidth;
        const notesWidth = bar.position.width - bar.position.clefSigMeterWidth;

        stave = new Stave(notesX, bar.position.y, notesWidth, { left_bar: false });
        stave.setContext(context);
        tabStave = new TabStave(notesX, tabsPositionY, notesWidth, { left_bar: false });
        tabStave.setNumLines(tabNumberOfLines);
        tabStave.setContext(context);
      } else {
        stave = new Stave(bar.position.x, bar.position.y, bar.position.width);
        stave.setContext(context);
        tabStave = new TabStave(bar.position.x, tabsPositionY, bar.position.width);
        tabStave.setNumLines(tabNumberOfLines);
        tabStave.setContext(context);
      }

      if (bar.volta) {
        stave.setVoltaType(bar.volta.type, bar.volta.number.toString(), tune.renderOptions.voltaHeight);
      }

      if (bar.repeats.includes(Vex.Flow.Barline.type.REPEAT_BEGIN)) {
        stave.setBegBarType(Vex.Flow.Barline.type.REPEAT_BEGIN);
      }
      if (bar.repeats.includes(Vex.Flow.Barline.type.REPEAT_END)) {
        stave.setEndBarType(Vex.Flow.Barline.type.REPEAT_END);
      }

      // DRAW
      if (tabsVisibility) {
        tabStave.draw(); // drawing this first fixes the artifact w/ beams overlapping tab stave lines
        Formatter.FormatAndDraw(context, tabStave, bar.tabNotes);
      }
      if (staveVisibility) {
        stave.draw();
        Formatter.FormatAndDraw(context, stave, bar.notes);
        bar.beams.forEach((b) => { b.setContext(context).draw(); });
        bar.tuplets.forEach((tuplet) => {
          tuplet.setContext(context).draw();
        });
      }
    });

    // DRAW CURVES
    part.curves.forEach((partCurve) => {
      const vexCurve = new Curve(partCurve.startNote, partCurve.endNote, {
        thickness: 2,
        cps: [{ x: -5, y: 7 }, { x: 0, y: 7 }],
        x_shift: -10
      });
      vexCurve.setContext(context).draw();
    });
  });
}
