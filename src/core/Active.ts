import IWorld from "world/IWorld";

export interface Active {
  activate(world: IWorld): (() => void) | void;
  deactivate(): void;
}
