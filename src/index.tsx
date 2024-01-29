import { GraphicsEngine } from 'graphics/GraphicsEngine';
import { Motor } from 'motor-loop';
import { DemoWorld } from 'demo/DemoWorld';
import { AuxiliaryHolder } from 'world/aux/AuxiliaryHolder';
import { ResizeAux } from 'graphics/aux/ResizeAux';
import { WebGlCanvas } from 'graphics/WebGlCanvas';
import { UserInterface } from 'ui/UserInterface';
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
  const motor = new Motor();
  const keyboard = new Keyboard({ motor });
  const gameControls = new KeyboardControls(keyboard);
  const menuControls = new KeyboardControls(keyboard);

  const ui: UserInterface = new Hud({ controls: menuControls });
  const webGlCanvas = new WebGlCanvas(canvas).addAuxiliary(ui);
  ui.addDialogListener({
    onPopup(count) {
      gameControls.setActive(count === 0);
      menuControls.setActive(count !== 0);
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
  const world = new DemoWorld({
    engine,
    motor,
    ui,
    keyboard,
    controls: gameControls,
  });
  core.addAuxiliary(motor);
  core.addAuxiliary(world);
  core.addAuxiliary(webGlCanvas);
  core.addAuxiliary(gameControls);
  webGlCanvas.addAuxiliary(new ResizeAux({ engine, camera: world.camera }));

  core.activate();
  motor.loop(engine, undefined);
  onStop = () => core.deactivate();
  return { engine, motor, world, ui };
}

export function stop(): void {
  onStop();
}

export {};
