import { UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { angleStep } from "gl/utils/angleUtils";
import { IControls } from "controls/IControls";
import { IAngleMatrix } from "gl/transform/IAngleMatrix";

interface Props {
  controls: IControls;
  tilt: IAngleMatrix;
}

interface Config {
  step: number;
}

export class TiltStepAuxiliary implements Auxiliary {
  private readonly controls: IControls;
  private readonly tilt: IAngleMatrix;
  private tiltCount: number = 0;
  private config: Config;

  constructor({ controls, tilt }: Props, config: Partial<Config> = {}) {
    this.controls = controls;
    this.tilt = tilt;
    this.config = {
      step: config.step ?? Math.PI / 2,
    };
  }

  refresh(update: UpdatePayload): void {
    const { up, down } = this.controls;

    let dTilt = 0;
    if (up) {
      dTilt--;
    }
    if (down) {
      dTilt++;
    }

    const { step } = this.config;
    const tilt = angleStep(this.tilt.angle.valueOf(), step);
    if (dTilt || this.tiltCount > 0) {
      this.tilt.angle.progressTowards(
        angleStep(tilt + step * dTilt, step),
        dTilt ? 1 / 400 : 1 / 200,
        this,
      );
    }
    if (!dTilt) {
      this.tiltCount = 0;
    }
    const { deltaTime } = update;
    if (this.tilt.angle.update(deltaTime)) {
      const newTilt = angleStep(this.tilt.angle.valueOf(), step);
      if (newTilt !== tilt) {
        this.tiltCount++;
      }
    }
  }
}
