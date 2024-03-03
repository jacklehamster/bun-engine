import React from 'react';
import ReactDOM from 'react-dom/client';
import { WebGlCanvas } from 'graphics/WebGlCanvas';
import { AuxiliaryHolder } from 'world/aux/AuxiliaryHolder';
import { HudContent } from './HudContent';
import { Listener } from './Listener';
import { UserInterface } from './UserInterface';
import { PopupManager } from './popup/PopupManager';
import { IControls } from 'controls/IControls';
import { MenuData } from './menu/model/MenuData';
import { DialogData } from './dialog/model/DialogData';
import { v4 as uuidv4 } from 'uuid';

const STYLE: React.CSSProperties = {
  position: 'absolute',
  pointerEvents: 'none',
  width: '100%',
  height: '100%',
};

const INNER_STYLE: React.CSSProperties = {
  backgroundColor: '#ffffff66',
};

interface Props {
  controls: IControls;
  webGlCanvas: WebGlCanvas;
}

export class Hud extends AuxiliaryHolder implements UserInterface {
  readonly #webGlCanvas: WebGlCanvas;
  readonly #rootElem = document.createElement('div');
  readonly #root = ReactDOM.createRoot(this.#rootElem);
  readonly #listeners: Set<Listener> = new Set();
  readonly #popupManager = new PopupManager(this.#listeners);
  readonly #controls: IControls;

  constructor({ controls, webGlCanvas }: Props) {
    super();
    this.#webGlCanvas = webGlCanvas;
    this.#controls = controls;
    this.#rootElem.style.pointerEvents = 'none';
  }

  openDialog(dialog: DialogData): void {
    const type = 'dialog';
    const uid = type + '-' + uuidv4();
    this.#popupManager.openDialog?.({ uid, type, ...dialog });
  }

  openMenu(menuData: MenuData): void {
    const type = 'menu';
    const uid = type + '-' + uuidv4();
    this.#popupManager.openMenu?.({ uid, type, ...menuData });
  }

  closePopup(): void {
    this.#popupManager.closePopup?.();
  }

  activate(): void {
    super.activate();
    document.body.appendChild(this.#rootElem);
    this.#root.render(this.createElement());
  }

  deactivate(): void {
    this.#root.unmount();
    document.body.removeChild(this.#rootElem);
    super.deactivate();
  }

  addDialogListener(listener: Listener) {
    this.#listeners.add(listener);
  }

  removeDialogListener(listener: Listener) {
    this.#listeners.delete(listener);
  }

  createElement(): React.ReactNode {
    const { offsetLeft: left, offsetTop: top } = this.#webGlCanvas.elem;

    return (
      <div style={{ ...STYLE, top, left }}>
        <div style={{ ...INNER_STYLE }}>
          <HudContent
            dialogManager={this.#popupManager}
            controls={this.#controls}
          />
        </div>
      </div>
    );
  }
}
