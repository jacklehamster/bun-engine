import { Refresh, UpdatePayload } from "./Refresh";
import { UpdateNotifier } from "./UpdateNotifier";
import { IMotor } from "core/motor/IMotor";
import { IdType } from "core/IdType";

export interface UpdateListener {
  onUpdate(updatePayload: UpdatePayload): void;
}

export class UpdateRegistry implements Refresh, UpdateNotifier {
  private readonly updatedIds: Set<IdType> = new Set();
  constructor(private applyUpdate: (ids: Set<IdType>) => void, private motor: IMotor, private readonly updateListener?: UpdateListener) {
  }

  informUpdate(id: IdType): void {
    this.addId(id);
    this.motor.registerUpdate(this);
  }

  addId(spriteId: IdType): void {
    this.updatedIds.add(spriteId);
  }

  refresh(updatePayload: UpdatePayload): void {
    if (this.updatedIds.size) {
      this.applyUpdate(this.updatedIds);
      if (this.updatedIds.size) { //  re-register if some updates are remaining
        this.motor.registerUpdate(this);
      }
      this.updateListener?.onUpdate(updatePayload);
    }
  }
}
