import DeepFreeze from 'deep-freeze';
import Bars from './bars';

const TwoEmptyBars = {
  bars: [
    Bars.EmptyBar,
    Bars.EmptyBar
  ]
};

const FourEmptyBars = {
  bars: [
    Bars.EmptyBar,
    Bars.EmptyBar,
    Bars.EmptyBar,
    Bars.EmptyBar
  ]
};

const TwoBarsTwoNotesEach = {
  bars: [
    Bars.TwoNotes,
    Bars.TwoNotes
  ]
};

const Parts = { TwoEmptyBars, FourEmptyBars, TwoBarsTwoNotesEach };
DeepFreeze(Parts);
export default Parts;
