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

import 'bootstrap/dist/css/bootstrap.min.css';
import '../index.css';

const allNottinghamTunes = Tunes1 + Tunes2 + Tunes3 + Tunes4 + Tunes5 + Tunes6 + Tunes7 + Tunes8 + Tunes9 + Tunes10 + Tunes11 + Tunes12 + Tunes13 + Tunes14;
const tunebookFiles = {
  'Nottingham Dataset': allNottinghamTunes,
  'Decorations Test': TestDecorations,
  'Durations Test': TestDurations,
  'Curves Test': TestCurves,
  'Grace Test': TestGrace,
  'Custom file at visual-tool/tunes.txt': CustomTunes
};

// keys must match form input elements in index.html, for instance there should be a #xOffset, #widthFactor, etc.
// since we iterate through keys of this object and use to manipulate HTML elements which should have the key as their HTML element ID
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

$('#testForErrors')[0].onclick = () => {
  let exceptionsText = '';
  $('#tuneSelect')[0].childNodes.forEach((option) => {
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

  const tunebookOptions = getTunebookOptions(tunebookFiles[event.target.value]);

  tunebookOptions.forEach((option) => {
    $('#tuneSelect')[0].add(option);
  });
};

$('#tuneSelect')[0].onchange = (event) => {
  $('#abcText')[0].innerText = event.target.value;
  renderTune();
};

function init() {
  const tunebookOptions = [];

  Object.keys(tunebookFiles).forEach((key) => {
    const option = document.createElement('option');
    option.text = key;
    option.value = key;
    tunebookOptions.push(option);
  });

  tunebookOptions.forEach((option) => {
    $('#tunebookSelect')[0].add(option);
  });

  Object.keys(defaultRenderOptions).forEach((key) => {
    $(`#${key}`)[0].onchange = () => {
      renderTune($('#abcText')[0].innerText);
    };

    $(`#${key}`)[0].value = defaultRenderOptions[key];
  });
  $('#tuning')[0].value = 'GUITAR_STANDARD';

  $('#applyDefaultOptions')[0].onclick = () => {
    init();
    renderTune();
  };

  const event = new Event('change', { value: 'Nottingham Dataset' });
  $('#tunebookSelect')[0].dispatchEvent(event);
}

function getTunebookOptions(abcSongbookString) {
  const result = [];

  const tunesArray = abcSongbookString.split('\nX:').filter((tune) => {
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

function renderTune() {
  const abc = $('#abcText')[0].innerText;
  const renderOptions = {};
  Object.keys(defaultRenderOptions).forEach((key) => {
    if (key === 'tuning') {
      renderOptions.tuning = AbcjsVexFlowRenderer.TUNINGS[$(`#${key}`)[0].value];
    } else {
      renderOptions[key] = parseFloat($(`#${key}`)[0].value);
    }
  });

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
  renderer.resize(500, 2000);
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

init();
