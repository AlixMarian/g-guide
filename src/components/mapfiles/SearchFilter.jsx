// SearchFilter.jsx

import PropTypes from 'prop-types';
import { Offcanvas, Alert, Spinner, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import AutocompleteSearch from './AutocompleteSearch';
import logo from '/src/assets/G-Guide LOGO.png';
import { handleMarkerClick as utilHandleMarkerClick } from './churchDataUtils';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react'; // Import useEffect for debugging

const SearchFilter = ({
  showMenu,
  handleCloseMenu,
  handlePlaceSelected,
  selectedService,
  handleServiceChange,
  servicesList,
  loading,
  filteredChurches,
  handleCancel,
  selectedLanguage,
  handleLanguageChange,
  drawerInfo,
  setDrawerInfo,
  churchPhoto,
  setChurchPhoto,
  showOtherDatesButton,
  handleShowAllDates,
}) => {
  const navigate = useNavigate(); // Initialize navigate

  // Debugging: Log drawerInfo whenever it updates
  useEffect(() => {
    console.log('drawerInfo updated:', drawerInfo);
  }, [drawerInfo]);

  const handleChurchClick = (church) => {
    utilHandleMarkerClick(church, setDrawerInfo, setChurchPhoto);
  };

  return (
    <>
      <Offcanvas show={showMenu} onHide={handleCloseMenu} placement="start">
        <Offcanvas.Header>
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
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="center-search">
            <div className="filter-input-group input-group">
              <AutocompleteSearch onPlaceSelected={handlePlaceSelected} />
              <button type="button" className="btn btn-custom-filter">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>
          <div className="mt-3 d-flex mb-1 justify-content-end">
            <div>
              <select
                value={selectedService}
                onChange={handleServiceChange}
                className="filter-form-select form-select p-1 me-1 ms-2"
                style={{ width: '5.8rem', fontSize: '14px' }}
              >
                <option value="">Services</option>
                {servicesList.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={selectedLanguage}
                onChange={handleLanguageChange}
                className="filter-form-select form-select p-1 me-1"
                style={{ width: '6.4rem', fontSize: '14px' }}
              >
                <option value="">Language</option>
                <option value="English">English</option>
                <option value="Cebuano">Cebuano</option>
              </select>
            </div>
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
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : filteredChurches.length > 0 ? (
            <div style={{ marginTop: '20px' }}>
              <h6 style={{ marginBottom: '20px' }}>
                {selectedService
                  ? `Churches offering ${selectedService}:`
                  : selectedLanguage
                  ? `Churches with services in ${selectedLanguage}:`
                  : 'Nearby Churches:'}
              </h6>
              <div className="scrollable-section">
                {filteredChurches.map((church, index) => (
                  <div
                    className="filtered-church-card"
                    key={`${church.churchName}-${index}`}
                    onClick={() => handleChurchClick(church)}
                    style={{ cursor: 'pointer', padding: '10px', borderBottom: '1px solid #ccc' }}
                  >
                    <h6>{church.churchName}</h6>

                    {selectedService && (
                      <>
                        <div className="drawer-icon-text" style={{ display: 'flex', alignItems: 'center' }}>
                          <i className="bi bi-geo-alt-fill" style={{ marginRight: '5px' }}></i>
                          <span>
                            {church.churchAddress
                              ? `${church.churchAddress}, ${church.distance?.toFixed(2) || '0.00'} km`
                              : 'Address not available'}
                          </span>
                        </div>
                        <div className="drawer-icon-text" style={{ display: 'flex', alignItems: 'center' }}>
                          <i className="bi bi-clock-fill" style={{ marginRight: '5px' }}></i>
                          <span>
                            {church.churchStartTime && church.churchEndTime
                              ? `${church.churchStartTime} - ${church.churchEndTime}`
                              : 'Service times not available'}
                          </span>
                        </div>
                      </>
                    )}

                    {selectedLanguage && (
                      <>
                        <div className="drawer-icon-text" style={{ display: 'flex', alignItems: 'center' }}>
                          <i className="bi bi-geo-alt-fill" style={{ marginRight: '5px' }}></i>
                          <span>
                            {church.churchLocation
                              ? `${church.churchLocation}, ${church.distance?.toFixed(2) || '0.00'} km`
                              : 'Address not available'}
                          </span>
                        </div>
                        <div className="drawer-icon-text" style={{ display: 'flex', alignItems: 'center' }}>
                          <i className="bi bi-calendar-event-fill" style={{ marginRight: '5px' }}></i>
                          <span>
                            {church.massDate && church.massTime
                              ? `${church.massDate} at ${church.massTime} (${church.massType || 'No Mass Type'})`
                              : 'No Mass Schedule'}
                          </span>
                        </div>
                        <div className="drawer-icon-text" style={{ display: 'flex', alignItems: 'center' }}>
                          <i className="bi bi-person-fill" style={{ marginRight: '5px' }}></i>
                          <span>{church.presidingPriest || 'No Presiding Priest'}</span>
                        </div>
                      </>
                    )}

                    {!selectedService && !selectedLanguage && (
                      <>
                        <div className="drawer-icon-text" style={{ display: 'flex', alignItems: 'center' }}>
                          <i className="bi bi-geo-alt-fill" style={{ marginRight: '5px' }}></i>
                          <span>
                            {church.churchLocation
                              ? `${church.churchLocation}, ${church.distance?.toFixed(2) || '0.00'} km`
                              : 'Address not available'}
                          </span>
                        </div>
                        <div className="drawer-icon-text" style={{ display: 'flex', alignItems: 'center' }}>
                          <i className="bi bi-clock-fill" style={{ marginRight: '5px' }}></i>
                          <span>
                            {church.churchStartTime && church.churchEndTime
                              ? `${church.churchStartTime} - ${church.churchEndTime}`
                              : 'Service times not available'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '30px' }}>
              <Alert variant="warning">
                No churches found{' '}
                {selectedService
                  ? 'offering the selected service.'
                  : selectedLanguage
                  ? 'for the selected language.'
                  : 'nearby.'}
                {showOtherDatesButton && (
                  <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <Button variant="outline-primary" onClick={handleShowAllDates}>
                      Display Other Dates
                    </Button>
                  </div>
                )}
              </Alert>
              <Button variant="outline-danger" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      {/* Offcanvas for Church Details */}
      <Offcanvas
        show={drawerInfo.show}
        onHide={() =>
          setDrawerInfo({
            ...drawerInfo,
            show: false,
          })
        }
        placement="end"
        className="custom-offcanvas"
      >
        <Offcanvas.Header>
          <div className="drawer-img-container">
            <img src={churchPhoto} alt="Church Cover" style={{ width: '100%', height: 'auto' }} />
          </div>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column">
          <div className="drawer-body-content">
            <Offcanvas.Title className="drawer-title">{drawerInfo.title}</Offcanvas.Title>

            <div className="drawer-content">
              <div className="drawer-icon-text" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <i className="bi bi-geo-alt-fill" style={{ marginRight: '5px' }}></i>
                <span>{drawerInfo.description}</span>
              </div>

              <div className="drawer-icon-text" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <i className="bi bi-telephone-fill" style={{ marginRight: '5px' }}></i>
                <span>{drawerInfo.telephone}</span>
              </div>

              {drawerInfo.churchStartTime && drawerInfo.churchEndTime && (
                <div className="drawer-icon-text" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <i className="bi bi-clock-fill" style={{ marginRight: '5px' }}></i>
                  <span>{`${drawerInfo.churchStartTime} - ${drawerInfo.churchEndTime}`}</span>
                </div>
              )}
            </div>
          </div>

          <button
            className="view-church-btn"
            style={{
              marginTop: 'auto',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '15px',
              cursor: 'pointer',
            }}
            onClick={() => {
              if (drawerInfo.id) {
                navigate(`/church-homepage/${drawerInfo.id}`);
                console.log('Church ID:', drawerInfo.id);
              } else {
                console.error('No church ID available for navigation.');
              }
            }}
          >
            View Church Information
          </button>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

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
      id: PropTypes.string,
      churchName: PropTypes.string.isRequired,
      churchLocation: PropTypes.string,
      massDate: PropTypes.string,
      massTime: PropTypes.string,
      massType: PropTypes.string,
      presidingPriest: PropTypes.string,
      churchAddress: PropTypes.string,
      churchStartTime: PropTypes.string,
      churchEndTime: PropTypes.string,
      distance: PropTypes.number,
    })
  ).isRequired,
  handleCancel: PropTypes.func.isRequired,
  selectedLanguage: PropTypes.string.isRequired,
  handleLanguageChange: PropTypes.func.isRequired,
  drawerInfo: PropTypes.shape({
    show: PropTypes.bool,
    id: PropTypes.string, // Ensure id is included
    title: PropTypes.string,
    description: PropTypes.string,
    telephone: PropTypes.string,
    churchStartTime: PropTypes.string,
    churchEndTime: PropTypes.string,
    massDate: PropTypes.string,
    massTime: PropTypes.string,
    massType: PropTypes.string,
    presidingPriest: PropTypes.string,
  }).isRequired,
  setDrawerInfo: PropTypes.func.isRequired,
  churchPhoto: PropTypes.string.isRequired,
  setChurchPhoto: PropTypes.func.isRequired,
  showOtherDatesButton: PropTypes.func.isRequired,
  handleShowAllDates: PropTypes.func.isRequired,
};

export default SearchFilter;
