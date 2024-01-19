import { PositionMatrix } from "gl/transform/PositionMatrix";
import { Auxiliary } from "./Auxiliary";

interface Props {
  followee: PositionMatrix;
  follower: PositionMatrix;
}

export class FollowAuxiliary implements Auxiliary {
  private followee;
  private follower;
  constructor({ followee, follower }: Props) {
    this.followee = followee;
    this.follower = follower;
  }

  refresh(): void {
    const [x, y, z] = this.followee.position;
    this.follower.gotoPos(x, this.follower.position[1], z, 1);
  }
}
