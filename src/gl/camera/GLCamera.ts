import { mat4 } from "gl-matrix";
import { CAM_LOC, GL, PROJECTION_LOC } from "gl/attributes/Contants";
import Matrix from "gl/transform/Matrix";
import { GLUniforms } from "gl/uniforms/GLUniforms";

export class GLCamera {
  gl: GL;
  uniforms: GLUniforms;
  cameraMatrix: mat4 = Matrix.create().translate(0, 0, -1).getMatrix();
  perspectiveMatrix: mat4 = Matrix.create().getMatrix();
  orthoMatrix: mat4 = Matrix.create().getMatrix();
  projectionMatrix: mat4 = Matrix.create().getMatrix();
  private perspectiveLevel: number = 1;

  constructor(gl: GL, uniforms: GLUniforms) {
    this.gl = gl;
    this.uniforms = uniforms;
  }


  configPerspectiveMatrix(ratio: number) {
    this.perspectiveMatrix = Matrix.create().perspective(45, ratio, 0.1, 1000).getMatrix();
    this.updatePerspective();
  }

  configOrthoMatrix(ratio: number) {
    this.orthoMatrix = Matrix.create().ortho(-ratio, ratio, -1, 1, -1000, 1000).getMatrix();
    this.updatePerspective();
  }

  camTiltMatrix = Matrix.create().getMatrix();
  camTurnMatrix = Matrix.create().getMatrix();
  private camMatrix: mat4 = mat4.create();

  refresh() {
    //  camMatrix =  camTiltMatrix * camTurnMatrix * cameraMatrix;
    mat4.mul(this.camMatrix, this.camTiltMatrix, this.camTurnMatrix);
    mat4.mul(this.camMatrix, this.camMatrix, this.cameraMatrix);

    const loc = this.uniforms.getUniformLocation(CAM_LOC);
    if (loc) {
      this.gl.uniformMatrix4fv(loc, false, this.camMatrix);
    }
  }


  orthoTemp = mat4.create();
  perspectiveTemp = mat4.create();
  updatePerspective(level?: number) {
    if (level !== undefined) {
      this.perspectiveLevel = level;
    }
    Matrix.combineMat4(this.projectionMatrix, this.orthoMatrix, this.perspectiveMatrix, this.perspectiveLevel);
    const loc = this.uniforms.getUniformLocation(PROJECTION_LOC);
    if (loc) {
      this.gl.uniformMatrix4fv(loc, false, this.projectionMatrix);
    }

    this.refresh();
  }

  moveCam(x: number, y: number, z: number) {
    Matrix.moveMatrix(this.cameraMatrix, x, y, z, this.camTurnMatrix);
    this.refresh();
  }

  turnCam(angle: number) {
    mat4.rotateY(this.camTurnMatrix, this.camTurnMatrix, angle);
    this.refresh();
  }

  tilt(angle: number) {
    mat4.rotateX(this.camTiltMatrix, this.camTiltMatrix, angle);
    this.refresh();
  }
}
