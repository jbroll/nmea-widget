import { useState } from "preact/hooks";
import { Fragment } from "preact/jsx-runtime";

const getSNRColor = (snr: number | null) => {
  if (!snr) return '#9CA3AF'; // gray-400
  if (snr >= 45) return '#22C55E'; // green-500
  if (snr >= 35) return '#06B6D4'; // cyan-500
  if (snr >= 25) return '#3B82F6'; // blue-500
  return '#EC4899'; // pink-500
};

const getConstellationColor = (constellation: string) => {
  switch (constellation) {
    case 'GP': return '#EAB308'; // yellow-500
    case 'GL': return '#EF4444'; // red-500
    case 'GB': return '#3B82F6'; // blue-500
    case 'BD': return '#A855F7'; // purple-500
    default: return '#6B7280'; // gray-500
  }
};

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
      {/* Title positioned absolutely over plot */}
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
          )})}

          {/* Satellites */}
          {data?.satellites?.visible == undefined ? null : data.satellites.visible.map((sat) => {
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
                  fill={isInUse ? getSNRColor(sat.SNRdB) : '#9CA3AF'}
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
          )})}
        </svg>

        {/* Split legends */}
        <div class="absolute bottom-4 left-4 bg-white bg-opacity-0 p-0 rounded shadow-sm text-xs">
          <div class="text-center text-sm" >Signal</div>
          <div class="flex items-center">
            <span style="background-color: #22C55E" class="w-3 h-3 rounded-full mr-1" /> ≥45 dB
          </div>
          <div class="flex items-center">
            <span style="background-color: #06B6D4" class="w-3 h-3 rounded-full mr-1" /> ≥35 dB
          </div>
          <div class="flex items-center">
            <span style="background-color: #3B82F6" class="w-3 h-3 rounded-full mr-1" /> ≥25 dB
          </div>
          <div class="flex items-center">
            <span style="background-color: #EC4899" class="w-3 h-3 rounded-full mr-1" /> &lt;25 dB
          </div>
        </div>

        <div class="absolute bottom-4 right-4 bg-white bg-opacity-0 p-0 rounded shadow-sm text-xs">
          <div class="text-center text-sm" >System</div>
          <div class="flex items-center">
            <span style="background-color: #EAB308" class="w-3 h-3 rounded-full mr-1" /> GPS
          </div>
          <div class="flex items-center">
            <span style="background-color: #EF4444" class="w-3 h-3 rounded-full mr-1" /> GLONASS
          </div>
          <div class="flex items-center">
            <span style="background-color: #3B82F6" class="w-3 h-3 rounded-full mr-1" /> Galileo
          </div>
          <div class="flex items-center">
            <span style="background-color: #A855F7" class="w-3 h-3 rounded-full mr-1" /> BeiDou
          </div>
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