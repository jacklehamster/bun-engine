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

export class MoveAuxiliary extends ControlledLooper implements Auxiliary {
  private readonly direction?: IMatrix;
  private readonly position: PositionMatrix;
  private config: Config;

  constructor({ controls, direction, motor, position }: Props, config?: Partial<Config>) {
    super(motor, controls, ({ forward, backward, left, right }) => forward || backward || left || right);
    this.direction = direction;
    this.position = position;
    this.config = {
      speed: config?.speed ?? 1,
    };
  }

  refresh(update: UpdatePayload): void {
    const { forward, backward, left, right } = this.controls;
    const { deltaTime } = update;
    const speed = deltaTime / 80 * this.config.speed;
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
    this.position.moveBy(dx, 0, dz, this.direction);
    if (!forward && !backward && !left && !right) {
      this.stop();
    }
  }
}
