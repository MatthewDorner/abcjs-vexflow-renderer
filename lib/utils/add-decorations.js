import { Articulation } from 'vexflow/src/articulation';
import { Ornament } from 'vexflow/src/ornament';
import Vex from 'vexflow';

export function addDecorations(noteToAdd, decorations) {
  if (decorations && decorations.length > 0) {
    decorations.forEach((decoration) => {
      switch (decoration) {
        case 'staccato':
          noteToAdd.addArticulation(0, new Articulation('a.').setPosition(3));
          break;
        case 'irishroll':
          noteToAdd.addModifier(0, new Vex.Flow.Annotation('~')
            .setVerticalJustification(Vex.Flow.Annotation.VerticalJustify.TOP)
            .setFont('serif', 20, undefined));
          break;
        case 'fermata':
          noteToAdd.addArticulation(0, new Articulation('a@a').setPosition(3));
          break;
        case 'accent':
          noteToAdd.addArticulation(0, new Articulation('a>').setPosition(3));
          break;
        case 'upbow':
          noteToAdd.addArticulation(0, new Articulation('a|').setPosition(3));
          break;
        case 'downbow':
          noteToAdd.addArticulation(0, new Articulation('am').setPosition(3));
          break;
        case 'trill':
          noteToAdd.addModifier(0, new Ornament('tr'));
          break;
        case 'mordent':
          noteToAdd.addModifier(0, new Ornament('mordent_inverted'));
          break;
        case 'pralltriller':
          noteToAdd.addModifier(0, new Ornament('mordent'));
          break;
        case 'coda':
        case 'segno':
        default:
          break;
      }
    });
  }
}
