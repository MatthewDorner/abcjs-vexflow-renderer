# abcjs-vexflow-renderer
### VexFlow renderer for abcjs. Usage:

```
import ABCJS from 'abcjs';
import { Tune, Vex } from 'abcjs-vexflow-renderer';
import abcText from './abc_tune.txt';

const whereToRender = document.getElementById('musicDiv');

// get the parsed repesentation from abcjs
const parsedObject = ABCJS.parseOnly(abcText);

// generate a VexFlow renderer & context
const renderer = new Vex.Flow.Renderer(whereToRender, Vex.Flow.Renderer.Backends.SVG);
renderer.resize(500, 500);
const context = renderer.getContext();

// set up rendering options
const renderOptions = {
	xOffset: 3,
	widthFactor: 27, // note density
	lineHeight: 180,
	clefWidth: 40,
	meterWidth: 40,
	repeatWidthModifier: 35,
	dottedNotesModifier: 23,
	keySigAccidentalWidth: 20,
	minWidthMultiplier: 2,
	renderWidth: 800 // higher value to make music smaller
};

// process the parsed object
const tune = new Tune(parsedObject, renderOptions);

// draw to the vexflow context
tune.drawToContext(context);
```

#### Testing
the npm build & start scripts will launch an HTML visual comparison tool that shows ABC tunes rendered via abcjs' built-in renderer in comparison to this library. Tunes are pulled from the src/tunes.txt file.