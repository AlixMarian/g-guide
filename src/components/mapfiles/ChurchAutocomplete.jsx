import { useState } from 'react';
import { Form, ListGroup } from 'react-bootstrap';
import PropTypes from 'prop-types';

const ChurchAutocomplete = ({ churches, onChurchSelected, placeholder = 'Search churches...' }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length > 0) {
      const filtered = churches.filter((church) =>
        church.churchName.toLowerCase().startsWith(value.toLowerCase())
      );
      
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (church) => {
    setQuery(church.churchName);
    setSuggestions([]);
    onChurchSelected(church);
  };

  return (
    <div style={{ position: 'relative' }}>
      <Form.Control
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        required
      />
      {suggestions.length > 0 && (
        <ListGroup style={{ position: 'absolute', zIndex: '1000', width: '100%', fontSize: '14px' }}>
          {suggestions.map((church) => (
            <ListGroup.Item key={church.id} action onClick={() => handleSelect(church)} required>
              <small className='fw-normal'>{church.churchName}</small> 
              <span>
                <small className="fw-light"> - {church.churchAddress || church.churchLocation}</small>
              </span>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

ChurchAutocomplete.propTypes = {
  churches: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      churchName: PropTypes.string.isRequired,
      churchAddress: PropTypes.string,
      churchLocation: PropTypes.string,
      latitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      longitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })
  ).isRequired,
  onChurchSelected: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

export default ChurchAutocomplete;