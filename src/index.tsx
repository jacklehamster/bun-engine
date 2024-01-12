import { GraphicsEngine } from 'graphics/GraphicsEngine';
import { Motor } from 'motor/Motor';
import { DemoWorld } from 'demo/DemoWorld';
import { AuxiliaryHolder } from 'world/aux/AuxiliaryHolder';

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
  const pixelListener = {
    x: 0,
    y: 0,
    pixel: 0,
    setPixel(value: number) {
      this.pixel = value;
    },
  };
  canvas.addEventListener('mousemove', (e) => {
    const x = (e.pageX - canvas.offsetLeft) * 2;
    const y = (canvas.offsetHeight - (e.pageY - canvas.offsetTop)) * 2;
    pixelListener.x = x;
    pixelListener.y = y;
  });
  //  canvas.style.pointerEvents = 'none';

  const engine = new GraphicsEngine(canvas);
  engine.setPixelListener(pixelListener);
  const motor = new Motor();
  const core = new AuxiliaryHolder();
  const world = new DemoWorld({ engine, motor });
  core.addAuxiliary(motor);
  core.addAuxiliary(engine);
  core.addAuxiliary(world);
  core.activate();
  onStop = () => core.deactivate();
  return { engine, motor, world };
}

export function stop(): void {
  onStop();
}

export {};
