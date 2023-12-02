import { World } from 'world/World';
import { Core } from 'core/Core';

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

  const core = new Core({
    canvas,
  });
  const world = new World(core);
  core.start(world);
  return core;
}

export { World };
