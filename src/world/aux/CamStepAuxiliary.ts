import { UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { Position } from "world/grid/Position";
import { angleStep } from "gl/utils/angleUtils";
import { ICamera } from "camera/ICamera";
import { IControls } from "controls/IControls";

interface Props {
  controls: IControls;
  camera: ICamera;
}

interface Config {
  step: number;
  turnStep: number;
  tiltStep: number;
  speed: number;
}

export class CamStepAuxiliary implements Auxiliary {
  private readonly controls: IControls;
  private readonly camera: ICamera;
  private readonly goalPos: Position;
  private stepCount: number = 0;
  private turnCount: number = 0;
  private tiltCount: number = 0;
  private config: Config;

  constructor({ controls, camera }: Props, config: Partial<Config> = {}) {
    this.controls = controls;
    this.camera = camera;
    this.goalPos = [...this.camera.posMatrix.position];
    this.config = {
      step: config.step ?? 2,
      turnStep: config.turnStep ?? Math.PI / 2,
      tiltStep: config.tiltStep ?? Math.PI / 2,
      speed: config.speed ?? 1,
    };
  }

  private readonly prePos: Position = [0, 0, 0];
  refresh(update: UpdatePayload): void {
    const { backward, forward, left, right, up, down, turnLeft, turnRight } = this.controls;
    const { deltaTime } = update;

    const pos = this.camera.posMatrix.position;
    const { step, turnStep, tiltStep } = this.config;
    this.prePos[0] = Math.round(pos[0] / step) * step;
    this.prePos[1] = Math.round(pos[1] / step) * step;
    this.prePos[2] = Math.round(pos[2] / step) * step;

    let dx = 0, dz = 0;
    if (forward) {
      dz--;
    }
    if (backward) {
      dz++;
    }
    if (left) {
      dx--;
    }
    if (right) {
      dx++;
    }
    const turnGoal = this.camera.turnMatrix.progressive.goal;
    if (dx || dz || this.stepCount > 0) {
      const relativeDx = dx * Math.cos(turnGoal) - dz * Math.sin(turnGoal);
      const relativeDz = dx * Math.sin(turnGoal) + dz * Math.cos(turnGoal);

      const gx = Math.round(pos[0] / step + relativeDx) * step;
      const gz = Math.round(pos[2] / step + relativeDz) * step;
      this.goalPos[0] = gx;
      this.goalPos[2] = gz;
    }

    if (!dx && !dz) {
      this.stepCount = 0;
    }
    const speed = ((dx || dz) ? deltaTime / 150 : deltaTime / 100) * this.config.speed;

    const didMove = this.camera.posMatrix.gotoPos(this.goalPos[0], pos[1], this.goalPos[2], speed);
    if (!didMove) {
      const gx = Math.round(pos[0] / step) * step;
      const gz = Math.round(pos[2] / step) * step;
      this.goalPos[0] = gx;
      this.goalPos[2] = gz;
    }
    const newPos = this.camera.posMatrix.position;
    if (Math.round(newPos[0] / step) * step !== this.prePos[0]
      || Math.round(newPos[1] / step) * step !== this.prePos[1]
      || Math.round(newPos[2] / step) * step !== this.prePos[2]) {
      this.stepCount++;
    }

    let dTurn = 0;
    if (turnLeft) {
      dTurn--;
    }
    if (turnRight) {
      dTurn++;
    }

    const turn = angleStep(this.camera.turnMatrix.turn, turnStep);
    if (dTurn || this.turnCount > 0) {
      this.camera.turnMatrix.progressive.setGoal(
        angleStep(turn + turnStep * dTurn, turnStep),
        dTurn ? 1 / 200 : 1 / 100, this);
    }
    if (!dTurn) {
      this.turnCount = 0;
    }
    if (this.camera.turnMatrix.progressive.update(deltaTime)) {
      const newTurn = angleStep(this.camera.turnMatrix.turn, turnStep);
      if (newTurn !== turn) {
        this.turnCount++;
      }
    }

    let dTilt = 0;
    if (up) {
      dTilt--;
    }
    if (down) {
      dTilt++;
    }

    const tilt = angleStep(this.camera.tiltMatrix.tilt, tiltStep);
    if (dTilt || this.tiltCount > 0) {
      this.camera.tiltMatrix.progressive.setGoal(
        angleStep(tilt + tiltStep * dTilt, tiltStep),
        dTilt ? 1 / 400 : 1 / 200,
        this,
      );
    }
    if (!dTilt) {
      this.tiltCount = 0;
    }
    if (this.camera.tiltMatrix.progressive.update(deltaTime)) {
      const newTilt = angleStep(this.camera.tiltMatrix.tilt, tiltStep);
      if (newTilt !== tilt) {
        this.tiltCount++;
      }
    }
  }
}
