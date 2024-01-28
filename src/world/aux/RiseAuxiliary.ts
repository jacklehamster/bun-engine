import { UpdatePayload } from "motor/update/UpdatePayload";
import { Auxiliary } from "./Auxiliary";
import { IControls } from "controls/IControls";
import { ControlsListener } from "controls/ControlsListener";
import { IMotor } from "motor/IMotor";
import { Looper } from "motor/Looper";
import { IPositionMatrix } from "gl/transform/IPositionMatrix";

interface Props {
  controls: IControls;
  position: IPositionMatrix;
  motor: IMotor;
}

interface Data {
  controls: IControls;
  position: IPositionMatrix;
}

export class RiseAuxiliary extends Looper<Data> implements Auxiliary {
  private readonly controls;
  private readonly listener: ControlsListener = {
    onQuickAction: () => this.start(),
    onAction: () => this.start(),
  };

  constructor({ position, controls, motor }: Props) {
    super(motor, false, { controls, position });
    this.controls = controls;
  }

  activate(): void {
    super.activate();
    this.controls.addListener(this.listener);
  }

  deactivate(): void {
    this.controls.removeListener(this.listener);
    super.deactivate();
  }

  refresh({ deltaTime, data, stopUpdate }: UpdatePayload<Data>): void {
    if (!this.riseAndDrop(deltaTime, data.controls, data.position)) {
      stopUpdate();
    }
  }

  riseAndDrop(deltaTime: number, controls: IControls, position: IPositionMatrix): boolean {
    const speed = deltaTime / 80;
    const { action } = controls;
    if (action) {
      position.moveBy(0, speed, 0);
    } else {
      position.moveBy(0, -speed, 0);
      const [x, y, z] = position.position;
      if (y < 0) {
        position.moveTo(x, 0, z);
        return false;
      }
    }
    return true;
  }
}
