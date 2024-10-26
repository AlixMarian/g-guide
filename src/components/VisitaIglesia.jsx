import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer, Autocomplete } from '@react-google-maps/api';
import { useLoadScript } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '600px',
};

const VisitaIglesia = ({ churches }) => {
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [currentPosition, setCurrentPosition] = useState(null);
  const [selectedChurch, setSelectedChurch] = useState(null);
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(false);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  useEffect(() => {
    if (usingCurrentLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error('Error getting location:', error),
        { timeout: 10000 }
      );
    }
  }, [usingCurrentLocation]);

  const handleCalculateRoute = () => {
    if (!endLocation && !selectedChurch) {
      alert('Please select a destination.');
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    const destination = selectedChurch
      ? { lat: selectedChurch.latitude, lng: selectedChurch.longitude }
      : endLocation;

    directionsService.route(
      {
        origin: usingCurrentLocation && currentPosition ? currentPosition : startLocation,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionsResponse(result);
        } else {
          console.error(`Error fetching directions: ${status}`);
        }
      }
    );
  };

  return isLoaded ? (
    <div style={{ padding: '2rem' }}>
      <h3>Visita Iglesia Directions</h3>
      
      <div style={{ display: 'flex', marginBottom: '1rem' }}>
        <div>
          <input
            type="checkbox"
            checked={usingCurrentLocation}
            onChange={() => setUsingCurrentLocation(!usingCurrentLocation)}
          />
          <label> Use Current Location</label>
        </div>

        {!usingCurrentLocation && (
          <Autocomplete>
            <input
              type="text"
              placeholder="Enter Start Location"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              style={{ marginLeft: '1rem', padding: '0.5rem', width: '200px' }}
            />
          </Autocomplete>
        )}

        <select
          onChange={(e) => setSelectedChurch(churches.find(church => church.id === e.target.value))}
          style={{ marginLeft: '1rem', padding: '0.5rem' }}
        >
          <option value="">Select a Church Destination</option>
          {churches.map(church => (
            <option key={church.id} value={church.id}>
              {church.churchName}
            </option>
          ))}
        </select>

        <button onClick={handleCalculateRoute} style={{ marginLeft: '1rem', padding: '0.5rem' }}>
          Get Route
        </button>
      </div>

      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <GoogleMap mapContainerStyle={containerStyle} center={currentPosition || { lat: 10.3157, lng: 123.8854 }} zoom={13}>
          {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
        </GoogleMap>
      </LoadScript>
    </div>
  ) : (
    <div>Loading...</div>
  );
};

export default VisitaIglesia;
