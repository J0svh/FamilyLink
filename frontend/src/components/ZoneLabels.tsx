import { Source, Layer } from 'react-map-gl/maplibre';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface ZoneLabelData {
  name: string;
  center: [number, number]; // [lng, lat]
}

interface ZoneLabelsProps {
  circleId: string;
}

export function ZoneLabels({ circleId }: ZoneLabelsProps) {
  const [labels, setLabels] = useState<ZoneLabelData[]>([]);

  useEffect(() => {
    if (circleId) loadZones();
  }, [circleId]);

  const loadZones = async () => {
    try {
      const { data } = await api.get(`/zones/circles/${circleId}`);
      const zones = data.zones || [];
      setLabels(zones.map((z: any) => ({
        name: z.name,
        center: getPolygonCenter(z.vertices),
      })));
    } catch { /* silent */ }
  };

  const getPolygonCenter = (vertices: { lat: number; lng: number }[]): [number, number] => {
    const n = vertices.length;
    const sumLat = vertices.reduce((s, v) => s + v.lat, 0);
    const sumLng = vertices.reduce((s, v) => s + v.lng, 0);
    return [sumLng / n, sumLat / n];
  };

  if (labels.length === 0) return null;

  const geojson: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: labels.map(l => ({
      type: 'Feature',
      properties: { name: l.name },
      geometry: { type: 'Point', coordinates: l.center },
    })),
  };

  return (
    <Source id="zone-labels-source" type="geojson" data={geojson}>
      <Layer
        id="zone-labels"
        type="symbol"
        minzoom={13}
        layout={{
          'text-field': ['get', 'name'],
          'text-size': 12,
          'text-font': ['Open Sans Bold'],
          'text-anchor': 'center',
          'text-allow-overlap': false,
        }}
        paint={{
          'text-color': '#FFFFFF',
          'text-halo-color': 'rgba(0,0,0,0.7)',
          'text-halo-width': 1.5,
          'text-opacity': 0.85,
        }}
      />
    </Source>
  );
}
