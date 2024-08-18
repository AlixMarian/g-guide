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
  const [customIcon, setCustomIcon] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      setIsUserLoggedIn(!!user);
    });
  }, [navigate]);

  const success = (position) => {
    const positionObj = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
    console.log("Geolocation success:", positionObj);
    setCurrentPosition(positionObj);
  };

  const error = (err) => {
    console.error('Unable to retrieve your location:', err);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error);
    } else {
      console.error('Geolocation is not supported by your browser');
    }
  }, []);

  useEffect(() => {
    console.log("Current position updated:", currentPosition);
  }, [currentPosition]);

  useEffect(() => {
    if (map && window.google) {
      setCustomIcon({
        url: 'src/assets/location.png',
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 40),
      });
    }
  }, [map]);

  return (
    <>
      <LoadScript 
        googleMapsApiKey="AIzaSyD-3ZFvxudJQ_2wPV2lKNIB83lSipz_G6k"
        libraries={['places']}
        onLoad={() => console.log('Google Maps API script loaded')}
        onError={() => console.error('Error loading Google Maps script')}
      >
        {isUserLoggedIn ? <WebsiteUserNavBar /> : <NavBar />}

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={currentPosition || { lat: 0, lng: 0 }}
          zoom={10}
          onLoad={(map) => {
            console.log('Map loaded');
            setMap(map);
          }}
          onError={() => console.error('Error loading the map')}
        >
          {currentPosition && (
            <Marker
              position={currentPosition}
              onLoad={() => console.log('Current location marker loaded at:', currentPosition)}
            />
          )}

          {customIcon && (
            <>
              <Marker position={usjrParish} icon={customIcon} />
              <Marker position={stoNino} icon={customIcon} />
              <Marker position={holyCross} icon={customIcon} />
              <Marker position={perpetualHelp} icon={customIcon} />
              <Marker position={sanCarlos} icon={customIcon} />
            </>
          )}
        </GoogleMap>
      </LoadScript>
    </>
  );
};

export default MapComponent;
