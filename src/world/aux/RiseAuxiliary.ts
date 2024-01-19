import { UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { ControlsListener, IControls } from "controls/IControls";
import { PositionMatrix } from "gl/transform/PositionMatrix";
import { Looper } from "motor/Looper";
import { IMotor } from "motor/IMotor";

interface Props {
  controls: IControls;
  position: PositionMatrix;
  motor: IMotor;
}

export class RiseAuxiliary extends Looper implements Auxiliary {
  private readonly controls: IControls;
  private readonly position: PositionMatrix;
  private readonly listener: ControlsListener = {
    onQuickAction: () => this.start(),
    onAction: () => this.stop(),
  };

  constructor({ controls, position, motor }: Props) {
    super(motor, false);
    this.controls = controls;
    this.position = position;
  }

  activate(): void {
    super.activate();
    this.controls.addListener(this.listener);
  }

  deactivate(): void {
    this.controls.removeListener(this.listener);
  }

  refresh(update: UpdatePayload): void {
    const { deltaTime } = update;

    this.riseAndDrop(deltaTime, this.controls);
  }

  riseAndDrop(deltaTime: number, controls: IControls): void {
    const speed = deltaTime / 80;
    const { action } = controls;
    if (action) {
      this.position.moveBy(0, speed, 0);
    } else {
      this.position.moveBy(0, -speed, 0);
      const [x, y, z] = this.position.position;
      if (y < 0) {
        this.position.moveTo(x, 0, z);
        this.stop();
      }
    }
  }
}
