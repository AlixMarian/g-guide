import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import '../websiteUser.css';
import NavBar from './NavBar';
import WebsiteUserNavBar from './WebsiteUserNavBar';

const containerStyle = {
  width: '100%',
  height: '800px'
};

const MapComponent = () => {
  const [currentPosition, setCurrentPosition] = useState({});
  const [searchBox, setSearchBox] = useState(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [map, setMap] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsUserLoggedIn(true);
      } else {
        setIsUserLoggedIn(false);
      }
    });
  }, [navigate]);

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
    

      <LoadScript googleMapsApiKey="UNYA_NANI_KAY_WALA_PAKO_CREDIT_CARD" libraries={['places']}>
        {isUserLoggedIn ? <WebsiteUserNavBar /> : <NavBar />}

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
