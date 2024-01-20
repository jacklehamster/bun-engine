import { UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { angleStep } from "gl/utils/angleUtils";
import { IControls } from "controls/IControls";
import { IAngleMatrix } from "gl/transform/IAngleMatrix";
import { IMotor } from "motor/IMotor";
import { ControlledLooper } from "motor/ControlLooper";

interface Props {
  controls: IControls;
  tilt: IAngleMatrix;
  motor: IMotor;
}

interface Config {
  step: number;
}

interface Data {
  controls: IControls;
  tilt: IAngleMatrix;
  step: number;
}

export class TiltStepAuxiliary extends ControlledLooper<Data> implements Auxiliary {
  private tiltCount: number = 0;

  constructor({ controls, tilt, motor }: Props, config: Partial<Config> = {}) {
    super(motor, controls, ({ up, down }) => up || down, { controls, tilt, step: config.step ?? Math.PI / 2 });
  }

  refresh({ data, deltaTime }: UpdatePayload<Data>): void {
    const { up, down } = data.controls;

    let dTilt = 0;
    if (up) {
      dTilt--;
    }
    if (down) {
      dTilt++;
    }

    const { step } = data;
    const tilt = angleStep(data.tilt.angle.valueOf(), step);
    if (dTilt || this.tiltCount > 0) {
      data.tilt.angle.progressTowards(
        angleStep(tilt + step * dTilt, step),
        dTilt ? 1 / 400 : 1 / 200,
        this,
      );
    }
    if (!dTilt) {
      this.tiltCount = 0;
    }
    if (data.tilt.angle.update(deltaTime)) {
      const newTilt = angleStep(data.tilt.angle.valueOf(), step);
      if (newTilt !== tilt) {
        this.tiltCount++;
      }
    } else {
      this.stop();
    }
  }
}
