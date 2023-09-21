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
            
            void main() {
                gl_Position = position;
            }
        `,
        `
            #version 300 es

            precision highp float;
            out vec4 fragColor;
            
            void main() {
                fragColor = vec4(1.0, 0.0, 0.0, 1.0);
            }        
        `);
    engine.programs.useProgram("test");
    engine.initialize();
    engine.updateTrianglePosition(0, [
        0.0, 0.5, 0.0,
        -0.5, -0.5, 0.0,
        0.5, -0.5, 0.0,
    ]);
    engine.draw(3);
    return engine;
}
