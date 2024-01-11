import { Refresh } from "./Refresh";
import { UpdateNotifier } from "./UpdateNotifier";
import { IMotor } from "core/motor/IMotor";
import { IdType } from "core/IdType";

export class UpdateRegistry implements Refresh, UpdateNotifier {
  private readonly updatedIds: Set<IdType> = new Set();
  constructor(private applyUpdate: (ids: Set<IdType>) => void, private motor: IMotor) {
  }

  informUpdate(id: IdType): void {
    this.addId(id);
    this.motor.registerUpdate(this);
  }

  addId(id: IdType): void {
    this.updatedIds.add(id);
  }

  refresh(): void {
    this.applyUpdate(this.updatedIds);
    if (this.updatedIds.size) { //  re-register if some updates are remaining
      this.motor.registerUpdate(this);
    }
  }
}
