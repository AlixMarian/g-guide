// MapComponent.jsx

import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import coverLogo from '/src/assets/logo cover.png'; // Ensure the path is correct
import logo from '/src/assets/G-Guide LOGO.png'; // Ensure the path is correct
import visLogo from '/src/assets/visLogo.png'; // Ensure the path is correct
import churchPartnerLogo from '/src/assets/partnerLogo.png';
// import AutocompleteSearch from './AutocompleteSearch'; // Ensure this component exists
import SearchFilter from './SearchFilter'; // Ensure this component exists
import { useNavigate } from 'react-router-dom';
import { useGoogleMaps } from '/src/context/GoogleMapsContext';

import {
  fetchChurchData,
  handleMapLoad,
  handleMarkerClick as utilHandleMarkerClick,
  onZoomChanged,
  fetchChurchesByLanguage,
  fetchChurchesByService,
  fetchChurchesByLanguageToday,
} from './churchDataUtils'; // Ensure the path is correct

// const libraries = ['places', 'geometry'];
const servicesList = ['Marriages', 'Baptism', 'Burials', 'Confirmation', 'Mass Intentions'];

const containerStyle = {
  width: '100%',
  height: '800px',
};

const MapComponent = () => {
  const { isLoaded } = useGoogleMaps();
  const [currentPosition, setCurrentPosition] = useState(null);
  const [churches, setChurches] = useState([]);
  const [filteredChurches, setFilteredChurches] = useState([]);
  const [churchPhoto, setChurchPhoto] = useState(coverLogo);
  const [loading, setLoading] = useState(true);
  const [drawerInfo, setDrawerInfo] = useState({
    show: false,
    id: '',
    title: '',
    description: '',
    telephone: '',
    churchStartTime: '',
    churchEndTime: '',
    massDate: '',
    massTime: '',
    massType: '',
    presidingPriest: '',
  });
  const [map, setMap] = useState(null);
  const [customIcon, setCustomIcon] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const navigate = useNavigate();

  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [error, setError] = useState(null);
  const [showOtherDatesButton, setShowOtherDatesButton] = useState(false); // Define state
  
  const handleCancel = useCallback(() => {
    setSelectedService('');
    setSelectedLanguage('');
    setChurches([]);
    setFilteredChurches([]);
    setDrawerInfo({
      show: false,
      id: '',
      title: '',
      description: '',
      telephone: '',
      churchStartTime: '',
      churchEndTime: '',
      massDate: '',
      massTime: '',
      massType: '',
      presidingPriest: '',
    });
  }, []);

  useEffect(() => {
    const success = (position) => {
      const positionObj = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setCurrentPosition(positionObj);
    };

    const errorHandler = (err) => {
      console.error('Unable to retrieve your location:', err);
      setError('Unable to retrieve your location.');
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, errorHandler);
    } else {
      console.error('Geolocation is not supported by your browser');
      setError('Geolocation is not supported by your browser.');
    }
  }, []);

  const sortAndSetTopChurches = useCallback((churchesList) => {
    if (currentPosition && window.google) {
      const { lat, lng } = currentPosition;
      const currentLatLng = new window.google.maps.LatLng(lat, lng);

      const sortedChurches = churchesList.map((church) => {
        const latitude = parseFloat(church.latitude);
        const longitude = parseFloat(church.longitude);

        if (!isNaN(latitude) && !isNaN(longitude)) {
          const churchLatLng = new window.google.maps.LatLng(latitude, longitude);
          const distance =
            window.google.maps.geometry.spherical.computeDistanceBetween(churchLatLng, currentLatLng) / 1000;
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
      setFilteredChurches(sortedChurches.splice(0,10));
    } else {
      setFilteredChurches(churchesList);
    }
  }, [currentPosition]);


useEffect(() => {
  const fetchData = async () => {
    if (selectedLanguage) {
      if (selectedService) {
        handleCancel();
      }
      setLoading(true);
      try {
        const churches = await fetchChurchesByLanguageToday(selectedLanguage);
        if (churches.length === 0) {
          // Add a state to track if we should show "Display other dates" button
          setShowOtherDatesButton(true);
          setChurches([]);
          setFilteredChurches([]);
        } else {
          setChurches(churches);
          setShowOtherDatesButton(false);
          sortAndSetTopChurches(churches);
        }
      } catch (error) {
        console.error('Error fetching churches by language:', error);
        setError('Failed to fetch churches by language.');
        setChurches([]);
        setFilteredChurches([]);
      } finally {
        setLoading(false);
      }
    }
  };
  fetchData();
}, [selectedLanguage, selectedService, handleCancel, sortAndSetTopChurches]);

const handleShowAllDates = async () => {
  setLoading(true);
  try {
    const churches = await fetchChurchesByLanguage(selectedLanguage);
    setChurches(churches);
    setShowOtherDatesButton(false);
    sortAndSetTopChurches(churches);
  } catch (error) {
    console.error('Error fetching all churches:', error);
    setError('Failed to fetch all churches.');
  } finally {
    setLoading(false);
  }
};

  // Fetch Churches by Service
  useEffect(() => {
    const fetchData = async () => {
      if (selectedService) {
        if (selectedLanguage) {
          handleCancel();
        }
        setLoading(true);
        try {
          const churches = await fetchChurchesByService(selectedService);
          setChurches(churches);
          sortAndSetTopChurches(churches);
        } catch (error) {
          console.error('Error fetching churches by service:', error);
          setError('Failed to fetch churches by service.');
          setChurches([]);
          setFilteredChurches([]);
        } finally {
          setLoading(false);
        }
      } else {
        setChurches([]);
        setFilteredChurches([]);
      }
    };
    fetchData();
  }, [selectedService, selectedLanguage, handleCancel, sortAndSetTopChurches]);

  const handleServiceChange = (e) => {
    setSelectedService(e.target.value);
  };

  const handleLanguageChange = async (e) => {
    const language = e.target.value;
    if (selectedService) {
      handleCancel();
    }
    setSelectedLanguage(language);
  };

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedLanguage && !selectedService) {
        setLoading(true);
        setError(null);
        try {
          const data = await fetchChurchData();
          setChurches(data);
          sortAndSetTopChurches(data);
        } catch (error) {
          console.error('Error fetching initial church data:', error);
          setError('Failed to fetch church data.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [currentPosition, selectedLanguage, selectedService, sortAndSetTopChurches]);

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

  // const handleCloseDrawer = () => {
  //   setDrawerInfo({
  //     show: false,
  //     id: '',
  //     title: '',
  //     description: '',
  //     telephone: '',
  //     churchStartTime: '',
  //     churchEndTime: '',
  //     massDate: '',
  //     massTime: '',
  //     massType: '',
  //     presidingPriest: '',
  //   });
  // };

  const handleCloseMenu = () => {
    setShowMenu(false);
  };

  const uniqueChurches = Array.from(
    new Map(filteredChurches.map((church) => [church.id, church])).values()
  );

  const handleMarkerClick = (church) => {
    utilHandleMarkerClick(church, setDrawerInfo, setChurchPhoto);
  };

  if (!isLoaded) return null;

  return (
    <>
      {/* <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={libraries}> */}
        <div className="map-search-container">
          <div className="logo-container">
        <img src={logo} alt="Logo" onClick={() => navigate('/home')} style={{boxShadow: '2px 6px 6px rgba(0, 0, 0, 0.3)', borderRadius: '30px', marginTop: '-0.5rem', cursor:'pointer'}}/>
            <h3 style={{ fontFamily: 'Roboto, sans-serif', cursor:'pointer' }} onClick={() => navigate('/home')}>G! Guide</h3>
            <i className="fas fa-bars" onClick={handleMenuOpen}></i>
            <div className='visita-iglesia'>
              <img src={visLogo} alt="Visita Iglesia" className="visita-iglesia-icon" />
              <h5 onClick={() => navigate('/visita-iglesia')} style={{ fontFamily: 'Roboto, sans-serif' }}>Visita Iglesia</h5>
            </div>
            <div className='visita-iglesia'>
              <img src={churchPartnerLogo} alt="Visita Iglesia" className="visita-iglesia-icon" />
              <h5 onClick={() => navigate('/church-options')} className="px-1" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '17.5px' }}>Partnered Church List</h5>
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

          {uniqueChurches.map((church) => {
            const lat = parseFloat(church.latitude);
            const lng = parseFloat(church.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
              return (
                <Marker
                  key={church.id}
                  position={{ lat, lng }}
                  icon={customIcon}
                  onClick={() => handleMarkerClick(church, setDrawerInfo, setChurchPhoto)}

                />
              );
            }
            return null;
          })}
          
          {churches.map((church) => {
            const lat = parseFloat(church.latitude);
            const lng = parseFloat(church.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
              return (
                <Marker
                  key={church.id}
                  position={{ lat, lng }}
                  icon={customIcon}
                  onClick={() => handleMarkerClick(church, setDrawerInfo, setChurchPhoto)}
                />
              );
            }
            return null;
          })}
        </GoogleMap>
        
      <SearchFilter
        showMenu={showMenu}
        handleCloseMenu={handleCloseMenu}
        handlePlaceSelected={handlePlaceSelected}
        selectedService={selectedService}
        handleServiceChange={handleServiceChange}
        servicesList={servicesList}
        loading={loading}
        filteredChurches={filteredChurches}
        handleCancel={handleCancel}
        selectedLanguage={selectedLanguage}
        handleLanguageChange={handleLanguageChange}
        drawerInfo={drawerInfo}
        setDrawerInfo={setDrawerInfo}
        churchPhoto={churchPhoto}
        setChurchPhoto={setChurchPhoto}
        showOtherDatesButton={showOtherDatesButton}
        handleShowAllDates={handleShowAllDates}
      />

      {error && (
        <Alert
          variant="danger"
          onClose={() => setError(null)}
          dismissible
          style={{ position: 'absolute', top: '10px', right: '10px', zIndex: '1000' }}
        >
          {error}
        </Alert>
      )}
    </>
  );
};

export default MapComponent;
