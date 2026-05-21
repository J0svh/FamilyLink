import { Source, Layer } from 'react-map-gl/maplibre';

interface HeatmapPoint {
  latitude: number;
  longitude: number;
  weight?: number;
}

interface HeatmapLayerProps {
  points: HeatmapPoint[];
  visible: boolean;
}

export function HeatmapLayer({ points, visible }: HeatmapLayerProps) {
  if (!visible || points.length === 0) return null;

  const geojson: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: points.map(p => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.longitude, p.latitude] },
      properties: { weight: p.weight || 1 },
    })),
  };

  return (
    <Source id="heatmap-source" type="geojson" data={geojson}>
      <Layer
        id="heatmap-layer"
        type="heatmap"
        paint={{
          'heatmap-weight': ['get', 'weight'],
          'heatmap-intensity': 1,
          'heatmap-radius': 30,
          'heatmap-opacity': 0.6,
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0,0,255,0)',
            0.2, 'rgb(0,255,0)',
            0.4, 'rgb(255,255,0)',
            0.6, 'rgb(255,128,0)',
            1, 'rgb(255,0,0)',
          ],
        }}
      />
    </Source>
  );
}
