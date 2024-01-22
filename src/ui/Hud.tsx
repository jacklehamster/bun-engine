import React from 'react';
import ReactDOM from 'react-dom/client';
import { WebGlCanvas } from 'graphics/WebGlCanvas';
import { AuxiliaryHolder } from 'world/aux/AuxiliaryHolder';
import { DOMWrap } from './DOMWrap';
import { HudContent } from './HudContent';
import { Listener } from './Listener';
import { UserInterface } from './UserInterface';
import { PopupManager } from './PopupManager';
import { IControls } from 'controls/IControls';
import { MenuData } from './menu/model/MenuData';
import { DialogData } from './dialog/model/DialogData';

const STYLE: React.CSSProperties = {
  position: 'absolute',
  pointerEvents: 'none',
  width: '100%',
  height: '100%',
};

interface Props {
  controls: IControls;
}

export class Hud
  extends AuxiliaryHolder<DOMWrap<Element>>
  implements UserInterface
{
  holder?: WebGlCanvas;
  private readonly rootElem = document.createElement('div');
  private readonly root = ReactDOM.createRoot(this.rootElem);
  private readonly listeners: Set<Listener> = new Set();
  private readonly popupManager = new PopupManager(this.listeners);
  private readonly controls: IControls;

  constructor({ controls }: Props) {
    super();
    this.controls = controls;
    this.rootElem.style.pointerEvents = 'none';
  }

  showDialog(dialog: DialogData): void {
    this.popupManager.showDialog?.(dialog);
  }

  dismissDialog(): void {
    this.popupManager.dismissDialog?.();
  }

  showMenu(menuData: MenuData): void {
    this.popupManager.showMenu?.(menuData);
  }

  dismissMenu(): void {
    this.popupManager.dismissMenu?.();
  }

  activate(): void {
    super.activate();
    document.body.appendChild(this.rootElem);
    this.root.render(this.createElement());
  }

  deactivate(): void {
    this.root.unmount();
    document.body.removeChild(this.rootElem);
    super.deactivate();
  }

  addDialogListener(listener: Listener) {
    this.listeners.add(listener);
  }

  removeDialogListener(listener: Listener) {
    this.listeners.delete(listener);
  }

  createElement(): React.ReactNode {
    const { offsetLeft: left, offsetTop: top } = this.holder?.elem ?? {};

    return (
      <div style={{ ...STYLE, top, left }}>
        <div
          style={{
            backgroundColor: '#ffffff66',
          }}
        >
          <HudContent
            dialogManager={this.popupManager}
            controls={this.controls}
          />
        </div>
      </div>
    );
  }
}
