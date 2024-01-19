import React from 'react';
import ReactDOM from 'react-dom/client';
import { WebGlCanvas } from 'graphics/WebGlCanvas';
import { AuxiliaryHolder } from 'world/aux/AuxiliaryHolder';
import { DOMWrap } from './DOMWrap';

const STYLE: React.CSSProperties = {
  position: 'absolute',
  pointerEvents: 'none',
  width: '100%',
  height: '100%',
};

export class Hud extends AuxiliaryHolder<DOMWrap<Element>> {
  holder?: WebGlCanvas;
  private readonly rootElem = document.createElement('div');
  private readonly root = ReactDOM.createRoot(this.rootElem);

  activate(): void {
    document.body.appendChild(this.rootElem);
    this.root.render(this.createElement());
  }

  deactivate(): void {
    this.root.unmount();
    document.body.removeChild(this.rootElem);
  }

  createElement(): React.ReactNode {
    const { offsetLeft: left, offsetTop: top } = this.holder?.elem ?? {};

    return (
      <div style={{ ...STYLE, top, left }}>
        <div style={{ backgroundColor: '#ffffff66' }}>Hello World</div>
      </div>
    );
  }
}
