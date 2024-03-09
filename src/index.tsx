import { GraphicsEngine } from 'graphics/GraphicsEngine';
import { Motor } from 'motor-loop';
import { DemoGame } from 'demo/DemoGame';
import { AuxiliaryHolder } from 'world/aux/AuxiliaryHolder';
import { ResizeAux } from 'graphics/aux/ResizeAux';
import { WebGlCanvas } from 'graphics/WebGlCanvas';
import { Hud } from 'ui/Hud';
import { Keyboard } from 'controls/Keyboard';
import { KeyboardControls } from 'controls/KeyboardControls';

export async function hello() {
  console.info(`Welcome!
You are using Dok engine.
https://github.com/jacklehamster/bun-engine`);
}

let onStop: () => void;

export async function testCanvas(canvas: HTMLCanvasElement) {
  const motor = new Motor({}, { frameRate: 120 });
  const keyboard = new Keyboard({ motor });
  const gameControls = new KeyboardControls(keyboard);
  const menuControls = new KeyboardControls(keyboard);

  const webGlCanvas = new WebGlCanvas(canvas);
  const hud: Hud = new Hud({ controls: menuControls, dom: webGlCanvas });
  hud.ui.addDialogListener({
    onPopup(count) {
      gameControls.enabled = count === 0;
      menuControls.enabled = count !== 0;
    },
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

  const engine = new GraphicsEngine(webGlCanvas.gl);
  // engine.setPixelListener(pixelListener);
  const core = new AuxiliaryHolder();
  const world = new DemoGame({
    engine,
    motor,
    ui: hud.ui,
    keyboard,
    controls: gameControls,
  });
  core.addAuxiliary(motor);
  core.addAuxiliary(world);
  core.addAuxiliary(webGlCanvas);
  core.addAuxiliary(hud);
  core.addAuxiliary(gameControls);
  core.addAuxiliary(
    new ResizeAux({
      engine,
      camera: world.camera,
      canvas: webGlCanvas.elem,
    }),
  );
  core.addAuxiliary(engine);

  core.activate();
  motor.loop(engine, undefined);
  onStop = () => core.deactivate();
  return { engine, motor, world, hud, core };
}

export function stop(): void {
  onStop();
}
