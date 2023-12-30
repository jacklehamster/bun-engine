import { UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { CellPos } from "world/grid/CellPos";
import { angle, angleStep } from "gl/utils/angleUtils";
import { Core } from "core/Core";
import { IKeyboard } from "controls/IKeyboard";
import { ICamera } from "gl/camera/ICamera";

interface Config {
  step: number;
  turnStep: number;
  tiltStep: number;
}

export class CamStepAuxiliary implements Auxiliary {
  private readonly keyboard: IKeyboard;
  private readonly camera: ICamera;
  private readonly goal: {
    turn: number;
    tilt: number;
    pos: CellPos;
  };
  private stepCount: number = 0;
  private turnCount: number = 0;
  private tiltCount: number = 0;
  private config: Config;

  constructor(core: Core, config: Partial<Config> = {}) {
    this.keyboard = core.keyboard;
    this.camera = core.camera;
    const camPos = this.camera.getPosition();
    this.goal = {
      turn: this.camera.turnMatrix.turn,
      tilt: this.camera.tiltMatrix.tilt,
      pos: [...camPos],
    };
    this.config = {
      step: config.step ?? 2,
      turnStep: config.turnStep ?? Math.PI / 2,
      tiltStep: config.tiltStep ?? Math.PI / 2,
    };
  }

  private readonly prePos: CellPos = [0, 0, 0];
  refresh(update: UpdatePayload): void {
    const { keys } = this.keyboard;
    const { deltaTime } = update;

    const pos = this.camera.getPosition();
    const { step, turnStep, tiltStep } = this.config;
    this.prePos[0] = Math.round(pos[0] / step) * step;
    this.prePos[1] = Math.round(pos[1] / step) * step;
    this.prePos[2] = Math.round(pos[2] / step) * step;

    let dx = 0, dz = 0;
    if (keys.KeyW || keys.ArrowUp && !keys.ShiftRight) {
      dz--;
    }
    if (keys.KeyS || keys.ArrowDown && !keys.ShiftRight) {
      dz++;
    }
    if (keys.KeyA || (keys.ArrowLeft && !keys.ShiftRight)) {
      dx--;
    }
    if (keys.KeyD || (keys.ArrowRight && !keys.ShiftRight)) {
      dx++;
    }
    if (dx || dz || this.stepCount > 0) {
      const relativeDx = dx * Math.cos(this.goal.turn) - dz * Math.sin(this.goal.turn);
      const relativeDz = dx * Math.sin(this.goal.turn) + dz * Math.cos(this.goal.turn);

      const gx = Math.round(pos[0] / step + relativeDx) * step;
      const gz = Math.round(pos[2] / step + relativeDz) * step;
      this.goal.pos[0] = gx;
      this.goal.pos[2] = gz;
    }

    if (!dx && !dz) {
      this.stepCount = 0;
    }
    const speed = (dx || dz) ? deltaTime / 150 : deltaTime / 100;

    this.camera.gotoPos(this.goal.pos[0], pos[1], this.goal.pos[2], speed);
    const newPos = this.camera.getPosition();
    if (Math.round(newPos[0] / step) * step !== this.prePos[0]
      || Math.round(newPos[1] / step) * step !== this.prePos[1]
      || Math.round(newPos[2] / step) * step !== this.prePos[2]) {
      this.stepCount++;
    }

    let dTurn = 0;
    if (keys.KeyQ || (keys.ArrowLeft && keys.ShiftRight)) {
      dTurn--;
    }
    if (keys.KeyE || (keys.ArrowRight && keys.ShiftRight)) {
      dTurn++;
    }

    const turn = this.camera.turnMatrix.turn;
    const preTurn = angleStep(turn, turnStep);
    if (dTurn || this.turnCount > 0) {
      this.goal.turn = angleStep(turn + turnStep * dTurn, turnStep);
    }
    if (!dTurn) {
      this.turnCount = 0;
    }
    const turnSpeed = dTurn ? deltaTime / 200 : deltaTime / 100;
    let deltaTurn = angle(this.goal.turn - turn);
    if (deltaTurn) {
      const distTurn = Math.abs(deltaTurn);
      this.camera.turnMatrix.turn = distTurn < .01 ? this.goal.turn : turn + Math.sign(deltaTurn) * Math.min(turnSpeed, distTurn);
      const newTurn = angleStep(this.camera.turnMatrix.turn, turnStep);
      if (newTurn !== preTurn) {
        this.turnCount++;
      }
    }

    let dTilt = 0;
    if (keys.ArrowUp && keys.ShiftRight) {
      dTilt--;
    }
    if (keys.ArrowDown && keys.ShiftRight) {
      dTilt++;
    }

    const tilt = this.camera.tiltMatrix.tilt;
    const preTilt = angleStep(tilt, tiltStep);
    if (dTilt || this.tiltCount > 0) {
      this.goal.tilt = angleStep(tilt + tiltStep * dTilt, tiltStep);
    }
    if (!dTilt) {
      this.tiltCount = 0;
    }
    const tiltSpeed = dTilt ? deltaTime / 400 : deltaTime / 200;
    let deltaTilt = angle(this.goal.tilt - tilt);
    if (deltaTilt) {
      const distTilt = Math.abs(deltaTilt);
      this.camera.tiltMatrix.tilt = distTilt < .01 ? this.goal.tilt : tilt + Math.sign(deltaTilt) * Math.min(tiltSpeed, distTilt);
      const newTilt = angleStep(this.camera.tiltMatrix.tilt, tiltSpeed);
      if (newTilt !== preTilt) {
        this.tiltCount++;
      }
    }
  }
}
