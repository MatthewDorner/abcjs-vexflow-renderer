import ABCJS from 'abcjs';
import { AbcjsVexFlowRenderer, Vex } from '../../index';

import CustomTunes from '../tunes.txt';
import Tunes1 from '../../node_modules/nottingham-dataset/ABC_cleaned/ashover.abc';
import Tunes2 from '../../node_modules/nottingham-dataset/ABC_cleaned/hpps.abc';
import Tunes3 from '../../node_modules/nottingham-dataset/ABC_cleaned/jigs.abc';
import Tunes4 from '../../node_modules/nottingham-dataset/ABC_cleaned/morris.abc';
import Tunes5 from '../../node_modules/nottingham-dataset/ABC_cleaned/playford.abc';
import Tunes6 from '../../node_modules/nottingham-dataset/ABC_cleaned/reelsa-c.abc';
import Tunes7 from '../../node_modules/nottingham-dataset/ABC_cleaned/reelsd-g.abc';
import Tunes8 from '../../node_modules/nottingham-dataset/ABC_cleaned/reelsh-l.abc';
import Tunes9 from '../../node_modules/nottingham-dataset/ABC_cleaned/reelsm-q.abc';
import Tunes10 from '../../node_modules/nottingham-dataset/ABC_cleaned/reelsr-t.abc';
import Tunes11 from '../../node_modules/nottingham-dataset/ABC_cleaned/reelsu-z.abc';
import Tunes12 from '../../node_modules/nottingham-dataset/ABC_cleaned/slip.abc';
import Tunes13 from '../../node_modules/nottingham-dataset/ABC_cleaned/waltzes.abc';
import Tunes14 from '../../node_modules/nottingham-dataset/ABC_cleaned/xmas.abc';

import '../index.css';

const allNottinghamTunes = Tunes1 + Tunes2 + Tunes3 + Tunes4 + Tunes5 + Tunes6 + Tunes7 + Tunes8 + Tunes9 + Tunes10 + Tunes11 + Tunes12 + Tunes13 + Tunes14;

const defaultRenderOptions = {
  xOffset: 3,
  widthFactor: 27,
  lineHeight: 180,
  clefWidth: 40,
  meterWidth: 40,
  repeatWidthModifier: 35,
  dottedNotesModifier: 23,
  keySigAccidentalWidth: 20,
  minWidthMultiplier: 2,
  tabsVisibility: 1,
  voltaHeight: 15,
  renderWidth: 800
};

let renderOptions = Object.assign({}, defaultRenderOptions);

const tuneSelect = document.getElementById('tuneSelect'); // select
const tunebookSelect = document.getElementById('tunebookSelect'); // select
const vexflowRendered = document.getElementById('vexflowRendered'); // div
const abcText = document.getElementById('abcText'); // p

// could just add these to an array, but it makes it easier to... refer to them this way...
const xOffset = document.getElementById('xOffset');
const widthFactor = document.getElementById('widthFactor');
const lineHeight = document.getElementById('lineHeight');
const clefWidth = document.getElementById('clefWidth');
const meterWidth = document.getElementById('meterWidth');
const repeatWidthModifier = document.getElementById('repeatWidthModifier');
const dottedNotesModifier = document.getElementById('dottedNotesModifier');
const keySigAccidentalWidth = document.getElementById('keySigAccidentalWidth');
const minWidthMultiplier = document.getElementById('minWidthMultiplier');
const tabsVisibility = document.getElementById('tabsVisibility');
const voltaHeight = document.getElementById('voltaHeight');
const renderWidth = document.getElementById('renderWidth');

const applyDefaultOptions = document.getElementById('applyDefaultOptions');

const renderOptionsControls = [
  xOffset,
  widthFactor,
  lineHeight,
  clefWidth,
  meterWidth,
  repeatWidthModifier,
  dottedNotesModifier,
  keySigAccidentalWidth,
  minWidthMultiplier,
  tabsVisibility,
  voltaHeight,
  renderWidth
];

renderOptionsControls.forEach((control) => {
  control.onchange = (e) => {
    renderOptions[e.target.id] = parseFloat(e.target.value);
    renderTunes();
  };
  control.value = defaultRenderOptions[control.id];
});

applyDefaultOptions.onclick = (e) => {
  renderOptionsControls.forEach((control) => {
    control.value = defaultRenderOptions[control.id];
  });
  setDefaultRenderOptions();
  renderTunes();
};

function setDefaultRenderOptions() {
  renderOptions = Object.assign({}, defaultRenderOptions);
}

// ADD RENDER OPTIONS CONTROLS INCLUDING THESE AND OTHERSE
const vexRendererWidth = 500;
const vexRendererHeight = 1000;

const customOptions = [];
const nottinghamOptions = [];

setDefaultRenderOptions();

// alphabetize nottingham Tunes
const nottinghamTunesArray = allNottinghamTunes.split('\nX:');
nottinghamTunesArray.sort((a, b) => {
  let aTitle = '';
  let bTitle = '';
  a.split('\n').forEach((line) => {
    if (line.startsWith('T:')) {
      aTitle = line.slice(2, line.length);
    }
  });
  b.split('\n').forEach((line) => {
    if (line.startsWith('T:')) {
      bTitle = line.slice(2, line.length);
    }
  });

  return (aTitle > bTitle);
});

// load the tunes.txt tunes into the select...
const customTunesArray = CustomTunes.split('\nX:');
customTunesArray.forEach((tune) => {
  let title = '';
  tune.split('\n').forEach((line) => {
    if (line.startsWith('T:')) {
      title = line.slice(2, line.length);
    }
  });
  const option = document.createElement('option');
  option.text = title;
  option.value = tune;
  customOptions.push(option);
});

// load nottingham tunes into select
nottinghamTunesArray.forEach((tune) => {
  let title = '';
  tune.split('\n').forEach((line) => {
    if (line.startsWith('T:')) {
      title = line.slice(2, line.length);
    }
  });
  const option = document.createElement('option');
  option.text = title;
  option.value = tune;
  nottinghamOptions.push(option);
});

tunebookSelect.onchange = (event) => {
  while (tuneSelect.firstChild) {
    tuneSelect.removeChild(tuneSelect.firstChild);
  }

  let optionsToSet = [];
  if (event.target.value === 'nottingham') {
    optionsToSet = nottinghamOptions;
  } else {
    optionsToSet = customOptions;
  }

  optionsToSet.forEach((option) => {
    tuneSelect.add(option);
  });
};

tuneSelect.onchange = (event) => {
  // set abcText
  abcText.innerText = event.target.value;
  renderTunes();

  // render abcjs
  // ABCJS.renderAbc('abcjsRendered', event.target.value);
  // while (vexflowRendered.firstChild) {
  //   vexflowRendered.removeChild(vexflowRendered.firstChild);
  // }

  // // render abcjs-vexflow-renderer
  // const renderer = new Vex.Flow.Renderer(vexflowRendered, Vex.Flow.Renderer.Backends.SVG);
  // renderer.resize(vexRendererWidth, vexRendererHeight);
  // const context = renderer.getContext();

  // context.setViewBox(0, 0, renderOptions.renderWidth + 5, renderOptions.renderWidth + 5);
  // context.svg.setAttribute('preserveAspectRatio', 'xMinYMin meet');

  // try {
  //   const tune = AbcjsVexFlowRenderer.getTune(event.target.value, renderOptions);
  //   AbcjsVexFlowRenderer.drawToContext(context, tune);
  // } catch (err) {
  //   vexflowRendered.innerText = err;
  // }
};

function renderTunes() {
  ABCJS.renderAbc('abcjsRendered', abcText.innerText);
  while (vexflowRendered.firstChild) {
    vexflowRendered.removeChild(vexflowRendered.firstChild);
  }

  // render abcjs-vexflow-renderer
  const renderer = new Vex.Flow.Renderer(vexflowRendered, Vex.Flow.Renderer.Backends.SVG);
  renderer.resize(vexRendererWidth, vexRendererHeight);
  const context = renderer.getContext();

  context.setViewBox(0, 0, renderOptions.renderWidth + 5, renderOptions.renderWidth + 5);
  context.svg.setAttribute('preserveAspectRatio', 'xMinYMin meet');

  console.log('caLLING WITH THESE OPTIONS');
  console.log(renderOptions);

  try {
    const tune = AbcjsVexFlowRenderer.getTune(abcText.innerText, renderOptions);
    AbcjsVexFlowRenderer.drawToContext(context, tune);
  } catch (err) {
    vexflowRendered.innerText = err;
    throw err;
  }
}
