import '../websiteUser.css';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, DirectionsRenderer, Marker } from '@react-google-maps/api';
import { Offcanvas, Button, Form } from 'react-bootstrap';
import { fetchChurchData } from './mapfiles/churchDataUtils';
import loadingGif from '../assets/Ripple@1x-1.0s-200px-200px.gif';
import { handleMarkerClick, handleMapLoad, onZoomChanged } from './mapfiles/churchDataUtils';
import AutocompleteSearch from '@components/mapfiles/AutocompleteSearch';
import AutoGen from './mapfiles/AutoGen';
import coverLogo from '/src/assets/logo cover.png';
 
const containerStyle = {
  width: '100vw', 
  height: '100vh', 
}; 
const libraries = ['places', 'geometry'];
const colors = ["#FF0000", "#00FF00", "#0000FF", "#FF00FF", "#00FFFF", "#FFA500"];

const VisitaIglesia = () => {
  const navigate = useNavigate();
  const [churches, setChurches] = useState([]);
  const [directionsResponse, setDirectionsResponse] = useState([]);
  const [travelMode, setTravelMode] = useState('DRIVING');
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(true);
  // const [usingCurrentLocation, setUsingCurrentLocation] = useState(true);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [startLocation, setStartLocation] = useState(null);
  const [customIcon, setCustomIcon] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showAutoGen, setShowAutoGen] = useState(false);
  const handleToggleOffcanvas = () => setShowOffcanvas(!showOffcanvas);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [endLocation, setEndLocation] = useState(null); 
  const [zoomLevel, setZoomLevel] = useState(13); 
  const [sortedChurches, setSortedChurches] = useState([]);
  const [churchPhoto, setChurchPhoto] = useState(coverLogo);  
  const [markers, setMarkers] = useState([]);


  const [drawerInfo, setDrawerInfo] = useState({
    show: false,
    title: '',
    description: '',
    telephone: '',
    serviceHours: '',
  });

  const [destinations, setDestinations] = useState([
    {
      id: 'dest-0',
      destination: null,
      usingCustomDestination: false,
      inputValue: '',
      selectedChurchId: '',
    },
  ]);

    const handleAutoGeneratedRoute = (origin, churches, endLocation) => {
    if (!window.google) {
      console.error('Google Maps API is not available.');
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();

    // First, compute the initial route between origin and endLocation
    directionsService.route(
      {
        origin: origin,
        destination: endLocation,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (initialResult, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          // Extract the route's polyline points
          const routePolyline = initialResult.routes[0].overview_path;

          // Now, find churches along the route within a specified radius
          let nearbyChurches = [];
          let radiusKm = 1;
          const maxRadiusKm = 10;
          const incrementKm = 1;

          while (nearbyChurches.length < 5 && radiusKm <= maxRadiusKm) {
            nearbyChurches = findChurchesAlongRoute(churches, routePolyline, radiusKm);
            radiusKm += incrementKm;
          }

          const limitedChurches = nearbyChurches.slice(0, 7);

          // Prepare waypoints
          const waypoints = limitedChurches.map((church) => ({
            location: {
              lat: parseFloat(church.latitude),
              lng: parseFloat(church.longitude),
            },
            stopover: true,
          }));

          // Now, compute the route with waypoints
          directionsService.route(
            {
              origin: origin,
              destination: endLocation,
              waypoints: waypoints,
              optimizeWaypoints: true,
              travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
              if (status === window.google.maps.DirectionsStatus.OK) {
                // Map each leg with its respective color
                const routeLegs = result.routes[0].legs;

                const directionsWithColors = routeLegs.map((leg, index) => ({
                  result: {
                    ...result,
                    routes: [{ ...result.routes[0], legs: [leg] }],
                  },
                  color: colors[index % colors.length],
                }));

                setDirectionsResponse(directionsWithColors);

                // The waypoint_order gives the optimized order of the waypoints
                const waypointOrder = result.routes[0].waypoint_order;

                const orderedChurches = waypointOrder.map((index) => limitedChurches[index]);

                // Assign labels to markers dynamically
                const markers = [
                  ...(currentPosition
                    ? [{ position: currentPosition }]  
                    : []),
                  { position: origin },  
                  ...orderedChurches.map((church, idx) => ({
                    label: String.fromCharCode('A'.charCodeAt(0) + idx), 
                    position: {
                      lat: parseFloat(church.latitude),
                      lng: parseFloat(church.longitude),
                    },
                  })),
                  {
                    position: endLocation,
                  },
                ];

                setMarkers(markers);
                setSortedChurches(orderedChurches);
                setStartLocation(origin);
                setEndLocation(endLocation);
                setShowOffcanvas(false); // Close Offcanvas
              } else {
                console.error('Error fetching directions:', status);
              }
            }
          );
        } else {
          console.error('Error fetching initial route:', status);
        }
      }
    );
  };

  // Function to find churches along the route
  const findChurchesAlongRoute = (churches, routePolyline, maxDistanceKm) => {
    return churches.filter((church) => {
      const churchLocation = new window.google.maps.LatLng(
        parseFloat(church.latitude),
        parseFloat(church.longitude)
      );

      // Check if the church is within maxDistanceKm of any point along the route
      const isNearby = routePolyline.some((routePoint) => {
        const distance =
          window.google.maps.geometry.spherical.computeDistanceBetween(routePoint, churchLocation) /
          1000; // Convert to km
        return distance <= maxDistanceKm;
      });

      return isNearby;
    });
  };
  
  
  const destinationRefs = useRef([React.createRef()]);
  const portal = useRef(document.createElement('div'));

  useEffect(() => {
    const offcanvasBody = document.querySelector('.offcanvas-body');
    if (offcanvasBody) {
      offcanvasBody.appendChild(portal.current);
    }
    return () => {
      if (offcanvasBody && portal.current.parentNode === offcanvasBody) {
        offcanvasBody.removeChild(portal.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (window.google && window.google.maps) {
        setMapLoaded(true);
        setLoading(false);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries={libraries}`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log('Google Maps script loaded successfully');
        setMapLoaded(true);
        setLoading(false);
      };

      script.onerror = (error) => {
        console.error('Error loading Google Maps script:', error);
        setLoading(false);
      };

      document.head.appendChild(script);
    };

  loadGoogleMapsScript();
  },
)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await fetchChurchData();
      setChurches(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error('Error getting current position:', error)
      );
    }
  }, []);

  const addDestination = () => {
    const newDestination = {
      id: `dest-${Date.now()}`,
      destination: null,
      usingCustomDestination: false,
      inputValue: '',
      selectedChurchId: '',
    };
    setDestinations([...destinations, newDestination]);
    destinationRefs.current.push(React.createRef());
  };

  const uniqueDestinations = destinations
    .map((d) => d.destination)
    .filter(
      (dest, index, self) =>
        dest &&
        self.findIndex(
          (d) => d.lat === dest.lat && d.lng === dest.lng
        ) === index
    );

    const handleCalculateRoute = async () => {
      if (!startLocation) {
        alert('Please select a start location.');
        return;
      }
    
      if (uniqueDestinations.length === 0) {
        alert('Please select or enter valid destinations.');
        return;
      }
    
      const allLocations = [startLocation, ...uniqueDestinations];
      const newDirections = [];
      const newMarkers = [
        {
          label: 'A',
          position: startLocation
        },
        ...uniqueDestinations.map((dest, index) => ({
          label: String.fromCharCode('B'.charCodeAt(0) + index),
          position: dest
        }))
      ];
    
      try {
        for (let i = 0; i < allLocations.length - 1; i++) {
          const directionsService = new window.google.maps.DirectionsService();
          const routeSegment = await new Promise((resolve, reject) => {
            directionsService.route(
              {
                origin: allLocations[i],
                destination: allLocations[i + 1],
                travelMode: window.google.maps.TravelMode[travelMode],
              },
              (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                  resolve({
                    result,
                    color: colors[i % colors.length],
                  });
                } else {
                  reject(`Error fetching directions for segment ${i + 1}: ${status}`);
                }
              }
            );
          });
    
          newDirections.push(routeSegment);
        }
    
        setDirectionsResponse(newDirections);
        setMarkers(newMarkers);

      } catch (error) {
        console.error(error);
        alert('Failed to calculate route. Please check your inputs.');
      }
    };
    

  const resetRoutes = () => {
    setMapKey((prevKey) => prevKey + 1);
    setDirectionsResponse([]);
    setMarkers([]); // Clear all markers

    setDestinations([
      {
        id: 'dest-0',
        destination: null,
        usingCustomDestination: false,
        inputValue: '',
        selectedChurchId: '',
      },
    ]);
    setStartLocation(null);
    setEndLocation(null);
    setSortedChurches([]);
    // setUsingCurrentLocation(true);
  
    console.log('Routes and destinations reset.');
  };
  
  return loading ? (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <img src={loadingGif} alt="Loading Google Maps..." style={{ width: '100px', justifyContent: 'center' }} />
    </div>
  ) : !mapLoaded ? (
    <div style={{ textAlign: 'center', marginTop: '20vh' }}>
      <p>Unable to load Google Maps. Please check your API key or network connection.</p>
    </div> 
  ) : (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={libraries} onLoad={() => {console.log('Google Maps API loaded'); setMapLoaded(true); setLoading(false); }} onError={(error) => {console.error('Google Maps API loading error:', error); setLoading(false);}}> 
      <Button variant="primary" style={{ zIndex: '999', position: 'absolute', top: '10px', left: '190px' }} onClick={() => setShowOffcanvas(true)} >
        Open Directions
      </Button>
      <Button variant="primary" style={{ zIndex: '999', position: 'absolute', top: '10px', right: '60px' }} onClick={() => navigate('/map')}>
        <i className="bi bi-arrow-return-left"></i>
      </Button> 
      <Offcanvas show={showOffcanvas} style={{ zIndex: '9999' }} onHide={() => setShowOffcanvas(false)} placement="start">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Visita Iglesia</Offcanvas.Title>
        {!showAutoGen && (
          <Button variant="primary" onClick={() => {setShowAutoGen(true); resetRoutes(); }} style={{ marginLeft: 'auto' }}>
            Auto Generate
          </Button>
        )}
      </Offcanvas.Header>
      <Offcanvas.Body>
      {showAutoGen ? (
      <AutoGen onBack={() => setShowAutoGen(false)} resetRoutes={resetRoutes} churches={churches} currentPosition={currentPosition} handleAutoGeneratedRoute={handleAutoGeneratedRoute} />
      ) : ( 
      <Form>
        <Form.Group controlId="start-location" className="mb-3">
        <Form.Label>Select Start Location</Form.Label>
        <Form.Control
          as="select"
          value={startLocation ? JSON.stringify(startLocation) : ''}
          onChange={(e) => setStartLocation(JSON.parse(e.target.value))}
        >
          <option value="">Select Church</option>
          {churches.map((church) => (
            <option
              key={church.id}
              value={JSON.stringify({ lat: parseFloat(church.latitude), lng: parseFloat(church.longitude) })}
            >
              {church.churchName}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
          {destinations.map((dest, index) => (
            <div key={dest.id} className="destination-item d-flex align-items-center mb-3 position-relative">
              <Form.Check type="checkbox" checked={dest.usingCustomDestination} style={{ marginRight: '1rem' }}
                onChange={() => {
                  const newDestinations = [...destinations];
                  newDestinations[index].usingCustomDestination = !newDestinations[index]
                    .usingCustomDestination;
                  newDestinations[index].inputValue = '';
                  newDestinations[index].selectedChurchId = '';
                  newDestinations[index].destination = null;
                  setDestinations(newDestinations);
                }}
              /> 
            {dest.usingCustomDestination ? (
              <AutocompleteSearch
                onPlaceSelected={(location) => {
                  const updatedDestinations = [...destinations];
                  updatedDestinations[index].destination = location;
                  setDestinations(updatedDestinations);
                }}
              />
            ) : (
              <Form.Group controlId={`select-destination-${index}`} style={{ flex: 1 }}>
                <Form.Control as="select" value={dest.selectedChurchId}
                  onChange={(e) => {
                    const selectedChurch = churches.find(
                      (church) => church.id === e.target.value
                    );
                    const updatedDestinations = [...destinations];
                    updatedDestinations[index].selectedChurchId = e.target.value;
                    updatedDestinations[index].destination = selectedChurch
                      ? {
                          lat: parseFloat(selectedChurch.latitude),
                          lng: parseFloat(selectedChurch.longitude),
                        }
                      : null;
                    setDestinations(updatedDestinations);
                  }}
                >
                  <option value="">Select Church</option>
                  {churches.map((church) => (
                    <option key={church.id} value={church.id}>
                      {church.churchName}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            )}
            <Button variant="link" className="delete-div-btn" onClick={() => { setDestinations((prevDestinations) => prevDestinations.filter((_, i) => i !== index)); handleCalculateRoute(); }}>
              <i className="bi bi-x-circle-fill"></i>
            </Button>
          </div>
        ))}
        
        <div className="text-center">
          <Button variant="primary" onClick={addDestination} className="d-flex justify-content-center align-items-center px-3 py-2 rounded mb-5 mt-3 mx-auto w-70" style={{ height: '35px' }}>
            + Add another Church Destination
          </Button>
        </div>
        <div className="d-flex align-items-center">
          <Button onClick={handleCalculateRoute} variant="primary" className="flex-grow-1 me-2 fw-bold]">
            Get Route
          </Button>
          <Button variant="outline-danger" className="px-4" onClick={resetRoutes}>
            Reset
          </Button>
        </div>
      </Form> 
        )}
      </Offcanvas.Body>
    </Offcanvas>
    <div className="google-map-container">
    <GoogleMap
      key={mapKey}
      mapContainerStyle={containerStyle}
      center={currentPosition || { lat: 0, lng: 0 }}
      onZoomChanged={() => onZoomChanged(map, setCustomIcon)}
      zoom={14}
      onLoad={(mapInstance) => handleMapLoad(mapInstance, setMap, setCustomIcon, setLoading)}
    >
      
    {currentPosition && <Marker position={currentPosition} />} 
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

      {/* Render the directions if available */}
      {directionsResponse?.map((segment, index) => (
        <DirectionsRenderer
          key={index}
          options={{
            directions: segment.result,
            polylineOptions: {
              strokeColor: segment.color,
              strokeOpacity: 0.8,
              strokeWeight: 5,
            },
            suppressMarkers: true,
          }}
        />
      ))}

      {/* Render markers for all locations */}
      {/* {markers.map((marker, index) => (
        <Marker
          key={`marker-${index}`}
          position={marker.position}
          label={{
            text: marker.label,
            color: 'black',
            fontWeight: 'bold',
            fontSize: '16px',
          }}
        />
      ))} */}
      {markers.map((marker, index) => (
        <Marker
          key={`marker-${index}`}
          position={marker.position}
          label={{
            text: marker.label,
            color: 'black',
            fontWeight: 'bold',
            fontSize: '16px',
          }}
          icon={
            customIcon 
              ? {
                  url: customIcon,
                  scaledSize: new window.google.maps.Size(30, 30),
                }
              : null
          }
        />
      ))}



  {/* If not using AutoGen, render markers for destinations */}
  {sortedChurches.length === 0 &&
    !loading &&
    uniqueDestinations.map((dest, index) => (
      <Marker
        key={`${dest.lat}-${dest.lng}`}
        position={dest}
        label={{
          text: String.fromCharCode('B'.charCodeAt(0) + index),
          color: 'black',
          fontWeight: 'bold',
          fontSize: '16px',
        }}
        icon={{
          url: customIcon,
          scaledSize: new window.google.maps.Size(30, 30),
        }}
        onClick={() => handleMarkerClick(dest)}
      />
    ))}
    </GoogleMap>


      </div>
    </LoadScript>
  );
};

export default VisitaIglesia;
