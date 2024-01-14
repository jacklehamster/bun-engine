import React from 'react';
import ReactDOM from 'react-dom/client';
import { WebGlCanvas } from 'graphics/WebGlCanvas';
import { AuxiliaryHolder } from 'world/aux/AuxiliaryHolder';

export class Hud extends AuxiliaryHolder<WebGlCanvas> {
  private root;
  constructor() {
    super();
    this.root = ReactDOM.createRoot(
      document.body.appendChild(document.createElement('div')),
    );
    this.root.render(this.createElement());
  }

  createElement(): React.JSX.Element {
    return (
      <div
        style={{
          position: 'absolute',
        }}
      ></div>
    );
  }
}
