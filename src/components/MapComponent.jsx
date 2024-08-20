import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import '../websiteUser.css';
import NavBar from './NavBar';
import WebsiteUserNavBar from './WebsiteUserNavBar';
import { Offcanvas } from 'react-bootstrap';

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
  const [searchBox, setSearchBox] = useState(null);
  const [drawerInfo, setDrawerInfo] = useState({ show: false, title: '', description: '' });

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsUserLoggedIn(!!user);
    });
    return () => unsubscribe();
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

  const onLoadSearchBox = (ref) => {
    setSearchBox(ref);
  };

  const onPlacesChanged = () => {
    const places = searchBox.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      const location = place.geometry.location;
      setCurrentPosition({ lat: location.lat(), lng: location.lng() });
      map.panTo({ lat: location.lat(), lng: location.lng() });
    }
  };

  const handleMarkerClick = (title, description) => {
    setDrawerInfo({ show: true, title, description });
  };

  const handleCloseDrawer = () => {
    setDrawerInfo({ show: false, title: '', description: '' });
  };

  return (
    <>
      <LoadScript 
        googleMapsApiKey="AIzaSyD-3ZFvxudJQ_2wPV2lKNIB83lSipz_G6k"
        libraries={['places']}
        onLoad={() => console.log('Google Maps API script loaded')}
        onError={() => console.error('Error loading Google Maps script')}
      >
        {isUserLoggedIn ? <WebsiteUserNavBar /> : <NavBar />}

        <div className="map-search-container">
          <StandaloneSearchBox
            onLoad={onLoadSearchBox}
            onPlacesChanged={onPlacesChanged}
          >
            <input
              type="text"
              placeholder="Search for a place..."
              className="map-search-input"
              style={{ width: '20%', padding: '10px', margin: '20px' }}
            />
          </StandaloneSearchBox>
        </div>

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
              onClick={() => handleMarkerClick('Your Location', 'This is your current location.')}
            />
          )}

          {customIcon && (
            <>
              <Marker position={usjrParish} icon={customIcon} onClick={() => handleMarkerClick('USJR Parish', 'Details about USJR Parish Main.')}/>
              <Marker position={stoNino} icon={customIcon} onClick={() => handleMarkerClick('Sto. Niño', 'Details about Sto. Niño.')}/>
              <Marker position={holyCross} icon={customIcon} onClick={() => handleMarkerClick('Holy Cross', 'Details about Holy Cross Basak.')}/>
              <Marker position={perpetualHelp} icon={customIcon} onClick={() => handleMarkerClick('Perpetual Help', 'Details about Perpetual Help Camputhaw.')}/>
              <Marker position={sanCarlos} icon={customIcon} onClick={() => handleMarkerClick('San Carlos', 'Details about San Carlos Main.')}/>
            </>
          )}
        </GoogleMap>
      </LoadScript>

      {/* Drawer for displaying marker details */}
      <Offcanvas show={drawerInfo.show} onHide={handleCloseDrawer} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{drawerInfo.title}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {drawerInfo.description}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default MapComponent;
