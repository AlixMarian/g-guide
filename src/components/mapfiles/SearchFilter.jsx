//SearchFilter.jsx

import PropTypes from 'prop-types'; 
import { Offcanvas, Alert, Spinner, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import AutocompleteSearch from './AutocompleteSearch';
import logo from '/src/assets/G-Guide LOGO.png';
import { handleMarkerClick } from './churchDataUtils';

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
}) => {

  return (
    <>
      <Offcanvas show={showMenu} onHide={handleCloseMenu} placement="start">
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
        <Offcanvas.Body>
          <div className="center-search">
            <div className="filter-input-group input-group">
              <AutocompleteSearch onPlaceSelected={handlePlaceSelected} />
              <button type="button" className="btn btn-custom-filter">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>
          <div className='mt-3 d-flex mb-1 justify-content-end' >
          {/* <p className='small'>Filter by:</p> */}
            <div>
              <select value={selectedService} onChange={handleServiceChange} className="filter-form-select form-select p-1 me-1 ms-2" style={{width:'5.8rem', fontSize: '14px'}}>
                <option value="">Services</option>
                {servicesList.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>
            {/* **Language Filter Dropdown** */}
            <div>
              <select value={selectedLanguage} onChange={handleLanguageChange} className="filter-form-select form-select p-1 me-1" style={{width:'6.4rem', fontSize: '14px'}}>
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
              {selectedService || selectedLanguage ? `Churches offering ${selectedService || ''}${selectedService && selectedLanguage ? ' and ' : ''}${selectedLanguage || ''}:` : 'Nearby Churches:'}
              </h6>
              <div className="scrollable-section">
                {filteredChurches.map((church, index) => (
                  <div
                    className="filtered-church-card"
                    key={`${church.churchName}-${index}`}
                    onClick={() => handleMarkerClick(church, setDrawerInfo, setChurchPhoto)}
                    style={{ cursor: 'pointer' }}
                  >
                    <h6>{church.churchName}</h6>
                    <div className="drawer-icon-text">
                      <i className="bi bi-geo-alt-fill"></i>
                      <span>{church.churchLocation || 'Location not available'}</span>
                    </div>
                    <div className="drawer-icon-text">
                      <i className="bi bi-pin-map-fill"></i>
                      <span>{church.massDate && church.massTime ? `${church.massDate} at ${church.massTime} (${church.massType || 'No Mass Type'})` : 'No Mass Schedule'}</span>
                      </div>
                    <div className="drawer-icon-text">
                      <i className="bi bi-person-fill"></i>
                      <span>{church.presidingPriest || 'No Presiding Priest'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            selectedLanguage && (
              <div style={{ marginTop: '30px' }}>
                <Alert variant="warning">
                  No churches found for the selected language.
                </Alert>
                <Button variant="outline-danger" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            )
          )}
        </Offcanvas.Body>
      </Offcanvas>

      {/* Offcanvas for Church Details */}
      <Offcanvas show={drawerInfo.show} onHide={() => setDrawerInfo({ ...drawerInfo, show: false })} placement="end" className="custom-offcanvas">
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
                <span>{drawerInfo.description}</span> 
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
    })
  ).isRequired,
  handleCancel: PropTypes.func.isRequired,
  selectedLanguage: PropTypes.string.isRequired,
  handleLanguageChange: PropTypes.func.isRequired,
  drawerInfo: PropTypes.object.isRequired,
  setDrawerInfo: PropTypes.func.isRequired,
  churchPhoto: PropTypes.string.isRequired,
  setChurchPhoto: PropTypes.func.isRequired,
};

export default SearchFilter;
