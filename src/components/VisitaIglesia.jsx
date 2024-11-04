import '../websiteUser.css';
import React, { useState, useEffect, useRef } from 'react';
import {
  GoogleMap,
  LoadScript,
  DirectionsRenderer,
  Autocomplete,
  Marker,
} from '@react-google-maps/api';
import { Offcanvas, Button, Form } from 'react-bootstrap';
import { fetchChurchData } from '../components/churchDataUtils';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaBars } from 'react-icons/fa';
import loadingGif from '../assets/Ripple@1x-1.0s-200px-200px.gif';
import { handleMarkerClick, handleMapLoad, onZoomChanged } from '../components/churchDataUtils';

const containerStyle = {
  width: '100%',
  height: '700px',
};

const VisitaIglesia = () => {
  const [churches, setChurches] = useState([]);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [travelMode, setTravelMode] = useState('DRIVING');
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(true);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [startLocation, setStartLocation] = useState(null);
  const [startLocationInputValue, setStartLocationInputValue] = useState('');
  const [customIcon, setCustomIcon] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

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
      id: `dest-${Date.now()}`, // Unique ID based on timestamp
      destination: null,
      usingCustomDestination: false,
      inputValue: '',
      selectedChurchId: '',
    };
    setDestinations([...destinations, newDestination]);
    destinationRefs.current.push(React.createRef());
  };
  

  const handleCalculateRoute = () => {
    const org = usingCurrentLocation && currentPosition ? currentPosition : startLocation;
    if (!org) return alert('Please select a start location.');

    const destinationList = destinations.map((d) => d.destination);
    if (destinationList.some((dest) => !dest)) {
      alert('Please select or enter all destinations.');
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    const waypoints = destinationList.slice(0, -1).map((location) => ({ location, stopover: true }));

    directionsService.route(
      {
        origin: org,
        destination: destinationList[destinationList.length - 1],
        waypoints,
        travelMode: window.google.maps.TravelMode[travelMode],
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) setDirectionsResponse(result);
        else console.error(`Error fetching directions: ${status}`);
      }
    );
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
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={['places']}>
      <Button variant="primary" style={{zIndex: '999', position: 'absolute', top: '10px', left: '190px'}} onClick={() => setShowOffcanvas(true)}>
        Open Directions
      </Button>

      <Offcanvas show={showOffcanvas} style={{zIndex: '9999'}} onHide={() => setShowOffcanvas(false)} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Visita Iglesia Directions</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body style={{ overflow: 'visible' }}>
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
                            {/* Drag Handle */}
                            <FaBars {...provided.dragHandleProps} className="drag-handle" style={{ marginRight: '0.5rem' }} />

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

                            {/* Show Autocomplete if usingCustomDestination is true */}
                            {dest.usingCustomDestination ? (
                              <Autocomplete
                                onLoad={(autocomplete) => onLoadDestination(index, autocomplete)}
                                onPlaceChanged={() => onPlaceChangedDestination(index)}
                              >
                                <Form.Group controlId={`custom-destination-${index}`} style={{ flex: 1 }}>
                                  <Form.Control
                                    type="text"
                                    placeholder={`Enter Destination ${index + 1}`}
                                    style={{ fontSize: '14px', width: '18rem' }}
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
                              /* Show Dropdown if usingCustomDestination is false */
                              <Form.Group controlId={`select-destination-${index}`} style={{ flex: 1 }}>
                                <Form.Control
                                  as="select"
                                  value={dest.selectedChurchId}
                                  style={{ fontSize: '14px' }}
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

                            <Button
                              variant="link"
                              className="delete-div-btn"
                              onClick={() => {
                                setDestinations((prevDestinations) =>
                                  prevDestinations.filter((_, i) => i !== index)
                                );
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

            <Button onClick={handleCalculateRoute} variant="primary" style={{ marginTop: '1rem', width: '100%' }}>
              Get Route
            </Button>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>

      <GoogleMap mapContainerStyle={containerStyle} center={currentPosition || { lat: 0, lng: 0 }} zoom={13} onZoomChanged={onZoomChanged} onLoad={(mapInstance) => handleMapLoad(mapInstance, setMap, setCustomIcon, setLoading)}>
        {directionsResponse && <DirectionsRenderer options={{ directions: directionsResponse }} />}
        {currentPosition && <Marker position={currentPosition} />}
        {!loading &&
          customIcon &&
          churches.map((church) =>
            church.latitude && church.longitude ? (
              <Marker key={church.id} position={{ lat: parseFloat(church.latitude), lng: parseFloat(church.longitude) }} icon={customIcon} onClick={() => handleMarkerClick(church)} />
            ) : null
          )}
      </GoogleMap>
    </LoadScript>
  );
};

export default VisitaIglesia;
