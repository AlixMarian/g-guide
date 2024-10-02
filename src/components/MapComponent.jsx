import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '/backend/firebase'; // Adjust based on your project structure
import '../websiteUser.css';
import NavBar from './NavBar';
import WebsiteUserNavBar from './WebsiteUserNavBar';
import { Offcanvas } from 'react-bootstrap';
import loadingGif from '../assets/Ripple@1x-1.0s-200px-200px.gif'; // Add your loading GIF path here

const containerStyle = {
  width: '100%',
  height: '800px',
};

const MapComponent = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [churches, setChurches] = useState([]);
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [map, setMap] = useState(null);
  const [customIcon, setCustomIcon] = useState(null); // Icon for churches
  const [searchBox, setSearchBox] = useState(null);
  const [drawerInfo, setDrawerInfo] = useState({ show: false, title: '', description: '' });
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsUserLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch current location
  const success = (position) => {
    const positionObj = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
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

  // Fetch churches data from Firestore
  useEffect(() => {
    const fetchChurches = async () => {
      const churchCollection = collection(db, 'churchLocation');
      const churchSnapshot = await getDocs(churchCollection);
      const churchList = churchSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChurches(churchList);
      setLoading(false); // Stop loading when data is fetched
    };

    fetchChurches();
  }, []);

  // Initialize custom icon on map load
  const handleMapLoad = (mapInstance) => {
    setMap(mapInstance);
    if (window.google) {
      setCustomIcon({
        url: 'src/assets/location.png', // Ensure this points to your custom icon for churches
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 40),
      });
    }
    setLoading(false); // Stop loading when map loads
  };

  // Handle marker click for displaying details
  const handleMarkerClick = (title, description) => {
    setDrawerInfo({ show: true, title, description });
  };

  const handleCloseDrawer = () => {
    setDrawerInfo({ show: false, title: '', description: '' });
  };

  // Adjust marker size based on zoom level
  const onZoomChanged = () => {
    if (map) {
      const zoom = map.getZoom();
      const newSize = zoom > 15 ? 40 : zoom > 12 ? 30 : 20;
      setCustomIcon((prevIcon) => ({
        ...prevIcon,
        scaledSize: new window.google.maps.Size(newSize, newSize),
      }));
    }
  };

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

  return (
    <>
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '800px' }}>
          <img src={loadingGif} alt="Loading..." style={{ width: '100px', height: '100px' }} />
        </div>
      )}
      
      <LoadScript
        googleMapsApiKey={googleMapsApiKey}
        libraries={['places']}
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
          zoom={13}
          onZoomChanged={onZoomChanged}
          onLoad={handleMapLoad} // Initialize map and custom icon on load
        >
          {currentPosition && (
            <Marker
              position={currentPosition}
              onClick={() => handleMarkerClick('Your Location', 'This is your current location.')}
            />
          )}

          {churches.map((church) => (
            <Marker
              key={church.id}
              position={{
                lat: parseFloat(church.latitude), 
                lng: parseFloat(church.longitude), 
              }}
              icon={customIcon} 
              onClick={() => handleMarkerClick(church.churchName, church.churchLocation)}
            />
          ))}
        </GoogleMap>
      </LoadScript>

      <Offcanvas show={drawerInfo.show} onHide={handleCloseDrawer} placement="end" className="custom-offcanvas">
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
