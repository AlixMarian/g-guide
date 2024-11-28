import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import AutocompleteSearch from '@components/mapfiles/AutocompleteSearch';

const AutoGen = ({ onBack }) => {
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(true);
  const [startLocation, setStartLocation] = useState(null);

  const handleGenerateRoute = () => {
    if (usingCurrentLocation) {
      console.log('Using current location for route generation.');
    } else if (startLocation) {
      console.log('Start location:', startLocation);
    } else {
      alert('Please provide a starting location.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        maxWidth: '400px',
        height: '100%',
        backgroundColor: '#FFFFFF',
        zIndex: 1000,
        padding: '1rem',
        overflowY: 'auto',
        boxShadow: '0 0 15px rgba(0,0,0,0.2)',
        borderRight: '1px solid #e0e0e0',
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button variant="outline-secondary" onClick={onBack}>
          <i className="bi bi-arrow-left me-2"></i> Back
        </Button>
        <h5 className="mb-0 fw-bold">Auto Generate Route</h5>
      </div>

      <Form>
        <Form.Group
          controlId="use-current-location"
          className="mb-3 d-flex align-items-center"
        >
          <Form.Check
            type="checkbox"
            label="Use Current Location"
            checked={usingCurrentLocation}
            onChange={() => setUsingCurrentLocation(!usingCurrentLocation)}
            className="me-2"
          />
        </Form.Group>

        {!usingCurrentLocation && (
          <Form.Group controlId="start-location" className="mb-3">
            <Form.Label>Start Location</Form.Label>
            <AutocompleteSearch
              onPlaceSelected={(location) => {
                console.log('Selected start location:', location);
                setStartLocation(location);
              }}
              placeholder="Enter starting point"
            />
          </Form.Group>
        )}

        <Button variant="primary" className="w-100 mt-3" onClick={handleGenerateRoute}>
          Generate Route
        </Button>
      </Form>
    </div>
  );
};

export default AutoGen;
