import { CAM_LOC, GL, PROJECTION_LOC } from "gl/attributes/Constants";
import Matrix from "gl/transform/Matrix";
import { GLUniforms } from "gl/uniforms/GLUniforms";

export class GLCamera {
  gl: GL;
  uniforms: GLUniforms;
  camPositionMatrix: Matrix = Matrix.create().translate(0, 0, -1);
  private readonly perspectiveMatrix = Matrix.create();
  private readonly orthoMatrix = Matrix.create();
  private projectionMatrix = Matrix.create();
  private perspectiveLevel: number = 1;
  private needsRefresh = false;

  constructor(gl: GL, uniforms: GLUniforms) {
    this.gl = gl;
    this.uniforms = uniforms;
  }


  configPerspectiveMatrix(ratio: number) {
    this.perspectiveMatrix.perspective(45, ratio, 0.01, 1000);
    this.updatePerspective();
  }

  configOrthoMatrix(ratio: number) {
    this.orthoMatrix.ortho(-ratio, ratio, -1, 1, -1000, 1000);
    this.updatePerspective();
  }

  readonly camTiltMatrix = Matrix.create();
  readonly camTurnMatrix = Matrix.create();
  private readonly camMatrix = Matrix.create();

  refresh() {
    if (!this.needsRefresh) {
      return;
    }
    //  camMatrix =  camTiltMatrix * camTurnMatrix * camPositionMatrix;
    this.camMatrix.multiply3(this.camTiltMatrix, this.camTurnMatrix, this.camPositionMatrix);

    const loc = this.uniforms.getUniformLocation(CAM_LOC);
    this.gl.uniformMatrix4fv(loc, false, this.camMatrix.getMatrix());
  }

  updatePerspective(level?: number) {
    if (level !== undefined) {
      this.perspectiveLevel = level;
    }
    this.projectionMatrix.combine(this.orthoMatrix, this.perspectiveMatrix, this.perspectiveLevel);
    const loc = this.uniforms.getUniformLocation(PROJECTION_LOC);
    this.gl.uniformMatrix4fv(loc, false, this.projectionMatrix.getMatrix());
    this.needsRefresh = true;
  }

  moveCam(x: number, y: number, z: number) {
    this.camPositionMatrix.moveMatrix(x, y, z, this.camTurnMatrix);
    this.needsRefresh = true;
  }

  turnCam(angle: number) {
    this.camTurnMatrix.rotateY(angle);
    this.needsRefresh = true;
  }

  tilt(angle: number) {
    this.camTiltMatrix.rotateX(angle);
    this.needsRefresh = true;
  }
}
