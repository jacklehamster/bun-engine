import { GraphicsEngine } from 'graphics/GraphicsEngine';
import { Motor } from 'motor/Motor';
import { DemoWorld } from 'demo/DemoWorld';
import { AuxiliaryHolder } from 'world/aux/AuxiliaryHolder';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ResizeAux } from 'graphics/aux/ResizeAux';
import { WebGlCanvas } from 'graphics/WebGlCanvas';

export async function hello() {
  console.info(`Welcome!
You are using dok-engine.
https://github.com/jacklehamster/bun-engine`);
}

let onStop: () => void;

export async function testCanvas(canvas: HTMLCanvasElement) {
  const webGlCanvas = new WebGlCanvas(canvas);
  const root = ReactDOM.createRoot(
    document.body.appendChild(document.createElement('div')),
  );
  const element = <h1>Hello, world!</h1>;
  root.render(element);

  canvas.style.border = '2px solid black';
  canvas.style.pointerEvents = 'none';
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
  const motor = new Motor();
  const core = new AuxiliaryHolder();
  const world = new DemoWorld({ engine, motor });
  core.addAuxiliary(motor);
  core.addAuxiliary(engine);
  core.addAuxiliary(world);
  core.addAuxiliary(webGlCanvas);
  webGlCanvas.addAuxiliary(new ResizeAux({ engine, camera: world.camera }));
  core.activate();
  onStop = () => core.deactivate();
  return { engine, motor, world };
}

export function stop(): void {
  onStop();
}

export {};
