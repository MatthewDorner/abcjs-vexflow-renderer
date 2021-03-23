import { merge } from '../../js-utils/combine-merge';
import fillEmptySpace from '../fill-empty-space';
import Parts from '../../test-data/parts';
import RenderOptions from '../../test-data/render-options';
import TuneAttrsJigA from '../../test-data/tune-attrs-jig-a';

// TODO: MULTI LINE PARTS, MORE THAN 2 BARS PER PART

test('should extend last bar to end of renderWidth', () => {
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
        position: {
          x: 0,
          y: 100,
          width: 100
        }
      }, {
        position: {
          x: 100,
          y: 100,
          width: 12
        }
      }]
    }, { // next part
      bars: [{
        position: {
          x: 0,
          y: 200,
          width: 50
        }
      }, {
        position: {
          x: 50,
          y: 200,
          width: 150
        }
      }]
    }]
  });

  const output = fillEmptySpace(customTune);
  expect(output.parts[0].bars[0].position.width + output.parts[0].bars[1].position.width).toBe(RenderOptions.renderWidth);
  expect(output.parts[1].bars[0].position.width + output.parts[1].bars[1].position.width).toBe(RenderOptions.renderWidth);
});

test('sum of bar widths should be renderWidth', () => {
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
        position: {
          x: 0,
          y: 100,
          width: 130
        }
      }, {
        position: {
          x: 130,
          y: 100,
          width: 12
        }
      }]
    }, { // next part
      bars: [{
        position: {
          x: 0,
          y: 200,
          width: 331
        }
      }, {
        position: {
          x: 331,
          y: 200,
          width: 150
        }
      }]
    }]
  });

  const output = fillEmptySpace(customTune);
  expect(output.parts[0].bars[0].position.width + output.parts[0].bars[1].position.width).toBe(RenderOptions.renderWidth);
  expect(output.parts[1].bars[0].position.width + output.parts[1].bars[1].position.width).toBe(RenderOptions.renderWidth);
});
