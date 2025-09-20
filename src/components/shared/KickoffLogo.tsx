import * as React from "react";
import { SVGProps } from "react";

interface KickoffLogoProps extends SVGProps<SVGSVGElement> {
  variant?: 'primary' | 'light' | 'dark';
}

export const KickoffLogo: React.FC<KickoffLogoProps> = ({
  variant = 'primary',
  ...props
}) => {
  // Color variants for different contexts
  const getColors = () => {
    switch (variant) {
      case 'light':
        return {
          field: '#00DC82', // pitch-green
          lines: '#ffffff'
        };
      case 'dark':
        return {
          field: '#00DC82', // pitch-green
          lines: '#1a1a1a'
        };
      case 'primary':
      default:
        return {
          field: '#00DC82', // pitch-green
          lines: '#ffffff'
        };
    }
  };

  const colors = getColors();

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" {...props}>
      <title>Kickoff - Soccer Field</title>
      <g>
        {/* Football Field Background */}
        <path
          fill={colors.field}
          d="M27,27H5a3,3,0,0,1-3-3V8A3,3,0,0,1,5,5H27a3,3,0,0,1,3,3V24A3,3,0,0,1,27,27Z"
        />
        {/* Center Line and Circle */}
        <path
          fill={colors.lines}
          d="M17,11.1V5H15v6.1a5,5,0,0,0,0,9.8V27h2V20.9a5,5,0,0,0,0-9.8ZM16,19a3,3,0,1,1,3-3A3,3,0,0,1,16,19Z"
        />
        {/* Right Goal Area */}
        <path
          fill={colors.lines}
          d="M30,13V11H26a2,2,0,0,0-2,2v6a2,2,0,0,0,2,2h4V19H26V13Z"
        />
        {/* Left Goal Area */}
        <path
          fill={colors.lines}
          d="M6,11H2v2H6v6H2v2H6a2,2,0,0,0,2-2V13A2,2,0,0,0,6,11Z"
        />
      </g>
    </svg>
  );
};

export default KickoffLogo;