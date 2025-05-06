import '@/leaflet.css'

import {
  Marker,
  Popup,
  useMapEvents
} from 'react-leaflet';
import { LatLng } from "leaflet";
import { useEffect } from 'react';

interface LocationMarkerProps {
  position: LatLng | null;
  setPosition: (position: LatLng | null) => void;
  onClick?: () => void;
}

function LocationMarker(props: LocationMarkerProps) {
  const { position, setPosition } = props;

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng)
      map.flyTo(e.latlng, map.getZoom())
      if (props.onClick) {
        props.onClick()
      }
    }
  })

  useEffect(() => {
    if (position) {
      setPosition(position)
      map.flyTo(position, map.getZoom())
    }
  }, []);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  )
}

export default LocationMarker;