import React from 'react';

export default function ExitFullScreenIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 60 60"
      role="img"
      aria-label="Exit full screen"
      title="Exit full screen"
      {...props}
    >
      <path
        style={{
          lineHeight          : 'normal',
          textIndent          : '0',
          textAlign           : 'start',
          textDecorationLine  : 'none',
          textDecorationStyle : 'solid',
          textDecorationColor : '#000',
          textTransform       : 'none',
          blockProgression    : 'tb',
          isolation           : 'auto',
          mixBlendMode        : 'normal',
        }}
        d="M 0 16.6 h 16.6 v -16.6 M 33.3 0 v 16.6 h 16.6 M 0 33.3 h 16.6 v 16.6 M 33.3 50 v -16.6 h 16.6"
        fill="transparent"
        stroke="black"
        strokeWidth="2"
      />
    </svg>
  );
}
