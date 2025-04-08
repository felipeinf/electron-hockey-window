import React from 'react';

interface SvgIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  svgContent: string;
  style?: React.CSSProperties;
}

const SvgIcon = ({ svgContent, ...props }: SvgIconProps) => (
  <span
    {...props}
    dangerouslySetInnerHTML={{ __html: svgContent }}
    style={{ ...props.style, display: 'inline-block' }}
  />
);

export default SvgIcon; 