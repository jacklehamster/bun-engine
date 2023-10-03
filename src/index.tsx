import { GLEngine } from "./GLEngine";

export function hello() {
    console.log("Hello World!");
}

export function testCanvas(canvas: HTMLCanvasElement) {
    const engine = new GLEngine(canvas);
    engine.programs.addProgram("test",
        `
            #version 300 es

            precision highp float;
            
            layout (location=0) in vec4 position;
            layout (location=1) in mat4 transform;

            void main() {
                gl_Position = transform * position;
                // gl_Position = position;
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
    return engine;
}
