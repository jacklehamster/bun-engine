import { GLEngine } from "./GLEngine";
import vertexShader from "./generated/src/gl/resources/vertexShader.txt"
import fragmentShader from "./generated/src/gl/resources/fragmentShader.txt"
import { replaceTilda } from "./gl/utils/replaceTilda";

export async function hello() {
    console.log("Hello World!");
}

export function testCanvas(canvas: HTMLCanvasElement) {
    canvas.style.border = ".5px solid silver";
    const engine = new GLEngine(canvas);

    const replacementMap = {
        AUTHOR: "Jack le hamster",
    };

    engine.programs.addProgram("test",
        replaceTilda(vertexShader, replacementMap),
        replaceTilda(fragmentShader, replacementMap)
    );
    engine.programs.useProgram("test");
    engine.initialize();

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
        const instanceCount = 1;
        engine.drawElementsInstanced(vertexCount, instanceCount);
        requestAnimationFrame(loop);
    }
    loop();

    return engine;
}
