import { DemoWorld } from 'world/DemoWorld';
import { GLEngine } from './GLEngine';

export async function hello() {
  console.log('Hello World!');
}

export async function testCanvas(canvas: HTMLCanvasElement) {
  canvas.style.border = '2px solid silver';
  canvas.style.cursor = 'grab';
  canvas.addEventListener('mouseenter', () => {
    canvas.style.borderColor = 'black';
  });
  canvas.addEventListener('mouseleave', () => {
    canvas.style.borderColor = 'silver';
  });
  //  canvas.style.pointerEvents = 'none';
  const engine = new GLEngine(canvas);
  engine.start();
  engine.setWorld(new DemoWorld());
  return engine;
}

export { DemoWorld };
