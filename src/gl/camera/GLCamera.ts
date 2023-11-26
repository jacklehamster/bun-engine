import { CAM_LOC, GL, PROJECTION_LOC } from "gl/attributes/Constants";
import Matrix from "gl/transform/Matrix";
import { ProjectionMatrix } from "gl/transform/ProjectionMatrix";
import { GLUniforms } from "gl/uniforms/GLUniforms";

export class GLCamera {
  private gl: GL;
  private uniforms: GLUniforms;
  private camPositionMatrix: Matrix = Matrix.create().translate(0, 0, -1);
  private projectionMatrix = new ProjectionMatrix();
  private needsRefresh = false;

  constructor(gl: GL, uniforms: GLUniforms) {
    this.gl = gl;
    this.uniforms = uniforms;
  }

  configProjectionMatrix(ratio: number) {
    this.projectionMatrix.configure(ratio);
    this.updatePerspective(1);
  }

  readonly camTiltMatrix = Matrix.create();
  readonly camTurnMatrix = Matrix.create();
  private readonly camMatrix = Matrix.create();

  refresh() {
    if (!this.needsRefresh) {
      return false;
    }
    //  camMatrix =  camTiltMatrix * camTurnMatrix * camPositionMatrix;
    this.invertedCamTiltMatrix.invert(this.camTiltMatrix);
    this.invertedCamTurnMatrix.invert(this.camTurnMatrix);
    this.camMatrix.multiply3(this.camTiltMatrix, this.camTurnMatrix, this.camPositionMatrix);
    const loc = this.uniforms.getUniformLocation(CAM_LOC);
    this.gl.uniformMatrix4fv(loc, false, this.camMatrix.getMatrix());
    this.needsRefresh = false;
    return true;
  }

  updatePerspective(level: number) {
    this.projectionMatrix.setPerspective(level);
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

  private invertedCamTurnMatrix: Matrix = Matrix.create();
  private invertedCamTiltMatrix: Matrix = Matrix.create();
  syncHud(matrix?: Matrix) {
    matrix?.identity()
      .translateToMatrix(this.camPositionMatrix)
      .multiply(this.invertedCamTurnMatrix)
      .multiply(this.invertedCamTiltMatrix)
      .translate(0, 0, -.9);
  }
}
