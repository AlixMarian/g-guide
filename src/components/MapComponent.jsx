import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import { query, where, collection, getDocs } from 'firebase/firestore';
import { db } from '/backend/firebase';
import { Offcanvas } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import loadingGif from '../assets/Ripple@1x-1.0s-200px-200px.gif';
import coverLogo from '../assets/logo cover.png';
import logo from '../assets/G-Guide LOGO.png';

const libraries = ['places'];  // Declare libraries as a static array outside the component

const containerStyle = {
  width: '100%',
  height: '800px',
};

const MapComponent = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [churches, setChurches] = useState([]);
  const [churchPhoto, setChurchPhoto] = useState(coverLogo);  // Holds church photo
  const [loading, setLoading] = useState(true);
  const [drawerInfo, setDrawerInfo] = useState({ show: false, title: '', description: '', telephone: '', serviceHours: '' });
  const [map, setMap] = useState(null);
  const [customIcon, setCustomIcon] = useState(null);  // Icon for churches
  const [searchBox, setSearchBox] = useState(null);

  useEffect(() => {
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

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error);
    } else {
      console.error('Geolocation is not supported by your browser');
    }
  }, []);

  // Fetch church data and photos
  const fetchChurchData = async () => {
    try {
      const churchLocationCollection = collection(db, 'churchLocation');
      const churchLocationSnapshot = await getDocs(churchLocationCollection);
      const churchLocationList = churchLocationSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const churchCollection = collection(db, 'church');
      const churchSnapshot = await getDocs(churchCollection);
      const churchList = churchSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const churchPhotosCollection = collection(db, 'churchPhotos');
      const churchPhotosSnapshot = await getDocs(churchPhotosCollection);
      const churchPhotosList = churchPhotosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const combinedChurchData = churchLocationList.map(location => {
        const matchedChurch = churchList.find(church => church.churchName === location.churchName);
        const matchedPhoto = churchPhotosList.find(photo => photo.uploader === (matchedChurch ? matchedChurch.coordinatorID : null));

        return {
          ...location,
          ...(matchedChurch || {}),
          churchPhoto: matchedPhoto ? matchedPhoto.photoLink : coverLogo,  // Add photoLink or default photo
        };
      });

      setChurches(combinedChurchData);
    } catch (error) {
      console.error('Error fetching church data: ', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChurchData();
  }, []);

  const handleMapLoad = (mapInstance) => {
    setMap(mapInstance);
    if (window.google) {
      setCustomIcon({
        url: 'src/assets/location.png',
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 40),
      });
    }
    setLoading(false);
  };

  const handleMarkerClick = (church) => {
    const telephone = church.churchContactNum ? church.churchContactNum : 'No data added yet.';
    const serviceHours = (!church.churchStartTime || !church.churchEndTime || 
        church.churchStartTime === "none" || church.churchEndTime === "none")
      ? 'No data added yet.' 
      : `${convertTo12HourFormat(church.churchStartTime)} - ${convertTo12HourFormat(church.churchEndTime)}`;

    setChurchPhoto(church.churchPhoto);  // Set the fetched photo for the clicked church

    setDrawerInfo({
      show: true,
      title: church.churchName,
      description: church.churchLocation,
      telephone,
      serviceHours,
    });
  };

  const handleCloseDrawer = () => {
    setDrawerInfo({ show: false, title: '', description: '', telephone: '', serviceHours: '' });
  };

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

  const convertTo12HourFormat = (time) => {
    const [hours, minutes] = time.split(':');
    const period = hours >= 12 ? 'PM' : 'AM';
    const adjustedHours = hours % 12 || 12;
    return `${adjustedHours}:${minutes} ${period}`;
  };

  return (
    <>
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '800px' }}>
          <img src={loadingGif} alt="Loading..." style={{ width: '100px', height: '100px' }} />
        </div>
      )}

    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
      onError={() => console.error('Error loading Google Maps script')}
    >
      <div className="map-search-container">
        <div className="logo-container">
          <img src={logo} alt="Logo" />
          <h3 style={{ fontFamily: 'Roboto, sans-serif' }}>G! Guide</h3>
          <i className="fas fa-bars"></i>
        </div>

        <StandaloneSearchBox
          onLoad={onLoadSearchBox}
          onPlacesChanged={onPlacesChanged}
        >
          <input
            type="text"
            placeholder="Search for a place..."
            className="map-search-input"
          />
        </StandaloneSearchBox>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition || { lat: 0, lng: 0 }}
        zoom={13}
        onZoomChanged={onZoomChanged}
        onLoad={handleMapLoad}
      >
        {currentPosition && (
          <Marker
            position={currentPosition}
            onClick={() => handleMarkerClick({ churchName: 'Your Location', churchLocation: 'This is your current location.' })}
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
            onClick={() => handleMarkerClick(church)}
          />
        ))}
      </GoogleMap>
    </LoadScript>


      <Offcanvas show={drawerInfo.show} onHide={handleCloseDrawer} placement="end" className="custom-offcanvas">
        <Offcanvas.Header>
          <div className="drawer-img-container">
            <img src={churchPhoto} alt="Church Cover" />
          </div>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column">
          <div className="drawer-body-content">
            <Offcanvas.Title className='drawer-title'>{drawerInfo.title}</Offcanvas.Title>

            <div className="drawer-content">
              <div className="drawer-icon-text">
                <i className="bi bi-geo-alt-fill"></i>
                <span>{drawerInfo.description}</span>
              </div>

              <div className="drawer-icon-text">
                <i className="bi bi-telephone-fill"></i> 
                <span>{drawerInfo.telephone}</span>
              </div>

              <div className="drawer-icon-text">
                <i className="bi bi-clock-fill"></i> 
                <span>{drawerInfo.serviceHours}</span>
              </div>
            </div>
          </div>

          <button className="view-church-btn">
            View Church Information
          </button>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default MapComponent;
