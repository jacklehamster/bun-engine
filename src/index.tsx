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
            
            const float TEXTURE_SIZE = 4096.;
            const float SLOT_SIZE = 256.;
            const float SLOT_SIDE_COUNT = TEXTURE_SIZE / SLOT_SIZE;
            const float SLOT_TEX_SIZE = 1. / SLOT_SIDE_COUNT;

            //  IN
            //  shape
            layout (location=0) in vec4 position;
            layout (location=1) in mat4 transform;
            //  2, 3, 4
            //  animation
            layout (location=5) in vec2 tex;

            uniform mat4 cam;

            //  OUT
            out vec2 vTex;
            out float textureIndex;
            out float opacity;

            void main() {
                gl_Position = cam * transform * position;
                vTex = tex * SLOT_TEX_SIZE;
                textureIndex = 0.;
                opacity = 1.;
            }
        `,
        `
            #version 300 es

            precision highp float;

            //  CONST
            const int NUM_TEXTURES = 16;
            const float threshold = 0.00001;

            //  IN
            //  texture
            uniform sampler2D uTextures[NUM_TEXTURES];
            in float textureIndex;
            in vec2 vTex;
            in float opacity;
            
            //  OUT
            out vec4 fragColor;
            
            //  FUNCTIONS
            vec4 getTextureColor(float textureSlot, vec2 vTexturePoint);

            void main() {
                vec4 color = getTextureColor(textureIndex, vTex);
                if (color.a <= .01) {
                  discard;
                };
                fragColor = vec4(color.rgb, 1.);
            }

            vec4 getTextureColor(float textureSlot, vec2 vTexturePoint) {
                if (abs(0.0 - textureSlot) < threshold) {
                  return texture(uTextures[0], vTexturePoint);
                }
                if (abs(1.0 - textureSlot) < threshold) {
                  return texture(uTextures[1], vTexturePoint);
                }
                if (abs(2.0 - textureSlot) < threshold) {
                  return texture(uTextures[2], vTexturePoint);
                }
                if (abs(3.0 - textureSlot) < threshold) {
                  return texture(uTextures[3], vTexturePoint);
                }
                if (abs(4.0 - textureSlot) < threshold) {
                  return texture(uTextures[4], vTexturePoint);
                }
                if (abs(5.0 - textureSlot) < threshold) {
                  return texture(uTextures[5], vTexturePoint);
                }
                if (abs(6.0 - textureSlot) < threshold) {
                  return texture(uTextures[6], vTexturePoint);
                }
                if (abs(7.0 - textureSlot) < threshold) {
                  return texture(uTextures[7], vTexturePoint);
                }
                if (abs(8.0 - textureSlot) < threshold) {
                  return texture(uTextures[8], vTexturePoint);
                }
                if (abs(9.0 - textureSlot) < threshold) {
                  return texture(uTextures[9], vTexturePoint);
                }
                if (abs(10.0 - textureSlot) < threshold) {
                  return texture(uTextures[10], vTexturePoint);
                }
                if (abs(11.0 - textureSlot) < threshold) {
                  return texture(uTextures[11], vTexturePoint);
                }
                if (abs(12.0 - textureSlot) < threshold) {
                  return texture(uTextures[12], vTexturePoint);
                }
                if (abs(13.0 - textureSlot) < threshold) {
                  return texture(uTextures[13], vTexturePoint);
                }
                if (abs(14.0 - textureSlot) < threshold) {
                  return texture(uTextures[14], vTexturePoint);
                }
                if (abs(15.0 - textureSlot) < threshold) {
                  return texture(uTextures[15], vTexturePoint);
                }
                return texture(uTextures[0], vTexturePoint);
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
