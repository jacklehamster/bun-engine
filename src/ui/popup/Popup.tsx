import React, { CSSProperties } from 'react';
import './css/Popup.css';

interface Props {
  children: React.ReactNode;
  position: [number, number];
  size: [number | undefined, number | undefined];
  positionFromRight: boolean;
  positionFromBottom: boolean;
  fontSize: number | undefined;
  zIndex: number | undefined;
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

const DEFAULT_PADDING = 50;
const DEFAULT_FONT_SIZE = 24;

export function Popup({
  children,
  position: [x, y],
  size: [width, height],
  positionFromRight,
  positionFromBottom,
  fontSize,
  zIndex,
}: Props) {
  return (
    <div
      className="pop-up"
      style={{
        ...POPUP_CSS,
        left: positionFromRight ? `calc(100% - ${x}px)` : x,
        top: positionFromBottom ? `calc(100% - ${y}px)` : y,
        right: DEFAULT_PADDING,
        bottom: DEFAULT_PADDING,
        width,
        height,
        fontSize: fontSize ?? DEFAULT_FONT_SIZE,
        zIndex,
      }}
    >
      <div
        className="double-border"
        style={{
          height: `calc(${height === undefined ? '100%' : `${height}px`} - 27px)`,
          ...DOUBLE_BORDER_CSS,
        }}
      >
        {children}
      </div>
    </div>
  );
}
