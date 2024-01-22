import React from 'react';

interface Props {
  children: React.ReactNode;
  position: [number, number];
  size: [number, number];
}

export function Popup({
  children,
  position: [left, top],
  size: [width, height],
}: Props) {
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        outline: '3px solid #fff',
        backgroundColor: 'black',
        borderRadius: 12,
        padding: 3,
        boxShadow: '10px 10px 0px #000000cc',
      }}
    >
      <div
        className="double-border"
        style={{
          width,
          height,
          border: '3px solid white',
          borderRadius: 10,
          outline: '3px solid black',
          color: 'white',
        }}
      >
        <div style={{ padding: 10 }}>{children}</div>
      </div>
    </div>
  );
}
