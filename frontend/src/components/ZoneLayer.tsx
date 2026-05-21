import { Source, Layer } from 'react-map-gl/maplibre';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export interface ZoneData {
  zoneId: string;
  name: string;
  nameEn?: string;
  colorHex: string;
  vertices: { lat: number; lng: number }[];
  areaSqm: number;
  active: boolean;
}

interface ZoneLayerProps {
  circleId: string;
  visible?: boolean;
  onZoneClick?: (zone: ZoneData) => void;
}

export function ZoneLayer({ circleId, visible = true }: ZoneLayerProps) {
  const [zones, setZones] = useState<ZoneData[]>([]);

  useEffect(() => {
    if (circleId) loadZones();
  }, [circleId]);

  const loadZones = async () => {
    try {
      const { data } = await api.get(`/zones/circles/${circleId}`);
      setZones(data.zones || []);
    } catch { /* silent */ }
  };

  if (!visible || zones.length === 0) return null;

  const geojson: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: zones.map(zone => ({
      type: 'Feature',
      properties: { name: zone.name, color: zone.colorHex, id: zone.zoneId },
      geometry: {
        type: 'Polygon',
        coordinates: [[...zone.vertices.map(v => [v.lng, v.lat]), [zone.vertices[0].lng, zone.vertices[0].lat]]],
      },
    })),
  };

  return (
    <Source id="zones-source" type="geojson" data={geojson}>
      {/* Flat fill — very transparent */}
      <Layer
        id="zones-fill"
        type="fill"
        paint={{
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.1,
        }}
      />
      {/* Solid border */}
      <Layer
        id="zones-outline"
        type="line"
        paint={{
          'line-color': ['get', 'color'],
          'line-width': 2.5,
          'line-opacity': 0.9,
          'line-dasharray': [2, 1],
        }}
      />
    </Source>
  );
}
