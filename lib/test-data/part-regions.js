import DeepFreeze from 'deep-freeze';
import BarRegions from './bar-regions';

const TwoEmptyBars = {
  barRegions: [
    BarRegions.Empty,
    BarRegions.Empty
  ]
};

const TwoBarsTwoNotesEach = {
  barRegions: [
    BarRegions.TwoNotes,
    BarRegions.TwoNotes
  ]
};

const PartRegions = { TwoEmptyBars, TwoBarsTwoNotesEach };
DeepFreeze(PartRegions);
export default PartRegions;
