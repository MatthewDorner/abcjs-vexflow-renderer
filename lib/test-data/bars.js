import StaveNotes from './stave-notes';
import Bar from '../models/bar';

const EmptyBar = new Bar();

const TwoNotes = new Bar();
TwoNotes.notes = StaveNotes.FakeStaveNoteArrayFactory(2, 4, 0, ['f/5'], 1);

const Bars = { EmptyBar, TwoNotes };

export default Bars;
