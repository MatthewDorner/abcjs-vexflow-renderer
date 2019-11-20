import { Formatter } from 'vexflow/src/formatter';
import merge from '../../js-utils/combine-merge';
import setBarPositions from '../set-bar-positions';
import Parts from '../../test-data/parts';
import RenderOptions from '../../test-data/render-options';
import TuneAttrsJigA from '../../test-data/tune-attrs-jig-a';
import StaveNotes from '../../test-data/stave-notes';

jest.mock('vexflow/src/formatter');
Formatter.mockReturnValue({});

/*
  Still need to figure out what to assert
*/
test('two parts two empty bars each', () => {
  const tune = {
    renderOptions: RenderOptions,
    tuneAttrs: TuneAttrsJigA,
    parts: [
      Parts.TwoEmptyBars,
      Parts.TwoEmptyBars
    ]
  };

  const output = setBarPositions(tune);
  // expect(output.parts[0].bars[0].position.width + output.parts[0].bars[1].position.width).toBe(RenderOptions.renderWidth)
  // expect(output.parts[1].bars[0].position.width + output.parts[0].bars[1].position.width).toBe(RenderOptions.renderWidth)
});

test('two parts two bars each two notes each', () => {
  const tune = {
    renderOptions: RenderOptions,
    tuneAttrs: TuneAttrsJigA,
    parts: [
      Parts.TwoEmptyBars,
      Parts.TwoEmptyBars
    ]
  };

  const customTune = merge(tune, {
    parts: [{
      bars: [{
        notes: StaveNotes.FakeStaveNoteArrayFactory(2, 2, 0, ['f/5'], 1)
      }, {
        notes: StaveNotes.FakeStaveNoteArrayFactory(2, 2, 0, ['f/5'], 1)
      }]
    }, { // next part
      bars: [{
        notes: StaveNotes.FakeStaveNoteArrayFactory(2, 2, 0, ['f/5'], 1)
      }, {
        notes: StaveNotes.FakeStaveNoteArrayFactory(2, 2, 0, ['f/5'], 1)
      }]
    }]
  });

  const output = setBarPositions(customTune);
  // expect(output.parts[0].bars[0].position.width + output.parts[0].bars[1].position.width).toBe(RenderOptions.renderWidth);
  // expect(output.parts[1].bars[0].position.width + output.parts[1].bars[1].position.width).toBe(RenderOptions.renderWidth);
});
