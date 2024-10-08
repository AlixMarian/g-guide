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
const servicesList = ['Marriages', 'Baptism', 'Burials', 'Confirmation', 'Mass Intentions'];

const containerStyle = {
  width: '100%',
  height: '800px',
};

const MapComponent = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [churches, setChurches] = useState([]); // All churches
  const [filteredChurches, setFilteredChurches] = useState([]); // Filtered churches
  const [churchPhoto, setChurchPhoto] = useState(coverLogo);  // Holds church photo
  const [loading, setLoading] = useState(true);
  const [drawerInfo, setDrawerInfo] = useState({ show: false, title: '', description: '', telephone: '', serviceHours: '' });
  const [map, setMap] = useState(null);
  const [customIcon, setCustomIcon] = useState(null);  // Icon for churches
  const [searchBox, setSearchBox] = useState(null);
  const [showMenu, setShowMenu] = useState(false); 
  const [selectedService, setSelectedService] = useState('');  // Selected service

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
                  latitude: latitude,
                  longitude: longitude
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
  
      if (churchesList.length === 0) {
        console.log("No churches available for the selected service.");
      } else {
        console.log(`Filtered Churches: ${churchesList}`);
      }
    } catch (error) {
      console.error('Error fetching churches by service:', error);
    }
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
      console.error('Error fetching church data:', error);
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
  
    const photo = church.churchPhoto ? church.churchPhoto : coverLogo;
  
    setDrawerInfo({
      show: true,
      title: church.churchName || 'Church Name Not Available',
      description: church.churchLocation || 'Location not available',  // Correctly setting the location here
      telephone: telephone,
      serviceHours: serviceHours,
    });
  
    setChurchPhoto(photo);  // Set church photo or fallback
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
    const places = searchBox.getPlaces();  // Get the suggested places
    if (places && places.length > 0) {
      const place = places[0];
      const location = place.geometry.location;
      console.log('Selected place:', place);
      console.log('Location:', location.lat(), location.lng());

      // You can now use this location for map centering or other purposes
      map.panTo({ lat: location.lat(), lng: location.lng() });
    }
  };

  const convertTo12HourFormat = (time) => {
    const [hours, minutes] = time.split(':');
    const period = hours >= 12 ? 'PM' : 'AM';
    const adjustedHours = hours % 12 || 12;
    return `${adjustedHours}:${minutes} ${period}`;
  };

  const handleMenu = () => {
    setShowMenu(true);
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
  };

  const handleCancel = () => {
    window.location.reload();
  }


  return (
    <>
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '800px' }}>
          <img src={loadingGif} alt="Loading..." style={{ width: '100px', height: '100px' }} />
        </div>
      )}

      <LoadScript
        googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        libraries={['places']}
        onError={() => console.error('Error loading Google Maps script')}
      >
        <div className="map-search-container">
          <div className="logo-container">
            <img src={logo} alt="Logo" style={{boxShadow: '2px 6px 6px rgba(0, 0, 0, 0.3)', borderRadius: '30px', marginTop: '-0.5rem'}}/>
            <h3 style={{ fontFamily: 'Roboto, sans-serif' }}>G! Guide</h3>
            <i className="fas fa-bars" onClick={handleMenu} ></i>
          </div>
        </div>

        <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition || { lat: 0, lng: 0 }}
        zoom={13}
        onZoomChanged={onZoomChanged}
        onLoad={handleMapLoad}
      >
        {/* Always display the user's current position */}
        {currentPosition && (
          <Marker position={currentPosition} />
        )}

        {/* Display filtered churches if service is selected, otherwise all churches */}
        {(selectedService ? filteredChurches : churches).map((church) => {
          if (church.latitude && church.longitude) {
            return (
              <Marker
                key={church.id}
                position={{
                  lat: parseFloat(church.latitude),
                  lng: parseFloat(church.longitude),
                }}
                icon={customIcon}
                onClick={() => handleMarkerClick(church)}
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
                <span>{drawerInfo.description}</span>  {/* Displaying location here */}
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

      <Offcanvas show={showMenu} onHide={handleCloseMenu} placement="start">
        <Offcanvas.Title>
          <div className="map-search-container">
            <div className="logo-container-center">
              <img src={logo} alt="Logo" style={{width: '60px', height: '60px', justifyContent: 'center', boxShadow: '2px 6px 6px rgba(0, 0, 0, 0.3)', borderRadius: '30px'}} />
              <h3 style={{ fontFamily: 'Roboto, sans-serif' , marginTop: '0.8rem', fontWeight: 'bold'}}>G! Guide</h3>
              <button onClick={handleCloseMenu} className="back-button">
                <i className="bi bi-arrow-return-left"></i>
              </button>
            </div>
          </div>
        </Offcanvas.Title>
        <Offcanvas.Body>
          <div className="center-search">
            <StandaloneSearchBox onLoad={onLoadSearchBox} onPlacesChanged={onPlacesChanged}>
              <div className="input-group">
                <div className="form-outline" style={{ width: '300px' }}>
                  <input 
                    id="search-focus" 
                    type="search" 
                    className="form-control" 
                    placeholder="Find your nearest church..." 
                  />
                </div>
                <button type="button" className="btn btn-primary">
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </StandaloneSearchBox>
          </div>
          <div style={{ marginTop: '10px' }}>
              <select value={selectedService} onChange={handleServiceChange} className="form-select">
                <option value="">Filter by Services</option>
                {servicesList.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
          </div>

          {filteredChurches.length > 0 ? (
          <div style={{ marginTop: '30px' }}>
            <h6 style={{ marginBottom: '20px' }}>Churches offering {selectedService}:</h6>
            <div>
              {filteredChurches.map((church) => (
                <div
                  className="filtered-church-card"
                  key={church.id}
                  onClick={() => handleMarkerClick(church)}
                  style={{ cursor: 'pointer' }}
                >
                  <h6>{church.churchName}</h6>
                  <div className="drawer-icon-text">
                    <i className="bi bi-geo-alt-fill"></i>
                    <span>{church.churchLocation || 'Location not available'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          selectedService && (
            <div>
              <p style={{ marginTop: '10px' }}>No churches found offering {selectedService}.</p>
              <button className="view-church-btn" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          )
        )}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default MapComponent;
