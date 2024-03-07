import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuxiliaryHolder } from 'world/aux/AuxiliaryHolder';
import { PopupOverlay } from './popup/base/PopupOverlay';
import { PopupListener } from './popup/base/PopupListener';
import { UserInterface } from './popup/UserInterface';
import { PopupManager } from './popup/base/PopupManager';
import { IControls } from 'controls/IControls';
import { MenuData } from './popup/menu/MenuData';
import { DialogData } from './popup/dialog/DialogData';
import { ControlsListener } from 'controls/ControlsListener';
import { PopupControl } from './popup/actions/PopupControl';
import { DOMWrap } from './DOMWrap';

const STYLE: React.CSSProperties = {
  position: 'absolute',
  pointerEvents: 'none',
  width: '100%',
  height: '100%',
};

interface Props {
  controls: IControls;
  dom: DOMWrap<HTMLElement>;
}

export class Hud extends AuxiliaryHolder implements UserInterface {
  readonly #dom: DOMWrap<HTMLElement>;
  readonly #rootElem = document.createElement('div');
  readonly #root = ReactDOM.createRoot(this.#rootElem);
  readonly #listeners: Set<PopupListener> = new Set();
  readonly #popupManager = new PopupManager(this.#listeners);
  readonly #controls: IControls;
  readonly #controlsListener: ControlsListener;
  readonly #popupControl = new PopupControl();

  constructor({ controls, dom }: Props) {
    super();
    this.#dom = dom;
    this.#controls = controls;
    this.#rootElem.style.pointerEvents = 'none';
    this.#controlsListener = {
      onAction: (controls) => {
        const dy = (controls.forward ? -1 : 0) + (controls.backward ? 1 : 0);
        if (dy < 0) {
          this.#popupControl.onUp();
        } else if (dy > 0) {
          this.#popupControl.onDown();
        }
        if (controls.action) {
          this.#popupControl.onAction();
        }
      },
    };
  }

  async openDialog(dialog: DialogData) {
    return this.#popupManager.openDialog?.(dialog);
  }

  async openMenu(menuData: MenuData) {
    return this.#popupManager.openMenu?.(menuData);
  }

  nextMessage(): void {
    this.#popupManager.nextMessage();
  }

  closePopup(): void {
    this.#popupManager.closePopup?.();
  }

  get selection(): number {
    return this.#popupManager.selection;
  }

  activate(): void {
    super.activate();
    document.body.appendChild(this.#rootElem);
    this.#root.render(this.createElement());
    this.#controls.addListener(this.#controlsListener);
  }

  deactivate(): void {
    this.#controls.removeListener(this.#controlsListener);
    this.#root.unmount();
    document.body.removeChild(this.#rootElem);
    super.deactivate();
  }

  addDialogListener(listener: PopupListener) {
    this.#listeners.add(listener);
  }

  removeDialogListener(listener: PopupListener) {
    this.#listeners.delete(listener);
  }

  createElement(): React.ReactNode {
    const { offsetLeft: left, offsetTop: top } = this.#dom.elem;

    return (
      <div style={{ ...STYLE, top, left }}>
        <PopupOverlay
          popupManager={this.#popupManager}
          popupControl={this.#popupControl}
        />
      </div>
    );
  }
}
