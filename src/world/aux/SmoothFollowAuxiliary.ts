import { IMatrix, IPositionMatrix } from "dok-matrix";
import { Auxiliary } from "./Auxiliary";
import { Looper, IMotor, UpdatePayload } from "motor-loop";
import { IChangeListener } from "change-listener";

interface Props {
  followee: IPositionMatrix;
  follower: IPositionMatrix;
  motor: IMotor;
}

interface Config {
  followX: boolean;
  followY: boolean;
  followZ: boolean;
  speed: number;
}

interface Data {
  followee: IPositionMatrix;
  follower: IPositionMatrix;
  config: Config;
}

export class SmoothFollowAuxiliary extends Looper<Data> implements Auxiliary {
  private followee: IPositionMatrix;
  private listener: IChangeListener<IMatrix> = { onChange: () => this.start() };

  constructor({ followee, follower, motor }: Props, config?: Partial<Config>) {
    super({
      motor, data: {
        followee, follower, config: {
          speed: config?.speed ?? 1,
          followX: config?.followX ?? true,
          followY: config?.followY ?? true,
          followZ: config?.followZ ?? true,
        },
      }
    }, { autoStart: false });
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

  refresh({ data: { follower, followee, config: { followX, followY, followZ, speed } }, stopUpdate }: UpdatePayload<Data>): void {
    const [x, y, z] = followee.position;
    const [fx, fy, fz] = follower.position;
    const dx = followX ? x - fx : 0, dy = followY ? y - fy : 0, dz = followZ ? z - fz : 0;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist < .1) {
      follower.moveTo(followX ? x : fx, followY ? y : fy, followZ ? z : fz);
      stopUpdate();
    } else {
      const moveSpeed = Math.min(dist, speed * dist) / dist;
      follower.moveBy(dx * moveSpeed, dy * moveSpeed, dz * moveSpeed);
    }
  }
}
