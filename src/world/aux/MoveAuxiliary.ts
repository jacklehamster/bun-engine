import { UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { IControls } from "controls/IControls";
import { PositionMatrix } from "gl/transform/PositionMatrix";
import { IMatrix } from "gl/transform/IMatrix";
import { IMotor } from "motor/IMotor";
import { ControlledLooper } from "motor/ControlLooper";

interface Props {
  controls: IControls;
  direction?: IMatrix;
  position: PositionMatrix;
  motor: IMotor;
}

interface Config {
  speed: number;
}

interface Data {
  controls: IControls;
  direction?: IMatrix;
  position: PositionMatrix;
  speed: number;
}

export class MoveAuxiliary extends ControlledLooper<Data> implements Auxiliary {
  constructor({ controls, direction, motor, position }: Props, config?: Partial<Config>) {
    super(motor, controls, ({ forward, backward, left, right }) => forward || backward || left || right,
      { controls, direction, position, speed: config?.speed ?? 1 });
  }

  refresh({ data, deltaTime }: UpdatePayload<Data>): void {
    const { forward, backward, left, right } = data.controls;
    const speed = deltaTime / 80 * data.speed;
    let dx = 0, dz = 0;
    if (forward) {
      dz -= speed;
    }
    if (backward) {
      dz += speed;
    }
    if (left) {
      dx -= speed;
    }
    if (right) {
      dx += speed;
    }
    data.position.moveBy(dx, 0, dz, data.direction);
    if (!forward && !backward && !left && !right) {
      this.stop();
    }
  }
}
