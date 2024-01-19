import { PositionMatrix } from "gl/transform/PositionMatrix";
import { ChangeListener } from "gl/transform/IPositionMatrix";
import { Auxiliary } from "./Auxiliary";
import { Looper } from "motor/Looper";
import { IMotor } from "motor/IMotor";

interface Props {
  followee: PositionMatrix;
  follower: PositionMatrix;
  motor: IMotor;
}

export interface Config {
  speed: number;
}

export class SmoothFollowAuxiliary extends Looper implements Auxiliary {
  private followee;
  private follower;
  private speed: number;
  private listener: ChangeListener = () => {
    this.start();
  };

  constructor({ followee, follower, motor }: Props, config?: Partial<Config>) {
    super(motor, false);
    this.followee = followee;
    this.follower = follower;
    this.speed = config?.speed ?? 1;
  }

  activate(): void {
    super.activate();
    this.followee.onChange(this.listener);
  }

  deactivate(): void {
    this.followee.removeChangeListener(this.listener);
    super.deactivate();
  }

  refresh(): void {
    const [x, y, z] = this.followee.position;
    const [fx, fy, fz] = this.follower.position;
    const dx = x - fx, dy = y - fy, dz = z - fz;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist < .1) {
      this.follower.moveTo(x, y, z);
      this.stop();
    } else {
      const speed = Math.min(dist, this.speed * dist);
      this.follower.moveBy(dx / dist * speed, dy / dist * speed, dz / dist * speed);
    }
  }
}
