import { useState } from "preact/hooks";
import { Fragment } from "preact/jsx-runtime";

// Color configuration object for signal strength
const SIGNAL_COLORS = {
  STRONG: '#059669',    // emerald-600 - Darker green for best contrast
  GOOD: '#0284C7',      // sky-600 - Distinct blue
  MODERATE: '#F59E0B',  // amber-500 - Warm yellow/orange
  WEAK: '#DC2626',      // red-600 - Clear red for weak signals
  UNKNOWN: '#6B7280'    // gray-500 - Neutral gray for unknown
} as const;

const CONSTELLATION_COLORS = {
  GP: '#15803D', // GPS - green-700
  GL: '#B91C1C', // GLONASS - red-700
  GB: '#1D4ED8', // Galileo - blue-700
  BD: '#7C3AED', // BeiDou - violet-600
  DEFAULT: '#374151' // gray-700
} as const;

const getSNRColor = (snr: number | null) => {
  if (!snr) return SIGNAL_COLORS.UNKNOWN;
  if (snr >= 45) return SIGNAL_COLORS.STRONG;
  if (snr >= 35) return SIGNAL_COLORS.GOOD;
  if (snr >= 25) return SIGNAL_COLORS.MODERATE;
  return SIGNAL_COLORS.WEAK;
};

const getConstellationColor = (constellation: string) => {
  return CONSTELLATION_COLORS[constellation as keyof typeof CONSTELLATION_COLORS] 
    || CONSTELLATION_COLORS.DEFAULT;
};

// Signal strength legend configuration
const SIGNAL_LEGEND = [
  { label: '≥45 dB', color: SIGNAL_COLORS.STRONG },
  { label: '≥35 dB', color: SIGNAL_COLORS.GOOD },
  { label: '≥25 dB', color: SIGNAL_COLORS.MODERATE },
  { label: '<25 dB', color: SIGNAL_COLORS.WEAK }
] as const;

// Constellation legend configuration
const CONSTELLATION_LEGEND = [
  { label: 'GPS', color: CONSTELLATION_COLORS.GP },
  { label: 'GLONASS', color: CONSTELLATION_COLORS.GL },
  { label: 'Galileo', color: CONSTELLATION_COLORS.GB },
  { label: 'BeiDou', color: CONSTELLATION_COLORS.BD }
] as const;

export const SatellitePlot = ({ data }: { data: ProcessedData }) => {
  const [hoveredSat, setHoveredSat] = useState<Satellite | null>(null);
  const viewBoxSize = 400;
  const center = viewBoxSize / 2;
  const radius = center - 10;

  const elevationRings = [0, 18, 36, 54, 72, 90];
  const azimuthLines = [0, 45, 90, 135, 180, 225, 270, 315];
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

  const polarToCartesian = (elevation: number, azimuth: number) => {
    if (Number.isNaN(elevation) || Number.isNaN(azimuth)) {
      console.log('NaN coordinates in polar');
    }
    const r = radius * (1 - elevation / 90);
    const theta = (azimuth - 90) * Math.PI / 180;
    return {
      x: center + r * Math.cos(theta),
      y: center + r * Math.sin(theta)
    };
  };

  return (
    <div class="relative bg-white rounded-lg shadow">
      <h3 class="absolute top-4 left-4 text-lg font-semibold z-10">Satellite View</h3>
      
      <div class="p-2">
        <svg
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          class="w-full h-full"
        >
          {/* Elevation rings */}
          {elevationRings.map((elevation) => (
            <circle
              key={elevation}
              cx={center}
              cy={center}
              r={radius * (1 - elevation / 90)}
              fill="none"
              stroke="rgb(209 213 219)"
              stroke-width="1"
            />
          ))}

          {/* Azimuth lines */}
          {azimuthLines.map((azimuth, i) => {
            const xy1 = polarToCartesian(75, azimuth);
            const xy2 = polarToCartesian(10, azimuth);

            return (
              <Fragment key={azimuth}>
                <line
                  x1={xy1.x}
                  y1={xy1.y}
                  x2={xy2.x}
                  y2={xy2.y}
                  stroke="rgb(209 213 219)"
                  stroke-width="1"
                />
                <text
                  {...polarToCartesian(0, azimuth)}
                  text-anchor="middle"
                  dominant-baseline="middle"
                  class="text-sm fill-gray-500"
                >
                  {directions[i]}
                </text>
              </Fragment>
            );
          })}

          {/* Satellites */}
          {data?.satellites?.visible == undefined ? null : data.satellites.visible.map((sat) => {
            if (isNaN(sat.elevationDegrees) || isNaN(sat.azimuthTrue)) {
              return null;
            }

            const pos = polarToCartesian(sat.elevationDegrees, sat.azimuthTrue);
            const isInUse = data.satellites.inUse.includes(sat.prnNumber);

            return (
              <g
                key={sat.prnNumber}
                onMouseEnter={() => setHoveredSat(sat)}
                onMouseLeave={() => setHoveredSat(null)}
                class="cursor-pointer"
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="8"
                  fill={isInUse ? getSNRColor(sat.SNRdB) : SIGNAL_COLORS.UNKNOWN}
                  stroke="white"
                  stroke-width="2"
                />
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="4"
                  fill={getConstellationColor(sat.constellation)}
                />
              </g>
            );
          })}

          {/* Ring labels */}
          {elevationRings.map((elevation) => {
            const xy = polarToCartesian(elevation, 26);
            return (
              <text
                key={`label-${elevation}`}
                x={xy.x + 5}
                y={xy.y}
                class="text-xs fill-gray-400"
              >
                {elevation}°
              </text>
            );
          })}
        </svg>

        {/* Signal strength legend */}
        <div class="absolute bottom-4 left-4 bg-white bg-opacity-0 p-0 rounded shadow-sm text-xs">
          <div class="text-center text-sm">Signal</div>
          {SIGNAL_LEGEND.map(({ label, color }) => (
            <div key={label} class="flex items-center">
              <span style={`background-color: ${color}`} class="w-3 h-3 rounded-full mr-1" />
              {label}
            </div>
          ))}
        </div>

        {/* Constellation legend */}
        <div class="absolute bottom-4 right-4 bg-white bg-opacity-0 p-0 rounded shadow-sm text-xs">
          <div class="text-center text-sm">System</div>
          {CONSTELLATION_LEGEND.map(({ label, color }) => (
            <div key={label} class="flex items-center">
              <span style={`background-color: ${color}`} class="w-3 h-3 rounded-full mr-1" />
              {label}
            </div>
          ))}
        </div>

        {/* Hover tooltip */}
        {hoveredSat && (
          <div class="absolute top-0 right-2 bg-white p-0 bg-opacity-0 rounded shadow-sm">
            <div class="text-xs">
              <div>PRN: {hoveredSat.prnNumber}</div>
              <div>System: {hoveredSat.constellation}</div>
              <div>Elevation: {hoveredSat.elevationDegrees.toFixed(1)}°</div>
              <div>Azimuth: {hoveredSat.azimuthTrue.toFixed(1)}°</div>
              <div>SNR: {hoveredSat.SNRdB?.toFixed(1) || 'N/A'} dB</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};