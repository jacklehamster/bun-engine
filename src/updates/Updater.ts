import { UpdateNotifier } from "updates/UpdateNotifier";
import { Auxiliary } from "world/aux/Auxiliary";
import { UpdateRegistry } from "updates/UpdateRegistry";
import { UpdatableList } from "world/sprite/UpdatableList";

interface Props {
  updateRegistry: UpdateRegistry;
  elems: UpdatableList<any>;
}

export class Updater<T> implements UpdateNotifier, Auxiliary {
  private readonly elems: UpdatableList<any>;
  private readonly updateRegistry: UpdateRegistry;

  constructor({ updateRegistry, elems }: Props) {
    this.updateRegistry = updateRegistry;
    this.elems = elems;
  }

  activate(): void {
    this.elems.informUpdate = this.informUpdate.bind(this);
  }

  informUpdate(id: number): void {
    this.updateRegistry.informUpdate(id);
  }
}
