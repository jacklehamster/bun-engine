import { CAM_LOC, GL, PROJECTION_LOC } from "gl/attributes/Constants";
import Matrix from "gl/transform/Matrix";
import { ProjectionMatrix } from "gl/transform/ProjectionMatrix";
import { GLUniforms } from "gl/uniforms/GLUniforms";

export class GLCamera {
  gl: GL;
  uniforms: GLUniforms;
  camPositionMatrix: Matrix = Matrix.create().translate(0, 0, -1);
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
    this.camMatrix.multiply3(this.camTiltMatrix, this.camTurnMatrix, this.camPositionMatrix);
    const loc = this.uniforms.getUniformLocation(CAM_LOC);
    this.gl.uniformMatrix4fv(loc, false, this.camMatrix.getMatrix());
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

  private static invertedCamTurnMatrix: Matrix = Matrix.create();
  private static invertedCamTiltMatrix: Matrix = Matrix.create();
  static syncHud(cam: GLCamera, matrix?: Matrix) {
    matrix?.identity()
      .translateToMatrix(cam.camPositionMatrix)
      .multiply(GLCamera.invertedCamTurnMatrix.invert(cam.camTurnMatrix))
      .multiply(GLCamera.invertedCamTiltMatrix.invert(cam.camTiltMatrix))
      .translate(0, 0, -.9);
  }
}
