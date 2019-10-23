import ABCJS from 'abcjs';
import { Tune, Vex } from '../../index'; // this isn't index.js, that's why it's still importing tune.
import Tunes from '../tunes.txt';

const tuneSelect = document.getElementById('tuneSelect');
const vexflowRendered = document.getElementById('vexflowRendered'); // div
// const abcjsRendered = document.getElementById('abcjsRendered'); // div
const abcText = document.getElementById('abcText'); // p

const vexRendererWidth = 500;
const vexRendererHeight = 1000;

// load the tunes.txt tunes into the select...
const escapedTuneBook = Tunes.replace(/\"/g, '""');
const tunesArray = escapedTuneBook.split('\nX:'); // TODO: trim whitespace somewhere around here....
tunesArray.forEach((tune) => {
  let title = '';
  tune.split('\n').forEach((line) => {
    if (line.startsWith('T:')) {
      title = line.slice(2, line.length);
    }
  });
  const option = document.createElement('option');
  option.text = title;
  option.value = tune;
  tuneSelect.add(option);
});

tuneSelect.onchange = (event) => {
  // set abcText
  abcText.innerText = event.target.value;

  // render abcjs
  ABCJS.renderAbc('abcjsRendered', event.target.value);
  while (vexflowRendered.firstChild) {
    vexflowRendered.removeChild(vexflowRendered.firstChild);
  }

  // render abcjs-vexflow-renderer
  const renderer = new Vex.Flow.Renderer(vexflowRendered, Vex.Flow.Renderer.Backends.SVG);
  renderer.resize(vexRendererWidth, vexRendererHeight);
  const context = renderer.getContext();

  const renderOptions = {
    xOffset: 3,
    widthFactor: 27,
    lineHeight: 180,
    clefWidth: 40,
    meterWidth: 40,
    repeatWidthModifier: 35, // can't figure out why this is necessary but...
    // putting this to 2 makes it look better for the second part's lead-in, but makes it look worse
    // for the lead-in notes in the very first bar........
    dottedNotesModifier: 23,
    keySigAccidentalWidth: 20, // used to be 14 or 16...
    minWidthMultiplier: 2, // minimum bar width should be that of a bar with 2 notes
    renderWidth: 800
  };

  context.setViewBox(0, 0, renderOptions.renderWidth + 5, renderOptions.renderWidth + 5);
  context.svg.setAttribute('preserveAspectRatio', 'xMinYMin meet');

  try {
    const tune = new Tune(event.target.value, renderOptions);
    tune.drawToContext(context);
  } catch (err) {
    vexflowRendered.innerText = err;
  }
};
