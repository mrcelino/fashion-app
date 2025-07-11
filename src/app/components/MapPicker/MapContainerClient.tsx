'use client';

import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LatLng {
  lat: number;
  lng: number;
}

interface Props {
  initialLocation: LatLng;
  onSelect: (lat: number, lng: number) => void;
}

const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MapContainerClient({ initialLocation, onSelect }: Props) {
  const [markerPos, setMarkerPos] = useState<LatLng>(initialLocation);

  const handleMapClick = (lat: number, lng: number) => {
    setMarkerPos({ lat, lng });
    onSelect(lat, lng);
  };

  useEffect(() => {
    setMarkerPos(initialLocation);
  }, [initialLocation]);

  return (
    <MapContainer
      center={[initialLocation.lat, initialLocation.lng]}
      zoom={15}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
    >
      <ResetCenter location={initialLocation} />

<TileLayer
  attribution='&copy; OpenStreetMap contributors'
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

/>

      <Marker position={[markerPos.lat, markerPos.lng]} icon={redIcon} />

      <MapClickHandler onClick={handleMapClick} />
    </MapContainer>
  );
}

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function ResetCenter({ location }: { location: LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([location.lat, location.lng], map.getZoom());
  }, [location, map]);
  return null;
}
