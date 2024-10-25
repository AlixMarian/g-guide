import PropTypes from 'prop-types'; 
import { Offcanvas } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import AutocompleteSearch from '../components/AutocompleteSearch';
import logo from '../assets/G-Guide LOGO.png';
import loadingGif from '../assets/Ripple@1x-1.0s-200px-200px.gif';

const SearchFilter = ({
  showMenu,
  handleCloseMenu,
  handlePlaceSelected,
  selectedService,
  handleServiceChange,
  servicesList,
  loading,
  filteredChurches,
  handleMarkerClick,
  handleCancel,
}) => {
  return (
    <Offcanvas show={showMenu} onHide={handleCloseMenu} placement="start" >
      <Offcanvas.Title>
        <div className="map-search-container">
          <div className="logo-container-center">
            <img
              src={logo}
              alt="Logo"
              style={{
                width: '60px',
                height: '60px',
                justifyContent: 'center',
                boxShadow: '2px 6px 6px rgba(0, 0, 0, 0.3)',
                borderRadius: '30px',
              }}
            />
            <h3
              style={{
                fontFamily: 'Roboto, sans-serif',
                marginTop: '0.8rem',
                fontWeight: 'bold',
              }}
            >
              G! Guide
            </h3>
            <button onClick={handleCloseMenu} className="back-button">
              <i className="bi bi-arrow-return-left"></i>
            </button>
          </div>
        </div>
      </Offcanvas.Title>
      <Offcanvas.Body >
        <div className="center-search">
          <div className="filter-input-group input-group">
            <AutocompleteSearch onPlaceSelected={handlePlaceSelected} />
            <button type="button" className="btn btn-custom-filter">
              <i className="fas fa-search"></i>
            </button>
          </div>
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

        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
              marginTop: '30px',
            }}
          >
            <img src={loadingGif} alt="Loading..." style={{ width: '100px', height: '100px' }} />
          </div>
        ) : filteredChurches.length > 0 ? (
            <div style={{ marginTop: '30px' }}>
              <h6 style={{ marginBottom: '20px' }}>
                {selectedService ? `Churches offering ${selectedService}:` : 'Nearby Churches:'}
              </h6>
              <div className="scrollable-section">
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
                    <div className="drawer-icon-text">
                      <i className="bi bi-pin-map-fill"></i>
                      <span>{`${church.distance.toFixed(2)} km away`}</span>
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
  );
};

// PropTypes
SearchFilter.propTypes = {
  showMenu: PropTypes.bool.isRequired,
  handleCloseMenu: PropTypes.func.isRequired,
  handlePlaceSelected: PropTypes.func.isRequired,
  selectedService: PropTypes.string.isRequired,
  handleServiceChange: PropTypes.func.isRequired,
  servicesList: PropTypes.arrayOf(PropTypes.string).isRequired,
  loading: PropTypes.bool.isRequired,
  filteredChurches: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      churchName: PropTypes.string.isRequired,
      churchLocation: PropTypes.string,
    })
  ).isRequired,
  handleMarkerClick: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
};

export default SearchFilter;
