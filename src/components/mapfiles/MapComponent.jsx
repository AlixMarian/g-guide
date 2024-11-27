import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, useLoadScript } from '@react-google-maps/api';
import { query, where, collection, getDocs } from 'firebase/firestore';
import { db } from '/backend/firebase';
import { Offcanvas } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import loadingGif from '/src/assets/Ripple@1x-1.0s-200px-200px.gif';
import coverLogo from '/src/assets/logo cover.png';
import logo from '/src/assets/G-Guide LOGO.png';
import AutocompleteSearch from './AutocompleteSearch';
import SearchFilter from './SearchFilter';
import { Link } from 'react-router-dom';
import { fetchChurchData, handleMapLoad, handleMarkerClick, onZoomChanged } from '/src/components/mapfiles/churchDataUtils';

// import VisitaIglesia from './VisitaIglesia';

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

  const fetchChurchesByService = async (selectedService) => {
    try {
      console.log(`Selected Service: ${selectedService}`);
  
      // Step 1: Query the services collection where activeSchedules contains the selected service
      const servicesQuery = query(
        collection(db, 'services'),
        where('activeSchedules', 'array-contains', selectedService)
      );
      const servicesSnapshot = await getDocs(servicesQuery);
  
      if (servicesSnapshot.empty) {
        console.log("No services found for the selected service.");
        return;
      }
  
      console.log(`Services Found: ${servicesSnapshot.docs.length}`);
  
      const userIds = servicesSnapshot.docs.map(serviceDoc => serviceDoc.id);
      console.log(`Collected userIds from services: ${userIds}`);
  
      const churchesList = [];
  
      // Step 2: Query the coordinator collection to find documents where userId matches
      for (const userId of userIds) {
        const coordinatorQuery = query(
          collection(db, 'coordinator'),
          where('userId', '==', userId)
        );
        const coordinatorSnapshot = await getDocs(coordinatorQuery);
  
        if (!coordinatorSnapshot.empty) {
          console.log(`Coordinator found for userId: ${userId}`);
          const coordinatorID = coordinatorSnapshot.docs[0].id; // Use the document ID as coordinatorID
  
          // Step 3: Query the church collection using the coordinatorID to get the churchName
          const churchQuery = query(
            collection(db, 'church'),
            where('coordinatorID', '==', coordinatorID)
          );
          const churchSnapshot = await getDocs(churchQuery);
  
          if (!churchSnapshot.empty) {
            for (const churchDoc of churchSnapshot.docs) {
              const churchData = churchDoc.data();
              const churchName = churchData.churchName;
  
              // Step 4: Fetch churchLocation data from the churchLocation collection
              const churchLocationQuery = query(
                collection(db, 'churchLocation'),
                where('churchName', '==', churchName) // Assuming churchName is consistent in both collections
              );
  
              const churchLocationSnapshot = await getDocs(churchLocationQuery);
  
              if (!churchLocationSnapshot.empty) {
                const churchLocationDoc = churchLocationSnapshot.docs[0];
                const churchLocationData = churchLocationDoc.data();
                const churchLocation = churchLocationData.churchLocation; // Fetch churchLocation field
                const latitude = churchLocationData.latitude;
                const longitude = churchLocationData.longitude;
  
                console.log(`Church Name Found: ${churchName}`);
                console.log(`Church Location: ${churchLocation}`);

                if (latitude && longitude) { 
                  churchesList.push({
                      id: churchDoc.id,
                      churchName: churchName,
                      churchLocation: churchLocation || "Location not available", 
                      latitude: parseFloat(latitude),
                      longitude: parseFloat(longitude)
                  });
                } else {
                  console.warn(`Missing latitude/longitude for church: ${churchName}`);
                }
                // Add the church with its location to the churchesList
                
              } else {
                // If no location is found, still add the church with a "Location not available" message
                console.log(`No location found for churchName: ${churchName}`);
                churchesList.push({
                  id: churchDoc.id,
                  churchName: churchName,
                  churchLocation: "Location not available",
                });
              }
            }
          } else {
            console.log(`No church found for coordinatorID: ${coordinatorID}`);
          }
        } else {
          console.log(`No coordinator found for userId: ${userId}`);
        }
      }
  
      // Step 5: Set the filtered churches to be displayed
      setFilteredChurches(churchesList);
      setChurches(churchesList);
      sortAndSetTopChurches(churchesList);

  
      if (churchesList.length === 0) {
        console.log("No churches available for the selected service.");
      } else {
        console.log(`Filtered Churches: ${churchesList}`);
      }
    } catch (error) {
      console.error('Error fetching churches by service:', error);
    }
  };

  const sortAndSetTopChurches = (churchesList) => {
    if (currentPosition && window.google) {
        const { lat, lng } = currentPosition;
        const currentLatLng = new window.google.maps.LatLng(lat, lng);

        const sortedChurches = churchesList.map((church) => {
            // Ensure latitude and longitude are numbers
            const latitude = parseFloat(church.latitude);
            const longitude = parseFloat(church.longitude);

            // Check if lat/long values are valid numbers
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
                    distance: Infinity, // Set distance to a high value if lat/long are invalid
                };
            }
        });

        // Sort the churches by distance in ascending order
        sortedChurches.sort((a, b) => a.distance - b.distance);

        console.log("Sorted Churches:", sortedChurches);

        // Set the top 5 nearest churches
        setFilteredChurches(sortedChurches.slice(0, 10));
    }
};

  const handleMenuOpen = () => {
    setShowMenu(true);
    sortAndSetTopChurches(churches);
  };

  useEffect(() => {
    if (selectedService) {
      setLoading(true);
      fetchChurchesByService(selectedService);
    }
  }, [selectedService]);

  const handleServiceChange = (e) => {
    setSelectedService(e.target.value);
  };

  const handlePlaceSelected = (location) => {
    if (map) {
      map.panTo(location);
      map.setZoom(15);
    } else {
      console.error('Map is not loaded yet!');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await fetchChurchData();
      setChurches(data);
      setLoading(false);
    };
  
    fetchData();
  }, []);

  
  const handleCloseDrawer = () => {
    setDrawerInfo({ show: false, title: '', description: '', telephone: '', serviceHours: '' });
  };

  // const onZoomChanged = () => {
  //   if (map) {
  //     const zoom = map.getZoom();
  //     const newSize = zoom > 15 ? 40 : zoom > 12 ? 30 : 20;
  //     setCustomIcon((prevIcon) => ({
  //       ...prevIcon,
  //       scaledSize: new window.google.maps.Size(newSize, newSize),
  //     }));
  //   }
  // };

  
  

  const handleCloseMenu = () => {
    setShowMenu(false);
  };

  const handleCancel = () => {
    window.location.reload();
  }

  return (
    <>
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={libraries}>
        <div className="map-search-container">
          <div className="logo-container">
            <img src={logo} alt="Logo" style={{boxShadow: '2px 6px 6px rgba(0, 0, 0, 0.3)', borderRadius: '30px', marginTop: '-0.5rem'}}/>
            <h3 style={{ fontFamily: 'Roboto, sans-serif' }}>G! Guide</h3>
            <i className="fas fa-bars" onClick={handleMenuOpen}></i>
            <div className='visita-iglesia'>
            {/* <VisitaIglesia fetchChurchData={fetchChurchData} /> */}

              <Link to='/visita-iglesia'> <h5>Visita Iglesia</h5> </Link>
            </div>
          </div>
        </div>

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={currentPosition || { lat: 0, lng: 0 }}
          zoom={15}
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
                  onClick={() => handleMarkerClick(church, setDrawerInfo, setChurchPhoto)}
                />
              );
            }
            return null;
          })}
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
      />
    </>
  );
};

export default MapComponent;
