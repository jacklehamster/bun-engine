import { Keyboard } from "controls/Keyboard";
import { ActivateProps } from "core/Active";
import { Camera } from "gl/camera/Camera";
import { UpdatePayload } from "updates/Refresh";
import { Auxliary } from "./Auxiliary";
import { CellPos } from "world/grid/CellPos";

interface Config {
  step: number;
  turnStep: number;
}

export class CamStepAuxiliary implements Auxliary {
  private keyboard?: Keyboard;
  private readonly goal: {
    turn: number;
    pos: CellPos;
  };
  private stepCount: number = 0;
  private turnCount: number = 0;
  private config: Config;

  constructor(private camera: Camera, config: Partial<Config> = {}) {
    const camPos = camera.getPosition();
    this.goal = {
      turn: camera.getTurnAngle(),
      pos: [...camPos],
    };
    this.config = {
      step: config.step ?? 1,
      turnStep: config.step ?? Math.PI / 2,
    };
  }

  activate({ core }: ActivateProps): () => void {
    this.keyboard = core.keyboard;
    const deregister = core.motor.loop(this);
    return () => {
      deregister();
    };
  }

  private prePos: CellPos = [0, 0, 0];
  refresh(update: UpdatePayload): void {
    if (!this.keyboard) {
      return;
    }
    const { keys } = this.keyboard;
    const { deltaTime } = update;

    const pos = this.camera.getPosition();
    const { step, turnStep } = this.config;
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
      const gx = Math.round(pos[0] / step + dx) * step;
      const gz = Math.round(pos[2] / step + dz) * step;
      this.goal.pos[0] = gx;
      this.goal.pos[2] = gz;
    }

    if (!dx && !dz) {
      this.stepCount = 0;
    }
    const speed = (dx || dz) ? deltaTime / 100 : deltaTime / 50;

    this.camera.gotoPos(this.goal.pos[0], pos[1], this.goal.pos[2], speed);
    const newPos = this.camera.getPosition();
    if (Math.round(newPos[0] / step) * step !== this.prePos[0]
      || Math.round(newPos[1] / step) * step !== this.prePos[1]
      || Math.round(newPos[2] / step) * step !== this.prePos[2]) {
      this.stepCount++;
    }

    // let dTurn = 0;
    // if (keys.KeyQ || (keys.ArrowLeft && keys.ShiftRight)) {
    //   dTurn--;
    // }
    // if (keys.KeyE || (keys.ArrowRight && keys.ShiftRight)) {
    //   dTurn++;
    // }
    // if (!dTurn) {
    //   this.turnCount = 0;
    // }
    // const turn = this.camera.getTurnAngle();
    // const preTurn = Math.round(turn / turnStep) * turnStep;
    // if (dTurn || this.turnCount > 0) {
    //   const gturn = Math.round(turn / turnStep + dTurn) * turnStep;
    //   this.goal.turn = gturn;
    // }
    // const turnSpeed = deltaTime / 400;
    // const distTurn = (this.goal.turn - turn + (Math.PI * 2)) % (Math.PI * 2);
    // if (distTurn) {
    //   if (Math.abs(distTurn) < .1) {
    //     this.camera.setTurnAngle(this.goal.turn);
    //   } else {
    //     this.camera.setTurnAngle(turn + (turnSpeed < Math.abs(distTurn) ? Math.sign(distTurn) * turnSpeed : distTurn));
    //   }
    //   //    this.camera.turnCam(turnSpeed > distTurn ? Math.sign(distTurn) * turnSpeed : distTurn);
    //   const newTurn = this.camera.getTurnAngle();
    //   if (Math.round(newTurn / turnStep) * turnStep !== preTurn) {
    //     this.turnCount++;
    //   }
    // }
    // if (keys.ArrowUp && keys.ShiftRight) {
    //   this.camera.tilt(-turnspeed);
    // }
    // if (keys.ArrowDown && keys.ShiftRight) {
    //   this.camera.tilt(turnspeed);
    // }
  }
}
