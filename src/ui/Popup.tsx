import React, { CSSProperties } from 'react';
import './css/Popup.css';

interface Props {
  children: React.ReactNode;
  position: [number, number];
  size: [number, number];
}

//  Hack until I get proper CSS to work
const POPUP_CSS: CSSProperties = {
  position: 'absolute',
  outline: '3px solid #fff',
  backgroundColor: 'black',
  borderRadius: 12,
  padding: 3,
  boxShadow: '10px 10px 0px #000000cc',
};

const DOUBLE_BORDER_CSS: CSSProperties = {
  border: '3px solid white',
  borderRadius: 10,
  outline: '3px solid black',
  color: 'white',
  padding: 10,
};

export function Popup({
  children,
  position: [left, top],
  size: [width, height],
}: Props) {
  return (
    <div
      className="pop-up"
      style={{
        left,
        top,
        ...POPUP_CSS,
      }}
    >
      <div
        className="double-border"
        style={{
          width,
          height,
          ...DOUBLE_BORDER_CSS,
        }}
      >
        {children}
      </div>
    </div>
  );
}
