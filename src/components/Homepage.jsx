import '../custom.css';
import { useNavigate } from 'react-router-dom';

export const Homepage = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
      navigate('/');
    };
    return (
    <div>
      <nav className="homePageNavbar navbar navbar-expand-lg sticky-top bg-body-tertiary">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            <img src="../src/assets/gGuideLogo.svg" alt="Logo" width="40" height="34" className="d-inline-block align-text-top" />
            G!Guide
          </a>
          
          <button type="button" className="btn btn-primary" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="container mt-4">
        <div className="row">
          <div className="col-12 mb-4">
            <div className="card bookappCard">
              <div className="card-body hmpgContainer1 d-flex align-items-center">
                <div className="card mb-3 flex-grow-1">
                  <div className="row g-0">
                    <div className="col-md-4">
                      <img src="../src/assets/mapImg.png" className="img-fluid rounded-start" alt="Example" />
                    </div>
                    <div className="col-md-8">
                      <div className="card-body">
                        <h5 className="card-title">In need of a local church?</h5>
                        <p className="card-text">We can help you find your nearest church, get up-to-date information, and connect with them</p>
                        <button type="button" className="btn btn-primary">Open Maps</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 mb-4">
            <div className="card">
              <div className="card-body hmpgContainer2 d-flex align-items-center">
                <div className="row flex-grow-1">

                  <div className="col-md-6 bookmarks">
                  
                    <h6>Bookmarks</h6>
                    <br></br>
                    <div className="card" style={{ width: '1wh' }}>
                      <div className="card-body">
                        <h5 className="card-title">Church Name</h5>
                        <p className="card-text">Church Location</p>
                        <a href="#" className="card-link">View church information</a>
                      </div>
                    </div>
                    <br></br>
                  </div>

                  <div className="col-md-6 appointments">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h6>My Appointments</h6>
                      <button type="button" className="btn btn-primary">View Appointment History</button>
                    </div>


                    <div className="card" style={{ width: '1wh' }}>
                      <div className="card-body">
                        <h5 className="card-title">Christening</h5>
                        <p className="card-text">Church Name and Location</p>
                        <p className="card-text">Date and Time</p>
                        <p className="card-text">Status</p>
                      </div>
                    </div>
                    <br></br>
                  </div>
                </div>

              </div>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
}