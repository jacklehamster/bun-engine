import { GLEngine } from "./GLEngine";

export function hello() {
    console.log("Hello World!");
}

export function testCanvas(canvas: HTMLCanvasElement) {
    canvas.style.border = ".5px solid silver";
    const engine = new GLEngine(canvas);
    (window as any).engine = engine;

    engine.programs.addProgram("test",
        `
            #version 300 es

            precision highp float;
            
            layout (location=0) in vec4 position;
            layout (location=1) in mat4 transform;

            uniform mat4 cam;

            void main() {
                gl_Position = cam * transform * position;
            }
        `,
        `
            #version 300 es

            precision highp float;
            out vec4 fragColor;
            
            void main() {
                fragColor = vec4(1.0, 0.0, 0.0, 0.5);
            }
        `);
    engine.programs.useProgram("test");
    engine.initialize();
    // engine.updateTrianglePosition(0, [
    //     1, 1, 0,
    //     1, -1, 0,
    //     -1, -1, 0,
    //     -1, 1, 0,
    //   ]);
//    engine.drawArrays(3);
    engine.drawElementsInstanced(6, 2);

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
        engine.drawElementsInstanced(6, 3);
        requestAnimationFrame(loop);
    }
    loop();

    return engine;
}
