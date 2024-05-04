import { IMatrix, IPositionMatrix } from "dok-matrix";
import { Looper, IMotor, UpdatePayload } from "motor-loop";
import { IChangeListener } from "change-listener";
import { Active } from "dok-types";

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
}

export class FollowAuxiliary extends Looper<Data> implements Active {
  private readonly followee;
  private readonly config: Config;
  private listener: IChangeListener<IMatrix> = {
    onChange: () => {
      if (this.config.followX || this.config.followY || this.config.followZ) {
        this.start();
      }
    }
  };

  constructor({ followee, follower, motor }: Props, config?: Partial<Config>) {
    super({ motor, data: { followee, follower } }, { autoStart: false });
    this.followee = followee;
    this.config = {
      followX: config?.followX ?? true,
      followY: config?.followY ?? true,
      followZ: config?.followZ ?? true,
      speed: config?.speed ?? 1,
    };
  }

  activate(): void {
    super.activate();
    this.followee.addChangeListener(this.listener);
    this.start();
  }

  deactivate(): void {
    this.followee.removeChangeListener(this.listener);
    super.deactivate();
  }

  refresh({ data, stopUpdate }: UpdatePayload<Data>): void {
    const { followX, followY, followZ, speed } = this.config;
    const x = followX ? data.followee.position[0] : data.follower.position[0];
    const y = followY ? data.followee.position[1] : data.follower.position[1];
    const z = followZ ? data.followee.position[2] : data.follower.position[2];
    data.follower.moveTowards(x, y, z, speed);
    if (data.followee.position[0] === data.follower.position[0]
      && data.followee.position[1] === data.follower.position[1]
      && data.followee.position[2] === data.follower.position[2]) {
      stopUpdate();
    }
  }
}
