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
  const [currentPosition, setCurrentPosition] = useState(null);
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
    if (ref && !searchBox) {
      const searchBoxInstance = new window.google.maps.places.SearchBox(ref);
      searchBoxInstance.addListener('places_changed', onPlacesChanged);
      setSearchBox(searchBoxInstance);
    }
  };

  const onPlacesChanged = () => {
    if (searchBox) {
      const places = searchBox.getPlaces();
      if (places.length > 0) {
        const place = places[0];
        const location = place.geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        setCurrentPosition({ lat, lng });
        if (map) {
          map.panTo({ lat, lng });
        }
      }
    }
  };

  const success = position => {
    const currentPosition = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    setCurrentPosition(currentPosition);
  };

  const error = () => {
    console.error('Unable to retrieve your location');
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error);
    } else {
      console.error('Geolocation is not supported by your browser');
    }
  }, []);

  return (
    <>
      <LoadScript 
        googleMapsApiKey="AIzaSyD-3ZFvxudJQ_2wPV2lKNIB83lSipz_G6k"
        libraries={['places']}
        onError={() => console.error('Error loading Google Maps script')}
      >
        {isUserLoggedIn ? <WebsiteUserNavBar /> : <NavBar />}

        <div className="map-search-container">
          <input
            type="text"
            placeholder="Search for a church..."
            className="map-search-input"
            style={{ width: '20%', padding: '10px', margin: '20px' }}
            ref={(input) => {
              if (input) {
                onLoad(input);
              }
            }}
          />
          <button type="button" onClick={onPlacesChanged}>Submit</button>

        </div>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={currentPosition || { lat: 0, lng: 0 }} // Default to (0,0) if no position is set
          zoom={10}
          onLoad={(map) => setMap(map)}
          onError={() => console.error('Error loading the map')}
        >
          {currentPosition && (
            <Marker position={currentPosition} />
          )}
        </GoogleMap>
      </LoadScript>
    </>
  );
};

export default MapComponent;
  