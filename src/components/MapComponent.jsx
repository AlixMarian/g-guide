import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Link } from 'react-router-dom';
import '../custom.css';

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
      <nav className="navbar navbar-expand-lg sticky-top bg-body-tertiary">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            <img src="../src/assets/gGuideLogo.svg" alt="Logo" width="40" height="34" className="d-inline-block align-text-top" />
            G!Guide
          </a>
          
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="/">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="/about">About</a>
              </li>
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="/contact">Contact Us</a>
              </li>
            </ul>
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <Link to="/login" className="btn btn-custom-outline">Login</Link>
              <Link to="/signup" className="btn btn-custom-primary">Sign Up</Link>
            </div>
          </div>
        </div>
      </nav>

      <LoadScript googleMapsApiKey="UNYA_NANI_KAY_WALA_PAKO_CREDIT_CARD" libraries={['places']}>
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
