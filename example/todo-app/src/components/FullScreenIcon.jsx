import React from 'react';

export default function FullScreenIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 50 50"
      role="img"
      aria-label="Enter full screen"
      title="Enter full screen"
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
        d="M 6 6 L 6 18 A 1.0001 1.0001 0 1 0 8 18 L 8 8 L 18 8 A 1.0001 1.0001 0 1 0 18 6 L 6 6 z M 32 6 A 1.0001 1.0001 0 0 0 31.929688 7.9980469 A 1.0001 1.0001 0 0 0 32 8 L 42 8 L 42 18 A 1.0001 1.0001 0 0 0 42.916016 19.009766 A 1.0001 1.0001 0 0 0 43.015625 19.013672 A 1.0001 1.0001 0 0 0 44 18 L 44 6 L 32 6 z M 6.984375 31.986328 A 1.0001 1.0001 0 0 0 6 33 L 6 45 L 18 45 A 1.0001 1.0001 0 0 0 18.099609 44.996094 A 1.0001 1.0001 0 0 0 18 43 L 8 43 L 8 33 A 1.0001 1.0001 0 0 0 6.984375 31.986328 z M 42.984375 31.986328 A 1.0001 1.0001 0 0 0 42 33 L 42 43 L 32 43 A 1.0001 1.0001 0 1 0 32 45 L 44 45 L 44 33 A 1.0001 1.0001 0 0 0 42.984375 31.986328 z"
      />
    </svg>
  );
}
