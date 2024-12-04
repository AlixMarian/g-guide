//MapComponent.jsx

import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, useLoadScript } from '@react-google-maps/api';
import { query, where, collection, getDocs } from 'firebase/firestore';
// import { db } from '/backend/firebase';
import { Alert} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import coverLogo from '/src/assets/logo cover.png';
import logo from '/src/assets/G-Guide LOGO.png';
import visLogo from '/src/assets/visLogo.png';
import AutocompleteSearch from './AutocompleteSearch';
import SearchFilter from './SearchFilter';
import { useNavigate } from 'react-router-dom';
import { fetchChurchData, handleMapLoad, handleMarkerClick, onZoomChanged, fetchChurchesByLanguage, fetchChurchesByService } from '/src/components/mapfiles/churchDataUtils';

const libraries = ['places', 'geometry']; 
const servicesList = ['Marriages', 'Baptism', 'Burials', 'Confirmation', 'Mass Intentions'];

const containerStyle = {
  width: '100%',
  height: '800px',
};

const MapComponent = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [churches, setChurches] = useState([]); 
  const [filteredChurches, setFilteredChurches] = useState([]);
  const [churchPhoto, setChurchPhoto] = useState(coverLogo);  
  const [loading, setLoading] = useState(true);
  const [drawerInfo, setDrawerInfo] = useState({ show: false, title: '', description: '', telephone: '', serviceHours: '' });
  const [map, setMap] = useState(null);
  const [customIcon, setCustomIcon] = useState(null);  
  const [showMenu, setShowMenu] = useState(false); 
  const [selectedService, setSelectedService] = useState('');  
  const navigate = useNavigate();

  const [selectedLanguage, setSelectedLanguage] = useState(''); 
  const [error, setError] = useState(null);
  const [filteredChurchesByLanguage, setFilteredChurchesByLanguage] = useState([]);


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

  // **Fetch Churches by Language**
  useEffect(() => {
    if (selectedLanguage) {
      setLoading(true);
      const fetchData = async () => {
        try {
          const churches = await fetchChurchesByLanguage(selectedLanguage);
          setChurches(churches);
          setFilteredChurches(churches);
          sortAndSetTopChurches(churches, currentPosition, setFilteredChurches);
        } catch (error) {
          console.error('Error fetching churches by language:', error);
          setError('Failed to fetch churches by language.');
          setChurches([]);
          setFilteredChurches([]);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [selectedLanguage, currentPosition]);

  useEffect(() => {
    if (selectedService) {
      setLoading(true);
      const fetchData = async () => {
        try {
          const churches = await fetchChurchesByService(selectedService);
          setChurches(churches);
          setFilteredChurches(churches);
          sortAndSetTopChurches(churches);
        } catch (error) {
          console.error('Error fetching churches by service:', error);
          setError('Failed to fetch churches by service.');
          setChurches([]);
          setFilteredChurches([]);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [selectedService, currentPosition]);
  

  const handleServiceChange = (e) => {
    setSelectedService(e.target.value);
  };

  const handleLanguageChange = async (e) => {
    const language = e.target.value;
    setSelectedLanguage(language);
    setLoading(true);
  
    try {
      const churches = await fetchChurchesByLanguage(language);
      console.log('Fetched Churches:', churches);
      setFilteredChurchesByLanguage(churches);
    } catch (error) {
      console.error('Error fetching churches by language:', error);
    } finally {
      setLoading(false);
    }
  };
  
   // **Initial Data Fetch**
   useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchChurchData();
        setChurches(data);
        setFilteredChurches(data);
        sortAndSetTopChurches(data, currentPosition, setFilteredChurches);
      } catch (error) {
        console.error('Error fetching initial church data:', error);
        setError('Failed to fetch church data.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [currentPosition]);

  const sortAndSetTopChurches = (churchesList) => {
    if (currentPosition && window.google) {
        const { lat, lng } = currentPosition;
        const currentLatLng = new window.google.maps.LatLng(lat, lng);

        const sortedChurches = churchesList.map((church) => {
            const latitude = parseFloat(church.latitude);
            const longitude = parseFloat(church.longitude);

            if (!isNaN(latitude) && !isNaN(longitude)) {
                const churchLatLng = new window.google.maps.LatLng(latitude, longitude);
                const distance = window.google.maps.geometry.spherical.computeDistanceBetween(churchLatLng, currentLatLng) / 1000; // Convert to km
                return {
                    ...church,
                    distance,
                };
            } else {
                console.warn(`Invalid latitude or longitude for church: ${church.churchName}`);
                return {
                    ...church,
                    distance: Infinity,
                };
            }
        });
        sortedChurches.sort((a, b) => a.distance - b.distance);
        console.log("Sorted Churches:", sortedChurches);
        setFilteredChurches(sortedChurches.slice(0, 10));
    }
};

  const handleMenuOpen = () => {
    setShowMenu(true);
    sortAndSetTopChurches(churches);
  };

  const handlePlaceSelected = (location) => {
    if (map) {
      map.panTo(location);
      map.setZoom(15);
    } else {
      console.error('Map is not loaded yet!');
    }
  };
  
  const handleCloseDrawer = () => {
    setDrawerInfo({ show: false, title: '', description: '', telephone: '', serviceHours: '' });
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
  };

  const handleCancel = () => {
    window.location.reload();
  }

  const uniqueChurches = Array.from(
    new Map(
      (filteredChurches || churches).map((church) => [church.id, church])
    ).values()
  );

  const handleMarkerClick = (church) => {
    setDrawerInfo({
      show: true,
      title: church.churchName || 'Church Name Not Available',
      description: church.churchLocation || 'Location not available',
      telephone: church.telephone || 'No contact information available',
      serviceHours: church.serviceHours || 'No service hours available',
    });
  
    setChurchPhoto(church.churchPhoto || coverLogo);
  };
  

  return (
    <>
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={libraries}>
        <div className="map-search-container">
        <div className="logo-container">
        <img src={logo} alt="Logo" onClick={() => navigate('/home')} style={{boxShadow: '2px 6px 6px rgba(0, 0, 0, 0.3)', borderRadius: '30px', marginTop: '-0.5rem', cursor:'pointer'}}/>
            <h3 style={{ fontFamily: 'Roboto, sans-serif' }}>G! Guide</h3>
            <i className="fas fa-bars" onClick={handleMenuOpen}></i>
            <div className='visita-iglesia'>
            <img src={visLogo} alt="Visita Iglesia" className="visita-iglesia-icon" />
            <h5 onClick={() => navigate('/visita-iglesia')} style={{ fontFamily: 'Roboto, sans-serif' }}>Visita Iglesia</h5>
            </div>
          </div>
        </div>

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={currentPosition || { lat: 0, lng: 0 }}
          zoom={14}
          onZoomChanged={() => onZoomChanged(map, setCustomIcon)}
          onLoad={(mapInstance) => handleMapLoad(mapInstance, setMap, setCustomIcon, setLoading)}
        >

          {currentPosition && <Marker position={currentPosition} />}
          {(selectedService ? filteredChurches : churches).map((church) => {
            const lat = parseFloat(church.latitude);
            const lng = parseFloat(church.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
              return (
                <Marker
                  key={church.id}
                  position={{ lat, lng }}
                  icon={customIcon}
                  onClick={() => {
                    console.log('Clicked on Marker for:', church);
                    handleMarkerClick(church, setDrawerInfo, setChurchPhoto);
                  }}
                  />
              );
            }
            return null;
          })}
          {uniqueChurches.map((church) => {
            const lat = parseFloat(church.latitude);
            const lng = parseFloat(church.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
              return (
                <Marker
                  key={church.id}
                  position={{ lat, lng }}
                  icon={customIcon}
                  onClick={() =>
                    handleMarkerClick(church, setDrawerInfo, setChurchPhoto)
                  }
                />
              );
            }
            return null;
          })}
          
        </GoogleMap>
      </LoadScript>

      <SearchFilter
        showMenu={showMenu}
        handleCloseMenu={handleCloseMenu}
        handlePlaceSelected={handlePlaceSelected}
        selectedService={selectedService}
        handleServiceChange={handleServiceChange}
        servicesList={servicesList}
        loading={loading}
        filteredChurches={filteredChurches}
        handleMarkerClick={handleMarkerClick}
        handleCancel={handleCancel}
        selectedLanguage={selectedLanguage} 
        handleLanguageChange={handleLanguageChange}
        filteredChurchesByLanguage={filteredChurchesByLanguage}
        drawerInfo={drawerInfo}
        setDrawerInfo={setDrawerInfo} 
        churchPhoto={churchPhoto} 
        setChurchPhoto={setChurchPhoto} 
      />

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible style={{ position: 'absolute', top: '10px', right: '10px', zIndex: '1000' }}>
          {error}
        </Alert>
      )}
    </>
  );
};

export default MapComponent;
