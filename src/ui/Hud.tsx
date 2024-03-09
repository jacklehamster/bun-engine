import React from 'react';
import { AuxiliaryHolder } from 'world/aux/AuxiliaryHolder';
import { IControls } from 'controls/IControls';
import { ControlsListener } from 'controls/ControlsListener';
import { DOMWrap } from './DOMWrap';
import { UserInterface, attachPopup } from 'dialog-system';

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

export class Hud extends AuxiliaryHolder {
  readonly #dom: DOMWrap<HTMLElement>;
  readonly ui: UserInterface;
  readonly #controls: IControls;
  readonly #controlsListener: ControlsListener;
  readonly #popupControl;
  readonly #div: HTMLDivElement;

  constructor({ controls, dom }: Props) {
    super();
    this.#dom = dom;
    this.#controls = controls;
    this.#div = document.createElement('div');
    const { ui, popupControl } = attachPopup(this.#div);
    this.ui = ui;
    this.#popupControl = popupControl;

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

  activate(): void {
    super.activate();
    document.body.appendChild(this.#div);
    this.#controls.addListener(this.#controlsListener);
  }

  deactivate(): void {
    this.#controls.removeListener(this.#controlsListener);
    document.body.removeChild(this.#div);
    super.deactivate();
  }
}
