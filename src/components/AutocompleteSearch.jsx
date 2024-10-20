// AutocompleteSearch.jsx
import React, { useRef } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import PropTypes from 'prop-types';

const AutocompleteSearch = ({ onPlaceSelected }) => {
  const autocompleteRef = useRef(null);

  const onLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        onPlaceSelected(location);
      } else {
        console.error('No geometry found for the selected place.');
      }
    } else {
      console.error('Autocomplete is not loaded yet!');
    }
  };

  return (
    <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
      <input
        type="search"
        placeholder="Find your nearest church..."
        className="form-control"
        style={{ width: '300px' }}
      />
    </Autocomplete>
  );
};

AutocompleteSearch.propTypes = {
  onPlaceSelected: PropTypes.func.isRequired,
};

export default AutocompleteSearch;
