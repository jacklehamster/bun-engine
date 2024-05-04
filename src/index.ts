import { GraphicsEngine } from 'graphics/GraphicsEngine';
import { Motor } from 'motor-loop';
import { DemoGame } from 'demo/DemoGame';
import { ResizeAux } from 'graphics/aux/ResizeAux';
import { WebGlCanvas } from 'graphics/WebGlCanvas';
import { Auxiliaries } from 'world/aux/Auxiliaries';

export async function hello() {
  console.info(`Welcome!
You are using Dok engine.
https://github.com/jacklehamster/bun-engine`);
}

let onStop: () => void;

export async function testCanvas(canvas: HTMLCanvasElement) {
  const motor = new Motor({}, { frameRate: 120 });

  const webGlCanvas = new WebGlCanvas(canvas);
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

  const engine = new GraphicsEngine(webGlCanvas.gl);
  // engine.setPixelListener(pixelListener);
  const core = new Auxiliaries();
  const world = new DemoGame({
    engine,
    motor,
  });
  core.addAuxiliary(motor);
  core.addAuxiliary(engine);
  core.addAuxiliary(
    new ResizeAux({
      engine,
      camera: world.camera,
      canvas: webGlCanvas.canvas,
    }),
  );

  core.addAuxiliary(world);

  core.activate();
  motor.loop(engine, undefined);
  onStop = () => core.deactivate();
  return { engine, motor, world, core };
}

export function stop(): void {
  onStop();
}
