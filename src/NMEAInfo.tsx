
export const NMEAInfo = ({ data }: { data: ProcessedData }) => {
  if (!data.position) {
    return (
      <div>
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
