import React, { SVGProps } from 'react';

export const JPIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg fill="none" viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path fill="#fff" d="M0 0h640v480H0z" />
    <circle cx={320} cy={240} r={144} fill="#bc002d" />
  </svg>
);
