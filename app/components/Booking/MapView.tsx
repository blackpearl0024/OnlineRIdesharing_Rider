import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import FitBoundsToRoute from './FitBoundsToRoute';

const RecenterMap = ({ lat, lon }: { lat: number; lon: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], map.getZoom());
  }, [lat, lon]);
  return null;
};

type TrafficLevel = 'low' | 'medium' | 'high';

function assignTrafficLevel(): TrafficLevel {
  const random = Math.random();
  if (random < 0.4) return 'low'; // Green
  if (random < 0.75) return 'medium'; // Yellow
  return 'high'; // Red
}

// Marker icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function reverseGeocode(lat: number, lon: number, cb: (label: string) => void) {
  fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
    .then((res) => res.json())
    .then((data) => cb(data.display_name || 'Unknown location'))
    .catch(() => cb('Unknown location'));
}

const MapView = ({ fromLocation, toLocation, onFromDrag, onToDrag, onInitFromLocation, driverLocation,rideStarted,setRideStarted,setDistance,setDuration }: any) => {
  const center = fromLocation.lat && fromLocation.lon ? [fromLocation.lat, fromLocation.lon] : [12.9716, 77.5946];
  
  const [route, setRoute] = useState<[number, number][]>([]);
  const [segmentedRoute, setSegmentedRoute] = useState<{ coords: [number, number][]; traffic: TrafficLevel }[]>([]);
  const [segmentedRouteSrctoDst, setSegmentedRouteSrctoDst] = useState<{ coords: [number, number][]; traffic: TrafficLevel }[]>([]);
  const [movingMarkerIndex, setMovingMarkerIndex] = useState<number>(0);
  const [DrivermovingMarkerIndex, setDriverMovingMarkerIndex] = useState<number>(0);
  const [simulatedTimeLeft, setSimulatedTimeLeft] = useState<string>('');
  const [driverRoute, setDriverRoute] = useState<[number, number][]>([]);
  const [driverDistance, setDriverDistance] = useState<string>('');
  const [driverDuration, setDriverDuration] = useState<string>('');
  const [DriverReached, setDriverReached] = useState(false);

useEffect(() => {
   console.log("DriverReached "+DriverReached)
  
   
  }, [DriverReached]);
  const screenhight = window.innerHeight * 0.7;

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          reverseGeocode(latitude, longitude, (name) => {
            onInitFromLocation({ lat: latitude, lon: longitude, name });
          });
        },
        (error) => console.error('Geolocation error:', error)
      );
    }
  }, [onInitFromLocation]);

  useEffect(() => {
    if (fromLocation.lat && toLocation.lat) {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${fromLocation.lon},${fromLocation.lat};${toLocation.lon},${toLocation.lat}?overview=full&geometries=geojson`;

      fetch(osrmUrl)
        .then((res) => res.json())
        .then((data) => {
          if (data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map(([lon, lat]: [number, number]) => [lat, lon]);

            setRoute(coords);

            // Segment and assign traffic
            const segments = [];
            for (let i = 0; i < coords.length - 1; i++) {
              segments.push({
                coords: [coords[i], coords[i + 1]],
                traffic: assignTrafficLevel(),
              });
            }
            setSegmentedRouteSrctoDst(segments);
            setMovingMarkerIndex(0); // Reset marker
             setDistance((data.routes[0].distance / 1000).toFixed(2) + ' km');
            setDuration((data.routes[0].duration / 60).toFixed(2) + ' mins');
          }
        })
        .catch((err) => console.error('Error fetching route:', err));
    }
  }, [fromLocation, toLocation]);

  
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (segmentedRouteSrctoDst.length > 0 && DriverReached) {
      console.log("inside rider src to dst")
      interval = setInterval(() => {
        setMovingMarkerIndex((prev) => {
         console.log("Driver reached inside rider src to dst" + DriverReached)
          if (prev >= segmentedRouteSrctoDst.length - 1) {
            clearInterval(interval);
            setDriverReached(false); // <-- THIS IS WHAT TRIGGERS THE NEXT PHASE
            setRideStarted(false);
            return prev;
          }

          const traffic = segmentedRouteSrctoDst[prev].traffic;
          let delayFactor = 1;
          if (traffic === 'medium') delayFactor = 1.5;
          else if (traffic === 'high') delayFactor = 2;

          const remaining = segmentedRouteSrctoDst.length - prev;
          const estMinutes = (remaining * delayFactor * 0.5).toFixed(1); // Rough estimate
          setSimulatedTimeLeft(`${estMinutes} min`);
          return prev + 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [segmentedRouteSrctoDst, DriverReached]);

  
  useEffect(() => {
    if (driverLocation?.lat && fromLocation?.lat) {
      const osrmDriverUrl = `https://router.project-osrm.org/route/v1/driving/${driverLocation.lon},${driverLocation.lat};${fromLocation.lon},${fromLocation.lat}?overview=full&geometries=geojson`;
console.log("called after driver loc found")
      fetch(osrmDriverUrl)
        .then((res) => res.json())
        .then((data) => {
          if (data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map(([lon, lat]: [number, number]) => [lat, lon]);
            setDriverRoute(coords);
             // Segment and assign traffic
             const segments = [];
             for (let i = 0; i < coords.length - 1; i++) {
               segments.push({
                 coords: [coords[i], coords[i + 1]],
                 traffic: assignTrafficLevel(),
               });
             }
             setSegmentedRoute(segments);
             setDriverMovingMarkerIndex(0); // Reset marker
            setDriverDistance((data.routes[0].distance / 1000).toFixed(2) + ' km');
            setDriverDuration((data.routes[0].duration / 60).toFixed(2) + ' mins');
          }
        })
        .catch((err) => console.error('Error fetching driver route:', err));
    }
  }, [driverLocation, fromLocation]);

  useEffect(() => {
  let interval: NodeJS.Timeout;

  if (segmentedRoute.length > 0 && rideStarted && !DriverReached) {
    console.log("Starting driver movement towards rider");
    interval = setInterval(() => {
      setDriverMovingMarkerIndex((prev) => { // ← Correct setter
        if (prev >= segmentedRoute.length - 1) {
          clearInterval(interval);
          setDriverReached(true);
          return prev;
        }
        // ... ETA calculation
        return prev + 1;
      });
    }, 1000);
  }

  return () => clearInterval(interval);
}, [segmentedRoute, rideStarted, DriverReached]);
  return (
    <MapContainer center={center as [number, number]} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <div className="border-[1px] p-5 rounded-md" style={{ height: screenhight }}></div>

      {/* Markers */}
      {fromLocation.lat && (
        <>
          <RecenterMap lat={fromLocation.lat} lon={fromLocation.lon} />
          <Marker
            position={[fromLocation.lat, fromLocation.lon]}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const latlng = e.target.getLatLng();
                reverseGeocode(latlng.lat, latlng.lng, (name) => {
                  onFromDrag({ lat: latlng.lat, lon: latlng.lng, name });
                });
              },
            }}
          >
            <Popup>📍 Source: {fromLocation.name}</Popup>
          </Marker>
        </>
      )}

      {toLocation.lat && (
        <Marker
          position={[toLocation.lat, toLocation.lon]}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const latlng = e.target.getLatLng();
              reverseGeocode(latlng.lat, latlng.lng, (name) => {
                onToDrag({ lat: latlng.lat, lon: latlng.lng, name });
              });
            },
          }}
        >
          <Popup>📍 Destination: {toLocation.name}</Popup>
        </Marker>
      )}

      {driverLocation?.lat && (
        <Marker position={[driverLocation.lat, driverLocation.lon]}>
          <Popup>🚖 Driver is here</Popup>
        </Marker>
      )}

      {/* Polyline for driver route */}
      {driverRoute.length > 0 && (
        <>
          <FitBoundsToRoute route={driverRoute} />
          <Polyline positions={driverRoute} color="red" weight={4} dashArray="5,10" />
        </>
      )}

      {/* Colored Segmented Route */}
      {segmentedRoute.map((segment, idx) => {
        let color = 'green';
        if (segment.traffic === 'medium') color = 'orange';
        if (segment.traffic === 'high') color = 'red';

        return <Polyline key={idx} positions={segment.coords} color={color} weight={5} />;
      })}

      {/* Moving Marker */}
      {segmentedRoute[DrivermovingMarkerIndex] && (
        <Marker position={segmentedRoute[DrivermovingMarkerIndex].coords[0]}>
          <Popup>🚗 Moving... ETA: {simulatedTimeLeft}</Popup>
        </Marker>
      )}


{/* Colored Segmented Route */}
{segmentedRouteSrctoDst.map((segment, idx) => {
        let color = 'green';
        if (segment.traffic === 'medium') color = 'orange';
        if (segment.traffic === 'high') color = 'red';

        return <Polyline key={idx} positions={segment.coords} color={color} weight={5} />;
      })}

      {/* Moving Marker */}
      {segmentedRouteSrctoDst[movingMarkerIndex] && (
        <Marker position={segmentedRouteSrctoDst[movingMarkerIndex].coords[0]}>
          <Popup>🚗 Moving... ETA: {simulatedTimeLeft}</Popup>
        </Marker>
      )}

      {/* Info Boxes */}
      {driverDistance && driverDuration && (
        <div
          style={{
            position: 'absolute',
            bottom: 90,
            left: 10,
            background: 'rgba(255, 255, 255, 0.8)',
            padding: '10px',
            borderRadius: '5px',
            zIndex: 1000,
          }}
        >
          <p>🚗 Driver → You</p>
          <p>🛣 Distance: {driverDistance}</p>
          <p>⏳ Duration: {driverDuration}</p>
        </div>
      )}

      {simulatedTimeLeft && (
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            background: 'rgba(255, 255, 255, 0.8)',
            padding: '10px',
            borderRadius: '5px',
            zIndex: 1000,
          }}
        >
          <p>🚘 Simulated Movement</p>
          <p>ETA: {simulatedTimeLeft}</p>
        </div>
      )}
    </MapContainer>
  );
};

export default MapView;

