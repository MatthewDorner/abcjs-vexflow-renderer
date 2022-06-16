import Bars from './bars';

const TwoEmptyBars = {
  bars: [
    Bars.EmptyBar,
    Bars.EmptyBar
  ],
  curves: []
};

const FourEmptyBars = {
  bars: [
    Bars.EmptyBar,
    Bars.EmptyBar,
    Bars.EmptyBar,
    Bars.EmptyBar
  ],
  curves: []
};

const TwoBarsTwoNotesEach = {
  bars: [
    Bars.TwoNotes,
    Bars.TwoNotes
  ],
  curves: []
};

const Parts = { TwoEmptyBars, FourEmptyBars, TwoBarsTwoNotesEach };
export default Parts;
