import { IUpdateListener } from "updates/IUpdateNotifier";
import { Auxiliary } from "world/aux/Auxiliary";
import { UpdateRegistry } from "updates/UpdateRegistry";
import { UpdatableList } from "core/UpdatableList";

interface Props {
  updateRegistry: UpdateRegistry;
  elems: UpdatableList<any>;
}

export class Updater implements Auxiliary, IUpdateListener {
  private readonly elems: UpdatableList<any>;
  private readonly updateRegistry: UpdateRegistry;

  constructor({ updateRegistry, elems }: Props) {
    this.updateRegistry = updateRegistry;
    this.elems = elems;
  }

  onUpdate(id: number, type?: number | undefined): void {
    this.updateRegistry.informUpdate(id, type);
  }

  activate(): void {
    this.elems.addUpdateListener?.(this);
  }

  deactivate(): void {
    this.elems.removeUpdateListener?.(this);
  }
}
