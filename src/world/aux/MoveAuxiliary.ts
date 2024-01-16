import { UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "./Auxiliary";
import { IControls } from "controls/IControls";
import { PositionMatrix } from "gl/transform/PositionMatrix";
import { IMatrix } from "gl/transform/IMatrix";

interface Props {
  controls: IControls;
  direction?: IMatrix;
  position: PositionMatrix;
}

interface Config {
  speed: number;
}

export class MoveAuxiliary implements Auxiliary {
  private readonly controls: IControls;
  private readonly direction?: IMatrix;
  private readonly position: PositionMatrix;
  private config: Config;

  constructor(props: Props, config?: Partial<Config>) {
    this.controls = props.controls;
    this.direction = props.direction;
    this.position = props.position;
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
  }
}
