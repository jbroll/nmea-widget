import { h, Fragment } from 'preact';
import { useState } from 'preact/hooks';

// Types
interface Satellite {
  prnNumber: number;
  elevationDegrees: number;
  azimuthTrue: number;
  SNRdB: number;
  constellation: string;
}

interface ProcessedData {
  position: {
    latitude: number;
    longitude: number;
    altitudeMeters: number;
    quality: number;
    satellites: number;
  } | null;
  errorStats: {
    latitudeError: number;
    longitudeError: number;
    altitudeError: number;
  } | null;
  satellites: {
    visible: Satellite[];
    inUse: number[];
  };
}

// Utility functions
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

const VitalInfo = ({ data }: { data: ProcessedData }) => {
  if (!data.position) {
    return (
      <div variant="destructive">
        <div>No Position Fix Available</div>
      </div>
    );
  }

  const accuracy = data.errorStats ? 
    Math.sqrt(Math.pow(data.errorStats.latitudeError, 2) + Math.pow(data.errorStats.longitudeError, 2)) : 
    null;

  return (
    <div class="p-4 bg-white rounded-lg shadow">
      <h3 class="text-lg font-semibold mb-4">Position Information</h3>
      <div class="space-y-2 font-mono">
        <div>
          <div class="text-sm text-gray-500">Latitude</div>
          <div>{data.position.latitude.toFixed(6)}°</div>
        </div>
        <div>
          <div class="text-sm text-gray-500">Longitude</div>
          <div>{data.position.longitude.toFixed(6)}°</div>
        </div>
        <div>
          <div class="text-sm text-gray-500">Altitude</div>
          <div>{data.position.altitudeMeters.toFixed(1)} m</div>
        </div>
        {accuracy && (
          <div>
            <div class="text-sm text-gray-500">Position RMS</div>
            <div>{accuracy.toFixed(2)} m</div>
          </div>
        )}
        <div>
          <div class="text-sm text-gray-500">Fix Quality</div>
          <div>{data.position.quality}</div>
        </div>
        <div>
          <div class="text-sm text-gray-500">Satellites Used</div>
          <div>{data.position.satellites}</div>
        </div>
      </div>
    </div>
  );
};

const SatellitePolarPlot = ({ data }: { data: ProcessedData }) => {
  const [hoveredSat, setHoveredSat] = useState<Satellite | null>(null);
  const viewBoxSize = 400;
  const center = viewBoxSize / 2;
  const radius = center - 40;

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
    <div class="relative bg-white rounded-lg shadow p-4">
      <h3 class="text-lg font-semibold mb-4">Satellite View</h3>
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
        {azimuthLines.map((azimuth, i) => (
          <Fragment key={azimuth}>
            <line
              x1={center}
              y1={center}
              {...polarToCartesian(0, azimuth)}
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
        ))}

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
        {elevationRings.map((elevation) => (
          <text
            key={`label-${elevation}`}
            x={center + 5}
            y={center - radius * (1 - elevation / 90)}
            class="text-xs fill-gray-400"
          >
            {elevation}°
          </text>
        ))}
      </svg>

      {/* Legend */}
      <div class="absolute bottom-4 right-4 bg-white bg-opacity-90 p-2 rounded shadow-sm text-sm">
        <div class="grid grid-cols-2 gap-2">
          <div>SNR:</div>
          <div>Constellation:</div>
          <div class="flex items-center">
            <span style="background-color: #22C55E" class="w-3 h-3 rounded-full mr-1" /> ≥45
          </div>
          <div class="flex items-center">
            <span style="background-color: #EAB308" class="w-3 h-3 rounded-full mr-1" /> GPS
          </div>
          <div class="flex items-center">
            <span style="background-color: #06B6D4" class="w-3 h-3 rounded-full mr-1" /> ≥35
          </div>
          <div class="flex items-center">
            <span style="background-color: #EF4444" class="w-3 h-3 rounded-full mr-1" /> GLONASS
          </div>
          <div class="flex items-center">
            <span style="background-color: #3B82F6" class="w-3 h-3 rounded-full mr-1" /> ≥25
          </div>
          <div class="flex items-center">
            <span style="background-color: #3B82F6" class="w-3 h-3 rounded-full mr-1" /> Galileo
          </div>
          <div class="flex items-center">
            <span style="background-color: #EC4899" class="w-3 h-3 rounded-full mr-1" /> &lt;25
          </div>
          <div class="flex items-center">
            <span style="background-color: #A855F7" class="w-3 h-3 rounded-full mr-1" /> BeiDou
          </div>
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredSat && (
        <div class="absolute top-4 left-4 bg-white p-2 rounded shadow-sm">
          <div class="text-sm">
            <div>PRN: {hoveredSat.prnNumber}</div>
            <div>Constellation: {hoveredSat.constellation}</div>
            <div>Elevation: {hoveredSat.elevationDegrees.toFixed(1)}°</div>
            <div>Azimuth: {hoveredSat.azimuthTrue.toFixed(1)}°</div>
            <div>SNR: {hoveredSat.SNRdB?.toFixed(1) || 'N/A'} dB</div>
          </div>
        </div>
      )}
    </div>
  );
};

const NMEADetailView = ({ processedData }: { processedData: ProcessedData }) => {
  return (
    <div class="w-full">
      <div class="lg:grid lg:grid-cols-3 lg:gap-4 space-y-4 lg:space-y-0">
        <div class="lg:col-span-1">
          <VitalInfo data={processedData} />
        </div>
        <div class="lg:col-span-2">
          <SatellitePolarPlot data={processedData} />
        </div>
      </div>
    </div>
  );
};

export default NMEADetailView;
