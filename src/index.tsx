import { GLEngine, TEXTURE_SLOT_SIZE } from "./GLEngine";
import vertexShader from "./gl/resources/vertexShader.txt"
import fragmentShader from "./gl/resources/fragmentShader.txt"
import { replaceTilda } from "./gl/utils/replaceTilda";

export async function hello() {
    console.log("Hello World!");
}

export function testCanvas(canvas: HTMLCanvasElement) {
    canvas.style.border = ".5px solid silver";
    const engine = new GLEngine(canvas);

    const replacementMap = {
      TEXTURE_SLOT_SIZE: TEXTURE_SLOT_SIZE.toFixed(1),
    };

    engine.programs.addProgram("test",
        replaceTilda(vertexShader, replacementMap),
        replaceTilda(fragmentShader, replacementMap)
    );
    engine.programs.useProgram("test");
    engine.initialize();
    // engine.updateTrianglePosition(0, [
    //     1, 1, 0,
    //     1, -1, 0,
    //     -1, -1, 0,
    //     -1, 1, 0,
    //   ]);
//    engine.drawArrays(3);
    // engine.drawElementsInstanced(6, 2);

    const keys: Record<string, boolean> = {};
    document.addEventListener("keydown", e => {
        keys[e.code] = true;
        // console.log(keys);
    });

    document.addEventListener("keyup", e => {
        keys[e.code] = false;
    });

    function loop() {
        const speed = .5 / 2;
        const turnspeed = 0.1 / 2;
        if (keys.KeyW) {
            engine.moveCam(0, speed);
        }
        if (keys.KeyS) {
            engine.moveCam(0, -speed);
        }
        if (keys.KeyA) {
            engine.moveCam(-speed, 0);
        }
        if (keys.KeyD) {
            engine.moveCam(speed, 0);
        }
        if (keys.KeyQ) {
            engine.turnCam(-turnspeed);
        }
        if (keys.KeyE) {
            engine.turnCam(turnspeed);
        }
        const vertexCount = 6;
        const instanceCount = 1;
        engine.drawElementsInstanced(vertexCount, instanceCount);
        requestAnimationFrame(loop);
    }
    loop();

    return engine;
}
