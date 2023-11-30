import { DemoWorld } from 'world/DemoWorld';
import { GraphicsEngine as GraphicsEngine } from './core/GraphicsEngine';
import { Motor } from 'core/Motor';

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
  const motor = new Motor();
  const engine = new GraphicsEngine(canvas);
  motor.addUpdate(engine);
  engine.setWorld(new DemoWorld());

  motor.start();
  return engine;
}

export { DemoWorld };
