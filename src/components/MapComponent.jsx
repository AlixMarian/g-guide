import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import '../websiteUser.css';
import NavBar from './NavBar';
import WebsiteUserNavBar from './WebsiteUserNavBar';

const containerStyle = {
  width: '100%',
  height: '800px',
};

const customIconUrl = 'src/assets/location.png';

const customIcon = {
  url: customIconUrl,
  scaledSize: new window.google.maps.Size(40, 40), // Adjust the size to match the default marker
  anchor: new window.google.maps.Point(20, 40), // Adjust anchor to match the new size
};

const libraries = ['places'];

const MapComponent = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const usjrParish = { lat: 10.293781179053578, lng: 123.89720337545744 };
  const stoNino = { lat: 10.294269656778269, lng: 123.90209939572426 };
  const holyCross = { lat: 10.288896349759417, lng: 123.86470036121767 };
  const perpetualHelp = { lat: 10.312898584993762, lng: 123.8978071919825 };
  const sanCarlos = { lat: 10.32239875453249, lng: 123.9094321317518 };
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [map, setMap] = useState(null);
  const [searchBox, setSearchBox] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      setIsUserLoggedIn(!!user);
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
        setCurrentPosition({ lat: location.lat(), lng: location.lng() });
        if (map) {
          map.panTo({ lat: location.lat(), lng: location.lng() });
        }
      }
    }
  };

  const success = (position) => {
    setCurrentPosition({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    });
  };

  const error = () => {
    console.error('Unable to retrieve your location');
    alert('Location access was denied. Please enable location permissions in your browser settings and reload the page.');
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
        libraries={libraries}
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
        >
          {currentPosition && <Marker position={currentPosition} />}
          <Marker position={usjrParish} icon={customIcon} />
          <Marker position={stoNino} icon={customIcon} />
          <Marker position={holyCross} icon={customIcon} />
          <Marker position={perpetualHelp} icon={customIcon} />
          <Marker position={sanCarlos} icon={customIcon} />
        </GoogleMap>
      </LoadScript>
    </>
  );
};

export default MapComponent;
