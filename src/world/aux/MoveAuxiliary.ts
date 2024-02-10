import { UpdatePayload, IMotor } from "motor-loop";
import { Auxiliary } from "./Auxiliary";
import { IControls } from "controls/IControls";
import { ControlledLooper } from "updates/ControlledLooper";
import { IMatrix, IPositionMatrix } from "dok-matrix";

interface Props {
  controls: IControls;
  direction?: IMatrix;
  position: IPositionMatrix;
  motor: IMotor;
}

interface Config {
  speed: number;
}

interface Data {
  controls: IControls;
  direction?: IMatrix;
  position: IPositionMatrix;
  speed: number;
}

export class MoveAuxiliary extends ControlledLooper<Data> implements Auxiliary {
  constructor({ controls, direction, motor, position }: Props, config?: Partial<Config>) {
    super(motor, controls, ({ forward, backward, left, right }) => forward || backward || left || right,
      { controls, direction, position, speed: config?.speed ?? 1 });
  }

  refresh({ data, deltaTime, stopUpdate }: UpdatePayload<Data>): void {
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
      stopUpdate();
    }
  }
}
