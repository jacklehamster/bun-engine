import { GLEngine } from './GLEngine';

export async function hello() {
  console.log('Hello World!');
}

export function testCanvas(canvas: HTMLCanvasElement) {
  canvas.style.border = '2px solid silver';
  canvas.style.cursor = 'grab';
  canvas.addEventListener('mouseenter', () => {
    canvas.style.borderColor = 'black';
  });
  canvas.addEventListener('mouseleave', () => {
    canvas.style.borderColor = 'silver';
  });
  //  canvas.style.pointerEvents = 'none';
  const engine = new GLEngine(canvas);

  engine.initialize();

  const keys: Record<string, boolean> = {};
  document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
  });

  document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  function loop() {
    engine.gl.enable(engine.gl.DEPTH_TEST);
    const speed = 0.5 / 2;
    const turnspeed = 0.1 / 2;
    if (keys.KeyW) {
      engine.camera.moveCam(0, 0, speed);
    }
    if (keys.KeyS) {
      engine.camera.moveCam(0, 0, -speed);
    }
    if (keys.ArrowUp && !keys.ShiftRight) {
      engine.camera.moveCam(0, -speed, 0);
    }
    if (keys.ArrowDown && !keys.ShiftRight) {
      engine.camera.moveCam(0, speed, 0);
    }
    if (keys.KeyA || (keys.ArrowLeft && !keys.ShiftRight)) {
      engine.camera.moveCam(-speed, 0, 0);
    }
    if (keys.KeyD || (keys.ArrowRight && !keys.ShiftRight)) {
      engine.camera.moveCam(speed, 0, 0);
    }
    if (keys.KeyQ || (keys.ArrowLeft && keys.ShiftRight)) {
      engine.camera.turnCam(-turnspeed);
    }
    if (keys.KeyE || (keys.ArrowRight && keys.ShiftRight)) {
      engine.camera.turnCam(turnspeed);
    }
    if (keys.ArrowUp && keys.ShiftRight) {
      engine.camera.tilt(-turnspeed);
    }
    if (keys.ArrowDown && keys.ShiftRight) {
      engine.camera.tilt(turnspeed);
    }
    engine.refresh();
    requestAnimationFrame(loop);
  }
  console.log(performance.now(), '<<');
  engine.refresh();
  console.log(performance.now(), '<<<');

  loop();

  return engine;
}
