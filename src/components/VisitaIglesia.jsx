import React, { useState, useEffect, useRef } from 'react';
import {
  GoogleMap,
  LoadScript,
  DirectionsRenderer,
  Autocomplete,
} from '@react-google-maps/api';
import { Offcanvas, Button, Form } from 'react-bootstrap';
import { fetchChurchData } from '../components/churchDataUtils';
//import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
//import { FaBars } from 'react-icons/fa'; // For the drag handle icon
import loadingGif from '../assets/Ripple@1x-1.0s-200px-200px.gif';

const containerStyle = {
  width: '100%',
  height: '600px',
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
  const [destinations, setDestinations] = useState([
    {
      id: 0,
      destination: null,
      usingCustomDestination: false,
      inputValue: '',
      selectedChurchId: '',
    },
  ]);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const startLocationRef = useRef(null);
  const destinationRefs = useRef([React.createRef()]);

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
        (error) => {
          console.error('Error getting current position:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  const onLoadStartLocation = (autocomplete) => {
    startLocationRef.current = autocomplete;
  };

  const onPlaceChangedStartLocation = () => {
    if (startLocationRef.current !== null) {
      const place = startLocationRef.current.getPlace();
      if (place && place.geometry && place.geometry.location) {
        setStartLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
        setStartLocationInputValue(place.formatted_address || place.name);
      }
    } else {
      console.log('Autocomplete is not loaded yet!');
    }
  };

  const onLoadDestination = (index, autocomplete) => {
    destinationRefs.current[index].current = autocomplete;
  };

  const onPlaceChangedDestination = (index) => {
    const ref = destinationRefs.current[index].current;
    if (ref) {
      const place = ref.getPlace();
      if (place && place.geometry && place.geometry.location) {
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
      id: destinations.length,
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

    if (!org) {
      alert('Please select a start location.');
      return;
    }

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
        waypoints: waypoints,
        travelMode: window.google.maps.TravelMode[travelMode],
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionsResponse(result);
        } else {
          console.error(`Error fetching directions: ${status}`);
        }
      }
    );
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedDestinations = Array.from(destinations);
    const [reorderedItem] = reorderedDestinations.splice(result.source.index, 1);
    reorderedDestinations.splice(result.destination.index, 0, reorderedItem);

    const reorderedRefs = Array.from(destinationRefs.current);
    const [reorderedRef] = reorderedRefs.splice(result.source.index, 1);
    reorderedRefs.splice(result.destination.index, 0, reorderedRef);

    destinationRefs.current = reorderedRefs;

    setDestinations(reorderedDestinations);
  };

  return loading ? (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <img src={loadingGif} alt="Loading..." style={{ width: '100px' }} />
    </div>
  ) : (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={['places']}
    >
      <Button variant="primary" onClick={() => setShowOffcanvas(true)}>
        Open Directions
      </Button>

      <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="start">
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
              <Autocomplete
                onLoad={onLoadStartLocation}
                onPlaceChanged={onPlaceChangedStartLocation}
              >
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
                      <Draggable key={`dest-${dest.id}`} draggableId={`dest-${dest.id}`} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={{
                              marginBottom: '1rem',
                              display: 'block',
                              alignItems: 'center',
                              ...provided.draggableProps.style,
                            }}
                          >
                            {/* Drag Handle */}
                            <FaBars {...provided.dragHandleProps} style={{ cursor: 'grab', marginRight: '0.5rem' }} />
                            <Form.Check
                              type="checkbox"
                              id={`use-custom-destination-${index}`}
                              label={`Enter Destination ${index + 1}`}
                              checked={dest.usingCustomDestination}
                              onChange={() => {
                                const newDestinations = [...destinations];
                                newDestinations[index].usingCustomDestination =
                                  !newDestinations[index].usingCustomDestination;
                                newDestinations[index].inputValue = '';
                                newDestinations[index].selectedChurchId = '';
                                newDestinations[index].destination = null;
                                setDestinations(newDestinations);
                              }}
                            />

                            {dest.usingCustomDestination ? (
                              <Autocomplete
                                onLoad={(autocomplete) => onLoadDestination(index, autocomplete)}
                                onPlaceChanged={() => onPlaceChangedDestination(index)}
                              >
                                <Form.Group controlId={`custom-destination-${index}`} style={{ flex: 1, marginLeft: '1rem' }}>
                                  <Form.Control
                                    type="text"
                                    placeholder={`Enter Destination ${index + 1}`}
                                    style={{width: '350px'}}
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
                              <Form.Group controlId={`select-destination-${index}`} style={{ flex: 1, marginLeft: '1rem' }}>
                                <Form.Control
                                  as="select"
                                  value={dest.selectedChurchId}
                                  onChange={(e) => {
                                    const selectedChurch = churches.find(
                                      (church) => church.id === e.target.value
                                    );
                                    const newDestinations = [...destinations];
                                    newDestinations[index].selectedChurchId = e.target.value;
                                    newDestinations[index].destination = {
                                      lat: parseFloat(selectedChurch.latitude),
                                      lng: parseFloat(selectedChurch.longitude),
                                    };
                                    setDestinations(newDestinations);
                                  }}
                                >
                                  <option value="">Select a Church Destination</option>
                                  {churches.map((church) => (
                                    <option key={church.id} value={church.id}>
                                      {church.churchName}
                                    </option>
                                  ))}
                                </Form.Control>
                              </Form.Group>
                            )}
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

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition || { lat: 14.5995, lng: 120.9842 }}
        zoom={13}
        onLoad={(mapInstance) => setMap(mapInstance)}
      >
        {directionsResponse && (
          <DirectionsRenderer
            options={{
              directions: directionsResponse,
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default VisitaIglesia;
