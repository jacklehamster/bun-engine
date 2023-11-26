import { DemoWorld } from 'world/DemoWorld';
import { GLEngine } from './GLEngine';

export async function hello() {
  console.log('Hello World!');
}

export function testCanvas(canvas: HTMLCanvasElement) {
  canvas.style.border = '2px solid silver';
  canvas.style.cursor = 'grab';
  canvas.addEventListener('mouseenter', () => {
    canvas.style.borderColor = 'black';
  });
  canvas.addEventListener('mouseleave', () => {
    canvas.style.borderColor = 'silver';
  });
  //  canvas.style.pointerEvents = 'none';
  const engine = new GLEngine(canvas, {
    world: new DemoWorld(),
  });

  engine.initialize();
  engine.start();
  return engine;
}
