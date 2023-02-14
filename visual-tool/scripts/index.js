import ABCJS from 'abcjs';
import $ from 'jquery';
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

import TestDecorations from '../visual-test-cases/decorations.abc';
import TestDurations from '../visual-test-cases/durations.abc';
import TestCurves from '../visual-test-cases/curves.abc';
import TestGrace from '../visual-test-cases/grace.abc';

import '../index.css';

const allNottinghamTunes = Tunes1 + Tunes2 + Tunes3 + Tunes4 + Tunes5 + Tunes6 + Tunes7 + Tunes8 + Tunes9 + Tunes10 + Tunes11 + Tunes12 + Tunes13 + Tunes14;

const defaultRenderOptions = {
  xOffset: 3,
  widthFactor: 1.5,
  lineHeight: 190,
  clefWidth: 60,
  meterWidth: 25,
  repeatWidthModifier: 35,
  keySigAccidentalWidth: 10,
  tabsVisibility: 1,
  staveVisibility: 1,
  tabStemsVisibility: 0,
  voltaHeight: 27,
  renderWidth: 900,
  tuning: AbcjsVexFlowRenderer.TUNINGS.GUITAR_STANDARD,
};

let renderOptions = {};

const renderOptionsControls = [
  $('#xOffset')[0],
  $('#widthFactor')[0],
  $('#lineHeight')[0],
  $('#clefWidth')[0],
  $('#meterWidth')[0],
  $('#repeatWidthModifier')[0],
  $('#keySigAccidentalWidth')[0],
  $('#tabsVisibility')[0],
  $('#staveVisibility')[0],
  $('#tabStemsVisibility')[0],
  $('#voltaHeight')[0],
  $('#renderWidth')[0],
];

renderOptionsControls.forEach((control) => {
  control.onchange = (e) => {
    renderOptions[e.target.id] = parseFloat(e.target.value);
    renderTune($('#abcText')[0].innerText);
  };
});

$('#tuning')[0].onchange = (e) => {
  renderOptions.tuning = AbcjsVexFlowRenderer.TUNINGS[e.target.value];
  renderTune($('#abcText')[0].innerText);
};

const vexRendererWidth = 500;
const vexRendererHeight = 2000;

setDefaultRenderOptions();

function generateTunesArray(abcSongbookString) {
  return abcSongbookString.split('\nX:').filter((tune) => {
    if (tune) {
      return true;
    }
    return false;
  }).map((tune) => {
    if (!tune.startsWith('X:')) {
      return `X:${tune}`;
    }
    return tune;
  }).sort((a, b) => {
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
}

function getOptions(tunesArray) {
  const result = [];

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
    result.push(option);
  });

  return result;
}

function setDefaultRenderOptions() {
  renderOptions = Object.assign({}, defaultRenderOptions);

  renderOptionsControls.forEach((control) => {
    control.value = renderOptions[control.id];
  });
  $('#tuning')[0].value = 'GUITAR_STANDARD';
}

$('#applyDefaultOptions')[0].onclick = () => {
  setDefaultRenderOptions();
};

$('#testForErrors')[0].onclick = () => {
  let exceptionsText = '';
  $('#tuneSelect')[0].childNodes.forEach((option, i) => {
    setTimeout(() => {
      try {
        $('#abcText')[0].innerText = option.value;
        renderTune($('#abcText')[0].innerText);
      } catch (err) {
        exceptionsText += `${option.value}FAILED WITH: ${err}\n\n\n`;
        $('#errorText')[0].innerText = exceptionsText;
      }
    }, 1);
  });
};

$('#tunebookSelect')[0].onchange = (event) => {
  while ($('#tuneSelect')[0].firstChild) {
    $('#tuneSelect')[0].removeChild($('#tuneSelect')[0].firstChild);
  }

  let optionsToSet = [];
  if (event.target.value === 'nottingham') {
    optionsToSet = getOptions(generateTunesArray(allNottinghamTunes));
  } else if (event.target.value === 'decorations') {
    optionsToSet = getOptions(generateTunesArray(TestDecorations));
  } else if (event.target.value === 'durations') {
    optionsToSet = getOptions(generateTunesArray(TestDurations));
  } else if (event.target.value === 'curves') {
    optionsToSet = getOptions(generateTunesArray(TestCurves));
  } else if (event.target.value === 'grace') {
    optionsToSet = getOptions(generateTunesArray(TestGrace));
  } else {
    optionsToSet = getOptions(generateTunesArray(CustomTunes));
  }

  optionsToSet.forEach((option) => {
    $('#tuneSelect')[0].add(option);
  });
};

$('#tuneSelect')[0].onchange = (event) => {
  $('#abcText')[0].innerText = event.target.value;
  renderTune($('#abcText')[0].innerText);
};

function renderTune(abc) {
  // render abcjs
  ABCJS.renderAbc('abcjsRendered', abc);
  while ($('#vexflowRendered')[0].firstChild) {
    $('#vexflowRendered')[0].removeChild($('#vexflowRendered')[0].firstChild);
  }

  const abcjsSvg = document.querySelector('#abcjsRendered svg');
  abcjsSvg.setAttribute('viewBox', '0 0 762 200');
  abcjsSvg.setAttribute('preserveAspectRatio', 'xMidYMin meet');

  // render abcjs-vexflow-renderer
  const renderer = new Vex.Flow.Renderer($('#vexflowRendered')[0], Vex.Flow.Renderer.Backends.SVG);
  renderer.resize(vexRendererWidth, vexRendererHeight);
  const context = renderer.getContext();

  context.setViewBox(0, 0, renderOptions.renderWidth + 5, renderOptions.renderWidth + 5);
  context.svg.setAttribute('preserveAspectRatio', 'xMinYMin meet');

  try {
    const tune = AbcjsVexFlowRenderer.getTune(abc, renderOptions);
    AbcjsVexFlowRenderer.drawToContext(context, tune);
  } catch (err) {
    $('#vexflowRendered')[0].innerText = err;
    throw err;
  }
}

// to get the default tunes to populate in the <select>
const event = new Event('change', { value: 'nottingham' });
$('#tunebookSelect')[0].dispatchEvent(event);
