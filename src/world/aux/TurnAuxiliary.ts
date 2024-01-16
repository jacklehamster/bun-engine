import { UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { IControls } from "controls/IControls";
import { TurnMatrix } from "gl/transform/TurnMatrix";
import { IAngleMatrix } from "gl/transform/IAngleMatrix";

interface Props {
  controls: IControls;
  turn: TurnMatrix;
}

export class TurnAuxiliary implements Auxiliary {
  private readonly controls: IControls;
  private readonly turn: IAngleMatrix;

  constructor(props: Props) {
    this.controls = props.controls;
    this.turn = props.turn;
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
