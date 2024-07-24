import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Link } from 'react-router-dom';
import '../websiteUser.css';

const containerStyle = {
  width: '100%',
  height: '800px'
};

const MapComponent = () => {
  const [currentPosition, setCurrentPosition] = useState({});
  const [searchBox, setSearchBox] = useState(null);
  const [map, setMap] = useState(null);

  const onLoad = (ref) => {
    setSearchBox(ref);
  };

  const onPlacesChanged = () => {
    const places = searchBox.getPlaces();
    if (places.length > 0) {
      const place = places[0];
      const location = place.geometry.location;
      setCurrentPosition({ lat: location.lat(), lng: location.lng() });
      map.panTo({ lat: location.lat(), lng: location.lng() });
    }
  };

  const success = position => {
    const currentPosition = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    setCurrentPosition(currentPosition);
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(success);
  }, []);

  return (
    <>
      <LoadScript googleMapsApiKey="AIzaSyBBf4F2AUko6oCAE5AB4yqxqzzvVrW-h6Q" libraries={['places']}>
        <div className="map-search-container">
          <input
            type="text"
            placeholder="Search for a church..."
            className="map-search-input"
            style={{ width: '20%', padding: '10px', margin: '20px' }}
            ref={(input) => {
              if (input && !searchBox) {
                const searchBox = new window.google.maps.places.SearchBox(input);
                searchBox.addListener('places_changed', onPlacesChanged);
                setSearchBox(searchBox);
              }
            }}
          />
        </div>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={currentPosition}
          zoom={10}
          onLoad={(map) => setMap(map)}
        >
          {currentPosition.lat && (
            <Marker position={currentPosition} />
          )}
        </GoogleMap>
      </LoadScript>
    </>
  );
};

export default MapComponent;
