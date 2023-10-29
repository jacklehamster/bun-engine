import { Disposable } from "../../disposable/Disposable";

export class GLProgram extends Disposable {
    gl: WebGL2RenderingContext;
    program: WebGLProgram;
    constructor(gl: WebGL2RenderingContext, vertex: string, fragment: string) {
        super();
        this.gl = gl;
        this.program = createProgram(gl, vertex.trim(), fragment.trim());
    }

    use() {
        this.gl.useProgram(this.program);
    }

    destroy(): void {
        super.destroy();
        deleteProgram(this.gl, this.program);
    }
}

function createProgram(gl: WebGL2RenderingContext, vertex: string, fragment: string): WebGLProgram {
    function createShader(shaderSource: string, type: GLenum) {
        function typeName(type: number) {
            return type === gl?.VERTEX_SHADER ? "vertex" :
                type === gl?.FRAGMENT_SHADER ? "fragment" :
                undefined;
        }
        
        if (type !== gl.VERTEX_SHADER && type !== gl.FRAGMENT_SHADER) {
            throw new Error(`Shader error in ${typeName(type)}`);
        }
        const shader = gl.createShader(type);
        if (!shader) {
            throw new Error(`Unable to generate ${typeName(type)} shader.`);
        }
        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);
    
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            // Something went wrong during compilation; get the error
            console.error(`Shader compile error in ${typeName(type)}:` + gl.getShaderInfoLog(shader));
        }
        return shader;      
    }
    
    const program = gl.createProgram();
    if (!program) {
        throw new Error(`Unable to create program.`);
    }

    const vertexShader = createShader(vertex, gl.VERTEX_SHADER)!;
    const fragmentShader = createShader(fragment, gl.FRAGMENT_SHADER)!;
    const vertexInfo = gl.getShaderInfoLog(vertexShader), fragmentInfo = gl.getShaderInfoLog(fragmentShader);
    if (vertexInfo) {
        console.log("VERTEX", vertexInfo);
    }
    if (fragmentInfo) {
        console.log("FRAGMENT", fragmentInfo);
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const programInfo = gl.getProgramInfoLog(program);
    if (programInfo) {
        console.log("PROGRAM", programInfo);
    }
    gl.detachShader(program, vertexShader);
    gl.detachShader(program, fragmentShader);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    gl.validateProgram(program);

    Object.entries(WebGL2RenderingContext).forEach(([k, value]) => {
        if (value && gl.getError() === value) {
            console.log(`gl.${k}`);
        }
    });

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error("Unable to initialize the shader program:\n" + gl.getProgramInfoLog(program));
    }

    return program;
}

function deleteProgram(gl: WebGL2RenderingContext, program: WebGLProgram) {
    gl.deleteProgram(program);
}
