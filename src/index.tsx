import { GLEngine } from './GLEngine';

export async function hello() {
  console.log('Hello World!');
}

export function testCanvas(canvas: HTMLCanvasElement) {
  canvas.style.border = '.5px solid silver';
  canvas.style.pointerEvents = 'none';
  const engine = new GLEngine(canvas);

  engine.initialize();

  const keys: Record<string, boolean> = {};
  document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    // console.log(keys);
  });

  document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  function loop() {
    engine.gl.enable(engine.gl.DEPTH_TEST);

    // Set the depth function to less than or equal
    engine.gl.depthFunc(engine.gl.LEQUAL);

    // Clear the color and depth buffer
    engine.gl.clearDepth(1.0);
    engine.gl.clear(engine.gl.COLOR_BUFFER_BIT | engine.gl.DEPTH_BUFFER_BIT);

    const speed = 0.5 / 2;
    const turnspeed = 0.1 / 2;
    if (keys.KeyW || keys.ArrowUp) {
      engine.moveCam(0, speed);
    }
    if (keys.KeyS || keys.ArrowDown) {
      engine.moveCam(0, -speed);
    }
    if (keys.KeyA) {
      engine.moveCam(-speed, 0);
    }
    if (keys.KeyD) {
      engine.moveCam(speed, 0);
    }
    if (keys.KeyQ || keys.ArrowLeft) {
      engine.turnCam(-turnspeed);
    }
    if (keys.KeyE || keys.ArrowRight) {
      engine.turnCam(turnspeed);
    }
    const vertexCount = 6;
    const instanceCount = 3;
    engine.drawElementsInstanced(vertexCount, instanceCount);
    requestAnimationFrame(loop);
  }
  loop();

  return engine;
}
