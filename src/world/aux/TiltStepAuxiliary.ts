import { UpdatePayload, IMotor } from "motor-loop";
import { IControls } from "controls/IControls";
import { IAngleMatrix, angleStep } from "dok-matrix";
import { ControlledLooper } from "updates/ControlledLooper";

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

export class TiltStepAuxiliary extends ControlledLooper<Data> {
  private tiltCount: number = 0;

  constructor({ controls, tilt, motor }: Props, config: Partial<Config> = {}) {
    super(motor, controls, ({ up, down }) => up || down, { controls, tilt, step: config.step ?? Math.PI / 2 });
  }

  refresh({ data, deltaTime, stopUpdate }: UpdatePayload<Data>): void {
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
      stopUpdate();
    }
  }
}
