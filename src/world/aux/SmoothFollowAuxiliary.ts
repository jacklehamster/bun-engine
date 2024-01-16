import { PositionMatrix } from "gl/transform/PositionMatrix";
import { Auxiliary } from "./Auxiliary";

interface Props {
  followee: PositionMatrix;
  follower: PositionMatrix;
}

export class SmoothFollowAuxiliary implements Auxiliary {
  private followee;
  private follower;
  constructor({ followee, follower }: Props) {
    this.followee = followee;
    this.follower = follower;
  }

  refresh(): void {
    const [x, y, z] = this.followee.position;
    const [fx, fy, fz] = this.follower.position;
    const dx = x - fx, dy = y - fy, dz = z - fz;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist < .1) {
      this.follower.moveTo(x, y, z);
    } else {
      this.follower.moveBy(dx / 10, dy / 10, dz / 10);
    }
  }
}
