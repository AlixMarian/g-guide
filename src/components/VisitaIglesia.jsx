import '../websiteUser.css';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, DirectionsRenderer, Autocomplete, Marker } from '@react-google-maps/api';
import { Offcanvas, Button, Form } from 'react-bootstrap';
import { fetchChurchData } from '../components/churchDataUtils';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaBars } from 'react-icons/fa'; // Drag Handle Icon
import loadingGif from '../assets/Ripple@1x-1.0s-200px-200px.gif';
import { handleMarkerClick, handleMapLoad, onZoomChanged } from '../components/churchDataUtils';

const containerStyle = {
  width: '100%',
  height: '700px',
};

const colors = ["#FF0000", "#00FF00", "#0000FF", "#FF00FF", "#00FFFF", "#FFA500"];

const VisitaIglesia = () => {
  const navigate = useNavigate();
  const [churches, setChurches] = useState([]);
  const [directionsResponse, setDirectionsResponse] = useState([]);
  const [travelMode, setTravelMode] = useState('DRIVING');
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(true);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [startLocation, setStartLocation] = useState(null);
  const [startLocationInputValue, setStartLocationInputValue] = useState('');
  const [customIcon, setCustomIcon] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [markerInfo, setMarkerInfo] = useState(null);


  const [destinations, setDestinations] = useState([
    {
      id: 'dest-0',
      destination: null,
      usingCustomDestination: false,
      inputValue: '',
      selectedChurchId: '',
    },
  ]);

  const startLocationRef = useRef(null);
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

  const onLoadStartLocation = (autocomplete) => {
    startLocationRef.current = autocomplete;
  };

  const onPlaceChangedStartLocation = () => {
    if (startLocationRef.current) {
      const place = startLocationRef.current.getPlace();
      if (place && place.geometry?.location) {
        setStartLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
        setStartLocationInputValue(place.formatted_address || place.name);
      }
    }
  };

  const onLoadDestination = (index, autocomplete) => {
    destinationRefs.current[index].current = autocomplete;
  };

  const onPlaceChangedDestination = (index) => {
    const ref = destinationRefs.current[index].current;
    if (ref) {
      const place = ref.getPlace();
      if (place && place.geometry?.location) {
        const newDestinations = [...destinations];
        newDestinations[index].destination = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        newDestinations[index].inputValue = place.formatted_address || place.name;
        setDestinations(newDestinations);
      }
    }
  };

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
  .filter((dest, index, self) => {
    // Ensure that the destination is not null and that it's unique in the array.
    return dest && self.findIndex((d) => d && d.lat === dest.lat && d.lng === dest.lng) === index;
  });

  
  const handleCalculateRoute = async () => {
    // Step 1: Ensure we have a valid starting location
    const origin = usingCurrentLocation ? currentPosition : startLocation;
    if (!origin) {
      alert('Please select a start location.');
      return;
    }
  
    if (uniqueDestinations.length === 0) {
      alert('Please select or enter valid destinations.');
      return;
    }
  
    // Step 3: Reset the directions to start routing from scratch
    setDirectionsResponse([]); // Clear all previous route directions
  
    // Step 4: Combine starting point and destinations without duplicates
    const allLocations = [origin, ...uniqueDestinations];
  
    // Step 5: Calculate routes between each segment in sequence
    const newDirections = [];
  
    for (let i = 0; i < allLocations.length - 1; i++) {
      const directionsService = new window.google.maps.DirectionsService();
      const currentOrigin = allLocations[i];
      const currentDestination = allLocations[i + 1];
  
      const routeSegment = await new Promise((resolve, reject) => {
        directionsService.route(
          {
            origin: currentOrigin,
            destination: currentDestination,
            travelMode: window.google.maps.TravelMode[travelMode],
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              resolve({
                result,
                color: colors[i % colors.length], // Assign unique color for each segment
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
  };
  
  

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedDestinations = Array.from(destinations);
    const [reorderedItem] = reorderedDestinations.splice(result.source.index, 1);
    reorderedDestinations.splice(result.destination.index, 0, reorderedItem);

    setDestinations(reorderedDestinations);
  };

  return loading ? (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <img src={loadingGif} alt="Loading..." style={{ width: '100px' }} />
    </div>
  ) : (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={['places', 'geometry']}>
      <Button
        variant="primary"
        style={{ zIndex: '999', position: 'absolute', top: '10px', left: '190px' }}
        onClick={() => setShowOffcanvas(true)}
      >
        Open Directions
      </Button>
      <Button
        variant="primary"
        style={{ zIndex: '999', position: 'absolute', top: '10px', right: '60px' }}
        onClick={() => navigate('/map')}
      >
        <i className="bi bi-arrow-return-left"></i>
      </Button>

      <Offcanvas show={showOffcanvas} style={{ zIndex: '9999' }} onHide={() => setShowOffcanvas(false)} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Visita Iglesia Directions</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form>
            <Form.Group controlId="use-current-location" style={{ marginBottom: '1rem' }}>
              <Form.Check
                type="checkbox"
                label="Use Current Location"
                checked={usingCurrentLocation}
                onChange={() => setUsingCurrentLocation(!usingCurrentLocation)}
              />
            </Form.Group>

            {!usingCurrentLocation && (
              <Autocomplete onLoad={onLoadStartLocation} onPlaceChanged={onPlaceChangedStartLocation}>
                <Form.Group controlId="start-location" style={{ marginBottom: '1rem' }}>
                  <Form.Control
                    type="text"
                    placeholder="Enter Start Location"
                    value={startLocationInputValue}
                    onChange={(e) => setStartLocationInputValue(e.target.value)}
                  />
                </Form.Group>
              </Autocomplete>
            )}

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="destinations">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {destinations.map((dest, index) => (
                    <Draggable key={dest.id} draggableId={dest.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="draggable-destination"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '1rem',
                            position: 'relative',
                          }}
                        >
                          <FaBars {...provided.dragHandleProps} style={{ marginRight: '0.5rem' }} />
                          <Form.Check
                            type="checkbox"
                            checked={dest.usingCustomDestination}
                            onChange={() => {
                              const newDestinations = [...destinations];
                              newDestinations[index].usingCustomDestination = !newDestinations[index].usingCustomDestination;
                              newDestinations[index].inputValue = '';
                              newDestinations[index].selectedChurchId = '';
                              newDestinations[index].destination = null;
                              setDestinations(newDestinations);
                            }}
                            style={{ marginRight: '1rem' }}
                          />
                          {dest.usingCustomDestination ? (
                            <Autocomplete
                              onLoad={(autocomplete) => onLoadDestination(index, autocomplete)}
                              onPlaceChanged={() => onPlaceChangedDestination(index)}
                            >
                              <Form.Group controlId={`custom-destination-${index}`} style={{ flex: 1 }}>
                                <Form.Control
                                  type="text"
                                  placeholder={`Enter Destination ${index + 1}`}
                                  value={dest.inputValue}
                                  onChange={(e) => {
                                    const newDestinations = [...destinations];
                                    newDestinations[index].inputValue = e.target.value;
                                    setDestinations(newDestinations);
                                  }}
                                />
                              </Form.Group>
                            </Autocomplete>
                          ) : (
                            <Form.Group controlId={`select-destination-${index}`} style={{ flex: 1 }}>
                              <Form.Control
                                as="select"
                                value={dest.selectedChurchId}
                                onChange={(e) => {
                                  const selectedChurch = churches.find((church) => church.id === e.target.value);
                                  const newDestinations = [...destinations];
                                  newDestinations[index].selectedChurchId = e.target.value;
                                  newDestinations[index].destination = selectedChurch
                                    ? {
                                        lat: parseFloat(selectedChurch.latitude),
                                        lng: parseFloat(selectedChurch.longitude),
                                      }
                                    : null;
                                  setDestinations(newDestinations);
                                }}
                              >
                                <option value="">{`Select Church Destination ${index + 1}`}</option>
                                {churches.map((church) => (
                                  <option key={church.id} value={church.id}>
                                    {church.churchName}
                                  </option>
                                ))}
                              </Form.Control>
                            </Form.Group>
                          )}
                          {/* Delete Button */}
                          <Button
                            variant="link"
                            className="delete-div-btn"
                            onClick={() => {
                                // Remove the destination from the list
                                setDestinations((prevDestinations) =>
                                    prevDestinations.filter((_, i) => i !== index)
                                );

                                // Recalculate routes after deletion to reassign labels
                                handleCalculateRoute();
                            }}
                        >
                            <i className="bi bi-x-circle-fill"></i>
                        </Button>

                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>


            <Button variant="link" onClick={addDestination} style={{ marginTop: '1rem' }}>
              + Add another Church Destination
            </Button>

            <Button
              onClick={handleCalculateRoute}
              variant="primary"
              style={{ marginTop: '1rem', width: '100%' }}
            >
              Get Route
            </Button>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition || { lat: 0, lng: 0 }}
        zoom={13}
        onLoad={(mapInstance) => handleMapLoad(mapInstance, setMap, setCustomIcon, setLoading)}
      >
        {/* Render the directions if available */}
        {directionsResponse.map((segment, index) => (
          <DirectionsRenderer
            key={index}
            options={{
              directions: segment.result,
              polylineOptions: {
                strokeColor: segment.color, // Apply segment color
                strokeOpacity: 0.8, // Adjust opacity
                strokeWeight: 5, // Line thickness
              },
              suppressMarkers: true, // Disable default markers from DirectionsRenderer
            }}
          />
        ))}

        {/* Render the current position/start location marker unconditionally */}
        {currentPosition && (
          <Marker
            position={currentPosition}
            label={{
              text: "A", // Ensure the label "A" is always shown for current location
              color: "black", // Make the label more distinct if necessary
              fontWeight: "bold",
              fontSize: "16px",
            }}
            icon={{
              url: customIcon, // Use custom icon if available
              scaledSize: new window.google.maps.Size(30, 30), // Adjust size if needed
            }}
          />
        )}

        {/* Render the markers for destinations, starting from label 'B' */}
        {!loading &&
          uniqueDestinations.map((dest, index) => (
            <Marker
              key={`${dest.lat}-${dest.lng}`}
              position={dest}
              label={{
                text: String.fromCharCode('B'.charCodeAt(0) + index), // Labels starting from 'B'
                color: "black", // Ensure it is distinct and consistent
                fontWeight: "bold",
                fontSize: "16px",
              }}
              icon={{
                url: customIcon, // Use custom icon if available
                scaledSize: new window.google.maps.Size(30, 30), // Adjust size if needed
              }}
              onClick={() => handleMarkerClick(dest)}
            />
          ))}
      </GoogleMap>




    </LoadScript>
  );
};

export default VisitaIglesia;
