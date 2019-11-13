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
export default Parts;
