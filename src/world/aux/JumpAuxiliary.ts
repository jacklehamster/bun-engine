import { UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { IControls } from "controls/IControls";
import { IPositionMatrix } from "gl/transform/IPositionMatrix";
import { IMotor } from "motor/IMotor";
import { ControlledLooper } from "motor/ControlledLooper";

interface Config {
  gravity: number;
  jump: number;
  plane: number;
}

interface Props {
  controls: IControls;
  position: IPositionMatrix;
  motor: IMotor;
}

interface Data {
  controls: IControls;
  position: IPositionMatrix;
  gravity: number;
  jump: number;
  plane: number;
}

export class JumpAuxiliary extends ControlledLooper<Data> implements Auxiliary {
  private dy: number;

  constructor({ controls, position, motor }: Props, config?: Partial<Config>) {
    super(motor, controls, controls => controls.action,
      {
        controls, position,
        gravity: config?.gravity ?? -1,
        jump: config?.jump ?? 2,
        plane: config?.plane ?? 5,
      });
    this.dy = 0;
  }

  refresh({ deltaTime, data }: UpdatePayload<Data>): void {
    this.jump(deltaTime, data);
  }

  jump(deltaTime: number, data: Data): void {
    const speed = deltaTime / 80;
    const acceleration = deltaTime / 80;
    const { action } = data.controls;
    const [_x, y, _z] = data.position.position;
    if (y === 0) {
      if (action) {
        this.dy = data.jump;
        data.position.moveBy(0, speed * this.dy, 0);
      }
    } else {
      data.position.moveBy(0, speed * this.dy, 0);
      const [x, y, z] = data.position.position;
      if (y > 0) {
        const mul = this.dy < 0 ? 1 / data.plane : 1;
        this.dy += data.gravity * acceleration * mul;
      } else {
        data.position.moveTo(x, 0, z);
        this.dy = 0;
        this.stop();
      }
    }
  }
}
