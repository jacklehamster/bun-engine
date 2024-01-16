import { UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { angleStep } from "gl/utils/angleUtils";
import { IControls } from "controls/IControls";
import { IAngleMatrix } from "gl/transform/IAngleMatrix";

interface Props {
  controls: IControls;
  turn: IAngleMatrix;
}

interface Config {
  step: number;
}

export class TurnStepAuxiliary implements Auxiliary {
  private readonly controls: IControls;
  private readonly turn: IAngleMatrix;
  private turnCount: number = 0;
  private config: Config;

  constructor({ controls, turn }: Props, config: Partial<Config> = {}) {
    this.controls = controls;
    this.turn = turn;
    this.config = {
      step: config.step ?? Math.PI / 2,
    };
  }

  refresh(update: UpdatePayload): void {
    const { turnLeft, turnRight } = this.controls;
    const { deltaTime } = update;

    let dTurn = 0;
    if (turnLeft) {
      dTurn--;
    }
    if (turnRight) {
      dTurn++;
    }

    const { step } = this.config;
    const turn = angleStep(this.turn.angle.valueOf(), step);
    if (dTurn || this.turnCount > 0) {
      this.turn.angle.progressTowards(
        angleStep(turn + step * dTurn, step),
        dTurn ? 1 / 200 : 1 / 100, this);
    }
    if (!dTurn) {
      this.turnCount = 0;
    }
    if (this.turn.angle.update(deltaTime)) {
      const newTurn = angleStep(this.turn.angle.valueOf(), step);
      if (newTurn !== turn) {
        this.turnCount++;
      }
    }
  }
}
