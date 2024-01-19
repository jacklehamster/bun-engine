import { UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { IControls } from "controls/IControls";
import { TurnMatrix } from "gl/transform/TurnMatrix";
import { IAngleMatrix } from "gl/transform/IAngleMatrix";
import { IMotor } from "motor/IMotor";
import { Looper } from "motor/Looper";

interface Props {
  controls: IControls;
  turn: TurnMatrix;
  motor: IMotor;
}

export class TurnAuxiliary extends Looper implements Auxiliary {
  private readonly controls: IControls;
  private readonly turn: IAngleMatrix;

  constructor({ controls, turn, motor }: Props) {
    super(motor, true);
    this.controls = controls;
    this.turn = turn;
  }

  refresh(update: UpdatePayload): void {
    const { turnLeft, turnRight } = this.controls;
    const { deltaTime } = update;
    const turnspeed = deltaTime / 400;
    if (turnLeft) {
      this.turn.angle.addValue(-turnspeed);
    }
    if (turnRight) {
      this.turn.angle.addValue(turnspeed);
    }
  }
}
