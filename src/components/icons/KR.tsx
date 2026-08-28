import React, { SVGProps } from 'react';

// Simplified Taegukgi: axis-aligned trigram bars (the official flag rotates
// them 33.7° toward each corner) - not visible at the small icon sizes this
// renders at, so the simpler geometry is used for legibility.
export const KRIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg fill="none" viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path fill="#fff" d="M0 0h640v480H0z" />
    <path
      fill="#cd2e3a"
      d="M320 144a48 48 0 0 1 0 96 96 96 0 0 0 0 192 192 192 0 0 0 0-384 96 96 0 0 0-48 48z"
    />
    <path
      fill="#0047a0"
      d="M320 144a48 48 0 0 0 0 96 96 96 0 0 1 0 192 192 192 0 0 1 0-384 96 96 0 0 1 48 48z"
    />
    <g fill="#000">
      <path d="M60 60h110v12H60zM60 92h110v12H60zM60 124h110v12H60z" />
      <path d="M470 60h45v12h-45zM535 60h45v12h-45zM470 92h110v12H470zM470 124h45v12h-45zM535 124h45v12h-45z" />
      <path d="M60 344h110v12H60zM60 376h45v12H60zM115 376h45v12h-45zM60 408h110v12H60z" />
      <path d="M470 344h45v12h-45zM535 344h45v12h-45zM470 376h45v12h-45zM535 376h45v12h-45zM470 408h45v12h-45zM535 408h45v12h-45z" />
    </g>
  </svg>
);
