import { UpdatePayload, IMotor } from "motor-loop";
import { IControls } from "controls/IControls";
import { IPositionMatrix } from "dok-matrix";
import { ControlledLooper } from "updates/ControlledLooper";

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

export class JumpAuxiliary extends ControlledLooper<Data> {
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

  refresh({ deltaTime, data, stopUpdate }: UpdatePayload<Data>): void {
    if (!this.jump(deltaTime, data)) {
      stopUpdate();
    }
  }

  jump(deltaTime: number, data: Data): boolean {
    const speed = deltaTime / 80;
    const acceleration = deltaTime / 80;
    const { action } = data.controls;
    const onGround = data.position.position[1] <= 0;
    const movingDown = !onGround && data.position.moveBy(0, speed * this.dy, 0);
    if (onGround || !movingDown) {
      if (action) {
        this.dy = data.jump;
        data.position.moveBy(0, speed * this.dy, 0);
        return true;
      }
      this.dy = 0;
    }
    if (!onGround) {
      const mul = this.dy < 0 ? 1 / data.plane : 1;
      this.dy += data.gravity * acceleration * mul;
    } else {
      data.position.moveTo(data.position.position[0], 0, data.position.position[2]);
    }
    return !onGround;
  }
}
