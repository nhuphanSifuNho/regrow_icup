// Map Region Marker Component
interface RegionMarkerProps {
  name: string;
  severity: 'severe' | 'moderate' | 'minor';
  position: { top: string; left: string };
  onClick: () => void;
}

const RegionMarker: React.FC<RegionMarkerProps> = ({ name, severity, position, onClick }) => {
  const severityColors = {
    severe: 'bg-red-500 border-red-600',
    moderate: 'bg-yellow-500 border-yellow-600',
    minor: 'bg-green-500 border-green-600'
  };

  return (
    <div
      className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
      style={{ top: position.top, left: position.left }}
      onClick={onClick}
    >
      <div className={`w-8 h-8 rounded-full ${severityColors[severity]} border-4 border-white shadow-lg hover:scale-110 transition-transform`}>
        <div className="w-full h-full rounded-full animate-ping opacity-75"></div>
      </div>
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-white px-2 py-1 rounded shadow-md text-xs font-semibold">
        {name}
      </div>
    </div>
  );
};

export default RegionMarker
