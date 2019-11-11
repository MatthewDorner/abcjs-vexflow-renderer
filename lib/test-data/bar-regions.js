import DeepFreeze from 'deep-freeze';

import AbcjsObjects from './abcjs-objects';

const Empty = {
  startBarLine: {},
  endBarLine: {},
  contents: []
};

const TwoNotes = {
  startBarLine: {},
  endBarLine: {},
  contents: [
    AbcjsObjects.Notes.Eighths.F,
    AbcjsObjects.Notes.Eighths.F
  ]
};

const BarRegions = { Empty, TwoNotes };
DeepFreeze(BarRegions);
export default BarRegions;
