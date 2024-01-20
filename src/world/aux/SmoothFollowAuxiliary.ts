import { ChangeListener, IPositionMatrix } from "gl/transform/IPositionMatrix";
import { Auxiliary } from "./Auxiliary";
import { Looper } from "motor/Looper";
import { IMotor } from "motor/IMotor";
import { UpdatePayload } from "updates/UpdatePayload";

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
  private listener: ChangeListener = () => {
    this.start();
  };

  constructor({ followee, follower, motor }: Props, config?: Partial<Config>) {
    super(motor, false, { followee, follower, speed: config?.speed ?? 1 });
    this.followee = followee;
  }

  activate(): void {
    super.activate();
    this.followee.onChange(this.listener);
  }

  deactivate(): void {
    this.followee.removeChangeListener(this.listener);
    super.deactivate();
  }

  refresh({ data: { follower, followee, speed }, motor, refresher }: UpdatePayload<Data>): void {
    const [x, y, z] = followee.position;
    const [fx, fy, fz] = follower.position;
    const dx = x - fx, dy = y - fy, dz = z - fz;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist < .1) {
      follower.moveTo(x, y, z);
      motor.stopUpdate(refresher);
    } else {
      const moveSpeed = Math.min(dist, speed * dist) / dist;
      follower.moveBy(dx * moveSpeed, dy * moveSpeed, dz * moveSpeed);
    }
  }
}
