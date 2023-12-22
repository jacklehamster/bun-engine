import { World } from 'world/World';
import { Core } from 'core/Core';
import { DemoWorld } from 'demo/DemoWorld';

export async function hello() {
  console.log('Hello World!');
}

let onStop: () => void;

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

  const core = new Core({
    canvas,
  });
  const world = new DemoWorld(core);
  onStop = core.start(world);
  return core;
}

export function stop(): void {
  onStop();
}

export { World };
