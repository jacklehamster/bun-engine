import { UpdateNotifier } from "updates/UpdateNotifier";
import { Auxiliary } from "world/aux/Auxiliary";
import { UpdateRegistry } from "updates/UpdateRegistry";
import { List } from "../List";
import { Holder } from "world/aux/Holder";
import { ElemsHolder } from "../aux/ElemsHolder";

export class Updater<T> implements UpdateNotifier, Auxiliary<Holder & ElemsHolder<T>> {
  protected elems?: List<T> & Partial<UpdateNotifier>;

  constructor(private updateRegistry: UpdateRegistry) {
  }

  set holder(value: ElemsHolder<T> & List<T> & Partial<UpdateNotifier>) {
    this.elems = value;
    this.elems.informUpdate = this.informUpdate.bind(this);
  }

  informUpdate(id: number): void {
    this.updateRegistry.informUpdate(id);
  }
}
