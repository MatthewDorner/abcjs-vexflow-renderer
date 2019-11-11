// VexFlow methods to mock
import { StaveNote } from 'vexflow/src/stavenote';
import { TabNote } from 'vexflow/src/tabnote';

// Function being tested
import generateVexObjects from '../generate-vex-objects';

// My own methods to mock
import VexUtils from '../../vex-utils';

// test data
import TuneAttrsJigA from '../../test-data/tune-attrs-jig-a';
import RenderOptions from '../../test-data/render-options';
import PartRegions from '../../test-data/part-regions';

VexUtils.convertKeySignature = jest.fn();
VexUtils.getVexDuration = jest.fn(() => ({ duration: '8', isDotted: false }));
VexUtils.getKeys = jest.fn();
VexUtils.getAccidentals = jest.fn(() => []);
VexUtils.getTabPosition = jest.fn();
VexUtils.getVolta = jest.fn();
VexUtils.generateBeamsCompound = jest.fn();

jest.mock('vexflow/src/stavenote');
jest.mock('vexflow/src/tabnote');
StaveNote.mockReturnValue({});
TabNote.mockReturnValue({});

// assert calls to mocked functions?

test('should generate 2 parts with 2 bars each', () => {
  const partRegions = [
    PartRegions.TwoEmptyBars,
    PartRegions.TwoEmptyBars
  ];

  const output = generateVexObjects(partRegions, TuneAttrsJigA, RenderOptions);
  expect(output.parts[0].bars.length).toBe(2);
  expect(output.parts[1].bars.length).toBe(2);
});

test('should generate 2 parts with 2 bars each with 2 notes each', () => {
  const partRegions = [
    PartRegions.TwoBarsTwoNotesEach,
    PartRegions.TwoBarsTwoNotesEach
  ];

  const output = generateVexObjects(partRegions, TuneAttrsJigA, RenderOptions);
  expect(output.parts[0].bars[0].notes.length).toBe(2);
  expect(output.parts[0].bars[1].notes.length).toBe(2);
  expect(output.parts[1].bars[0].notes.length).toBe(2);
  expect(output.parts[1].bars[1].notes.length).toBe(2);
});
