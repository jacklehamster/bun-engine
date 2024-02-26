import { IMatrix, IPositionMatrix } from "dok-matrix";
import { Auxiliary } from "./Auxiliary";
import { Looper, IMotor, UpdatePayload } from "motor-loop";
import { IChangeListener } from "change-listener";

interface Props {
  followee: IPositionMatrix;
  follower: IPositionMatrix;
  motor: IMotor;
}

interface Data {
  followee: IPositionMatrix;
  follower: IPositionMatrix;
  speed: number;
}

interface Config {
  speed: number;
}

export class SmoothFollowAuxiliary extends Looper<Data> implements Auxiliary {
  private followee: IPositionMatrix;
  private listener: IChangeListener<IMatrix> = { onChange: () => this.start() };

  constructor({ followee, follower, motor }: Props, config?: Partial<Config>) {
    super({ motor, data: { followee, follower, speed: config?.speed ?? 1 } }, { autoStart: false });
    this.followee = followee;
  }

  activate(): void {
    super.activate();
    this.followee.addChangeListener(this.listener);
  }

  deactivate(): void {
    this.followee.removeChangeListener(this.listener);
    super.deactivate();
  }

  refresh({ data: { follower, followee, speed }, stopUpdate }: UpdatePayload<Data>): void {
    const [x, y, z] = followee.position;
    const [fx, fy, fz] = follower.position;
    const dx = x - fx, dy = y - fy, dz = z - fz;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist < .1) {
      follower.moveTo(x, y, z);
      stopUpdate();
    } else {
      const moveSpeed = Math.min(dist, speed * dist) / dist;
      follower.moveBy(dx * moveSpeed, dy * moveSpeed, dz * moveSpeed);
    }
  }
}
