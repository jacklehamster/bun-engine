import { World } from 'world/World';
import { Core } from 'core/Core';
import { DemoWorld } from 'demo/DemoWorld';

export async function hello() {
  console.log('Hello World!');
}

let onStop: () => void;

export async function testCanvas(canvas: HTMLCanvasElement) {
  canvas.style.border = '2px solid silver';
  //  canvas.style.cursor = 'grab';
  canvas.addEventListener('mouseenter', () => {
    canvas.style.borderColor = 'black';
  });
  canvas.addEventListener('mouseleave', () => {
    canvas.style.borderColor = 'silver';
  });
  const pixelListener = { x: 0, y: 0, pixel: 0 };
  canvas.addEventListener('mousemove', (e) => {
    const x = (e.pageX - canvas.offsetLeft) * 2;
    const y = (canvas.offsetHeight - (e.pageY - canvas.offsetTop)) * 2;
    pixelListener.x = x;
    pixelListener.y = y;
  });
  //  canvas.style.pointerEvents = 'none';

  const core = new Core({
    canvas,
  });
  core.engine.addPixelListener(pixelListener);
  const world = new DemoWorld(core);
  onStop = core.start(world);
  return { core, world };
}

export function stop(): void {
  onStop();
}

export { World };
